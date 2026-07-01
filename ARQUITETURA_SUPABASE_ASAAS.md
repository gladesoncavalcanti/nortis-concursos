# 🏗️ ARQUITETURA SUPABASE + ASAAS — Nortis Concursos

**Versão**: 1.0
**Complementa**: [`MASTERPLAN_NORTIS.md`](./MASTERPLAN_NORTIS.md) (visão enterprise de longo prazo) e [`ROADMAP_EXECUCAO_NORTIS.md`](./ROADMAP_EXECUCAO_NORTIS.md) (plano solo founder, Fases 1-5)
**Escopo**: arquitetura técnica concreta para Área do Aluno + venda de apostilas com download protegido, usando o frontend React atual + Supabase (backend) + Asaas (pagamentos)

---

## 0. DECISÃO DE ARQUITETURA ASSUMIDA

A investigação registrada no histórico deste projeto confirmou que a "integração PocketBase nativa da Hostinger Horizons" **não está implementada nem confirmada como acessível** no código atual — apenas pistas indiretas (ver seção de investigação anterior). Diante disso, esta arquitetura assume o **Caminho B**: substituir a API de e-commerce da Hostinger (catálogo, checkout) por um backend único no **Supabase** (Postgres + Auth + Storage + Edge Functions), com **Asaas** como gateway de pagamento (Pix, Boleto, Cartão). A Hostinger passa a servir apenas como hospedagem estática do frontend.

Se no futuro a Hostinger confirmar uma integração PocketBase real e utilizável, esta arquitetura pode ser adaptada — a maior parte do desenho (tabelas, fluxos, Edge Functions) é portável entre backends Postgres-based.

---

## 1. ARQUITETURA GERAL

```
┌──────────────────────────────────────────────────────────────┐
│  FRONTEND — React + Vite (sem mudança de framework)           │
│  Hospedado na Hostinger Horizons (build estático)              │
└───────────────────────────┬────────────────────────────────────┘
                            │ HTTPS (fetch / supabase-js SDK)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  SUPABASE (backend gerenciado, plano gratuito/starter)         │
│  ┌────────────┬──────────────┬───────────────┬──────────────┐ │
│  │ Auth        │ Postgres     │ Storage        │ Edge Functions│ │
│  │ (login,     │ (products,   │ (PDFs, bucket  │ (create-order,│ │
│  │ cadastro,   │ orders,      │ privado)       │ asaas-webhook,│ │
│  │ sessão)     │ enrollments) │                │ get-download- │ │
│  │             │              │                │ url)          │ │
│  └────────────┴──────────────┴───────────────┴──────────────┘ │
└───────────────────────────┬────────────────────────────────────┘
                            │ REST API (server-side, service_role)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  ASAAS (gateway de pagamento brasileiro)                       │
│  Pix · Boleto · Cartão de crédito · Checkout hospedado          │
│  Webhooks de confirmação de pagamento                          │
└──────────────────────────────────────────────────────────────┘
```

### Stack por camada

| Camada | Tecnologia | Observação |
|---|---|---|
| Frontend | React 18 + Vite (atual, sem reescrita) | Continua hospedado na Hostinger |
| Autenticação | Supabase Auth | E-mail/senha, sessão gerenciada pelo SDK, sem senha em texto puro |
| Banco de dados | Postgres (Supabase) | Uma única fonte de verdade para catálogo, pedidos e acessos |
| Armazenamento de PDFs | Supabase Storage (bucket privado) | Nunca exposto via URL pública; só via URL assinada de curta duração |
| Lógica de servidor | Supabase Edge Functions (Deno) | `create-order`, `asaas-webhook`, `get-download-url` |
| Pagamentos | Asaas | Pix, Boleto, Cartão via checkout hospedado — dados de cartão nunca tocam nosso backend |
| E-mail transacional | Resend ou Brevo (free tier) | Confirmação de compra, verificação de e-mail via Supabase |

---

## 2. TABELAS NECESSÁRIAS

### Modelo de dados (visão geral)

```
auth.users (Supabase Auth)
     │ 1:1
     ▼
profiles (full_name, phone, role)
     │ 1:N                              1:N
     ├──────────────► orders ──────────────► order_items ──────► products
     │                  │ 1:N                                        ▲
     │                  ▼                                            │
     └──────────────► enrollments ───────────────────────────────────┘
     │ 1:N                    ▲
     ▼                        │ N:1
  downloads (auditoria) ──────┘

coupons ──── aplicado em orders (código validado no momento da compra)
asaas_webhook_events ──── log bruto de eventos recebidos da Asaas (debug)
```

### DDL completo

```sql
-- =========================================================
-- PROFILES (extensão de auth.users)
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- PRODUCTS (apostilas)
-- =========================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  pdf_path text not null,        -- caminho no Storage privado, NUNCA url pública
  price_cents integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- ORDERS (pedidos)
-- =========================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded', 'expired')),
  total_cents integer not null,
  coupon_code text,
  discount_cents integer not null default 0,

  -- Integração Asaas
  asaas_customer_id text,
  asaas_payment_id text unique,
  payment_method text check (payment_method in ('PIX', 'BOLETO', 'CREDIT_CARD')),
  checkout_url text,

  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_asaas_payment on public.orders(asaas_payment_id);

-- =========================================================
-- ORDER ITEMS
-- =========================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  price_cents integer not null   -- snapshot do preço no momento da compra
);

-- =========================================================
-- ENROLLMENTS (acesso liberado)
-- =========================================================
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  order_id uuid references public.orders(id),
  status text not null default 'active' check (status in ('active', 'revoked', 'expired')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,          -- null = acesso vitalício

  unique (user_id, product_id)
);

create index idx_enrollments_user on public.enrollments(user_id);

-- =========================================================
-- DOWNLOADS (auditoria + rate limit)
-- =========================================================
create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  product_id uuid not null references public.products(id),
  ip_address text,
  user_agent text,
  downloaded_at timestamptz not null default now()
);

create index idx_downloads_user_product_date
  on public.downloads(user_id, product_id, downloaded_at);

-- =========================================================
-- COUPONS (versão enxuta)
-- =========================================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null,
  max_uses integer,
  uses_count integer not null default 0,
  active boolean not null default true,
  valid_until timestamptz
);

-- =========================================================
-- ASAAS WEBHOOK LOG (debug/auditoria)
-- =========================================================
create table public.asaas_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text,
  payload jsonb not null,
  processed boolean not null default false,
  received_at timestamptz not null default now()
);
```

### Row Level Security (obrigatório — sem isso qualquer usuário lê a tabela inteira)

```sql
alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.enrollments enable row level security;
alter table public.downloads enable row level security;
alter table public.products enable row level security;

-- Produto: leitura pública dos ativos, escrita só admin
create policy "products_public_read" on public.products
  for select using (active = true);
create policy "products_admin_write" on public.products
  for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Profile: cada um vê/edita o próprio
create policy "profiles_self" on public.profiles
  for select using (auth.uid() = id);

-- Orders/Enrollments: cada um vê só os seus; admin vê tudo
create policy "orders_self" on public.orders
  for select using (auth.uid() = user_id);
create policy "enrollments_self" on public.enrollments
  for select using (auth.uid() = user_id);
create policy "orders_admin_all" on public.orders
  for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
```

**Storage dos PDFs**: bucket `apostilas-pdf` criado como **privado** (sem policy de leitura para `anon`/`authenticated`). Ninguém lê direto do bucket — só a Edge Function `get-download-url`, rodando com `service_role` (que ignora RLS deliberadamente), gera URL assinada de curta duração após checar `enrollments`.

---

## 3. FLUXO DE COMPRA

```
1. Usuário navega /apostilas
   → produtos vêm de public.products (leitura pública via RLS)

2. Adiciona ao carrinho (useCart.jsx, client-side — sem mudança estrutural)

3. Checkout exige login (se anônimo, redireciona pra /login com retorno)

4. Frontend chama Edge Function `create-order`
   POST /functions/v1/create-order
   Authorization: Bearer <jwt do usuário>
   Body: { items: [{ product_id, quantity }], coupon_code? }

5. Edge Function (service_role):
   a. Revalida preço de cada produto NO SERVIDOR (nunca confia no preço do client)
   b. Aplica cupom se houver e for válido
   c. Cria linha em `orders` (status='pending') + `order_items`
   d. Cria/recupera cliente na Asaas (POST /v3/customers, guarda asaas_customer_id)
   e. Cria cobrança na Asaas (POST /v3/payments ou paymentLink),
      billingType permitindo Pix/Boleto/Cartão à escolha do cliente na página da Asaas
   f. Salva asaas_payment_id + checkout_url em `orders`
   g. Retorna { checkout_url } pro frontend

6. Frontend redireciona: window.location.href = checkout_url
   (mesmo padrão que ShoppingCart.jsx já usa hoje com a Hostinger)

7. Cliente paga na página hospedada da Asaas (Pix/Boleto/Cartão)
   → dados de cartão nunca passam pelo nosso backend (fora de escopo PCI)

8. Asaas dispara webhook → Edge Function `asaas-webhook` (endpoint público)
   Eventos relevantes: PAYMENT_CONFIRMED, PAYMENT_RECEIVED

9. Edge Function `asaas-webhook`:
   a. Valida o token/assinatura do webhook (header enviado pela Asaas)
   b. Loga o payload bruto em asaas_webhook_events (debug)
   c. Localiza order por asaas_payment_id
   d. Atualiza orders.status = 'paid', paid_at = now()
   e. Para cada order_item → cria enrollment (status='active')
   f. (opcional) dispara e-mail de confirmação via Resend/Brevo

10. Cliente é redirecionado pra /success (successUrl da Asaas)
    → como o webhook pode chegar alguns segundos depois do redirect,
      /success NÃO deve fingir confirmação instantânea:
      exibe "processando pagamento" e faz polling curto (ou Supabase Realtime
      no canal de `enrollments`) até o acesso aparecer, com fallback
      "verifique em Minha Conta em alguns minutos".
```

---

## 4. FLUXO DE LIBERAÇÃO DE APOSTILAS (DOWNLOAD PROTEGIDO)

```
1. Aluno logado acessa /minha-conta
   → SELECT enrollments JOIN products WHERE user_id = auth.uid() AND status = 'active'
     (RLS garante isolamento automático)

2. Clica "Baixar" → frontend chama Edge Function `get-download-url`
   POST /functions/v1/get-download-url
   Authorization: Bearer <jwt>
   Body: { product_id }

3. Edge Function (service_role, ignora RLS de propósito):
   a. Extrai user_id do JWT
   b. Verifica enrollment ativo e não expirado para (user_id, product_id)
      → se não → 403 "Acesso não encontrado"
   c. Conta downloads de hoje (user_id, product_id) na tabela `downloads`
      → se >= limite diário (ex. 5) → 429 "Limite de downloads atingido"
   d. Busca o PDF original do bucket privado `apostilas-pdf`
   e. Aplica marca d'água (nome + e-mail do aluno) com `pdf-lib`
      (roda no runtime Deno da Edge Function)
   f. Registra o download em `downloads` (auditoria)
   g. Devolve o arquivo já marcado como resposta HTTP
      (Content-Type: application/pdf, Content-Disposition: attachment)
```

### Duas variantes de implementação

| | Variante A — sob demanda | Variante B — cache por usuário |
|---|---|---|
| Quando gera a marca d'água | A cada clique em "Baixar" | Uma vez, reaproveita depois |
| Complexidade | Baixa | Média (gerenciar cache/expiração) |
| Custo de storage extra | Zero | Um arquivo watermarked por (usuário × produto) |
| Recomendação | ✅ Começar aqui (MVP) | Revisitar só se o PDF for grande/lento de marcar repetidamente |

### Nota de segurança realista

DRM perfeito não existe para PDF. O objetivo é **elevar o custo de redistribuição o suficiente para desincentivar a maioria**, não bloquear 100% dos casos:

1. PDF nunca em URL pública fixa — sempre via URL/arquivo servido sob checagem de `enrollment`.
2. Rate limit de download (ex. 5/dia por produto) corta o caso mais comum de abuso.
3. Marca d'água com nome + e-mail do comprador — desincentiva redistribuição porque o vazamento é rastreável.
4. Log de auditoria (`downloads`) permite identificar contas que abusam do limite.
5. Termos de uso deixando explícito que o compartilhamento cancela o acesso.

---

## 5. ARQUIVOS QUE SERÃO ALTERADOS

### Estrutura de pastas (novos itens em destaque)

```
horizons-export-.../
├── apps/
│   └── web/
│       ├── src/
│       │   ├── api/
│       │   │   ├── EcommerceApi.js        # DEPRECIADO
│       │   │   ├── products.js            # ➕ NOVO
│       │   │   ├── orders.js              # ➕ NOVO
│       │   │   ├── enrollments.js         # ➕ NOVO
│       │   │   └── downloads.js           # ➕ NOVO
│       │   ├── lib/
│       │   │   ├── supabase.js            # ➕ NOVO
│       │   │   └── utils.js               # sem mudança
│       │   ├── contexts/
│       │   │   └── AuthContext.jsx        # ✏️ REESCRITO
│       │   ├── components/
│       │   │   ├── ProtectedRoute.jsx     # sem mudança de interface
│       │   │   ├── AdminRoute.jsx         # ➕ NOVO
│       │   │   └── ...                    # demais mantidos
│       │   ├── pages/
│       │   │   ├── MyAccountPage.jsx      # ✏️ REESCRITO
│       │   │   ├── SuccessPage.jsx        # ✏️ REESCRITO
│       │   │   ├── ApostilasPage.jsx      # ✏️ troca fonte de dados
│       │   │   ├── ProductDetailPage.jsx  # ✏️ troca fonte de dados
│       │   │   ├── admin/                 # ➕ NOVO diretório
│       │   │   │   ├── AdminDashboardPage.jsx
│       │   │   │   ├── AdminProductsPage.jsx
│       │   │   │   └── AdminOrdersPage.jsx
│       │   │   └── ...                    # demais mantidos
│       │   ├── components/ShoppingCart.jsx # ✏️ troca checkout Hostinger → Asaas
│       │   ├── hooks/useCart.jsx           # ✏️ ajuste de formato do item
│       │   └── App.jsx                     # ✏️ adiciona rotas /admin/*
│       ├── .env.example                    # ➕ NOVO
│       └── .env                             # ➕ NOVO (git-ignored)
│
└── supabase/                              # ➕ NOVO — projeto Supabase CLI
    ├── config.toml
    ├── migrations/
    │   └── 20260701_init.sql              # schema completo da seção 2
    └── functions/
        ├── create-order/index.ts
        ├── asaas-webhook/index.ts
        └── get-download-url/index.ts
```

### Tabela de alterações por arquivo

| Arquivo | Ação |
|---|---|
| `apps/web/package.json` | Adicionar `@supabase/supabase-js`; avaliar remover dependência da Hostinger Ecommerce API |
| `apps/web/.env` / `.env.example` | **Criar** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, chaves da Asaas nas Edge Functions (nunca no frontend) |
| `apps/web/src/lib/supabase.js` | **Criar** — cliente singleton (`createClient`) |
| `apps/web/src/contexts/AuthContext.jsx` | **Reescrever** — trocar `localStorage` por `supabase.auth.*`, manter interface pública (`user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout`) |
| `apps/web/src/api/products.js` | **Criar** — substitui `getProducts`/`getProduct` da Hostinger |
| `apps/web/src/api/orders.js` | **Criar** — chama a Edge Function `create-order` |
| `apps/web/src/api/enrollments.js` | **Criar** — lista "minhas apostilas" |
| `apps/web/src/api/downloads.js` | **Criar** — chama `get-download-url` |
| `apps/web/src/components/ShoppingCart.jsx` | Trocar `initializeCheckout` (Hostinger) por `orders.js` (Edge Function + Asaas) |
| `apps/web/src/hooks/useCart.jsx` | Ajustar formato do item (de `variant`/Hostinger para `product` simples do Supabase); lógica de estado local não muda |
| `apps/web/src/pages/ApostilasPage.jsx` / `ProductDetailPage.jsx` | Trocar fonte de dados de `EcommerceApi.js` para `api/products.js` |
| `apps/web/src/pages/MyAccountPage.jsx` | **Reescrever** — trocar array mockado `purchasedApostilas` por dados reais de `enrollments.js`; botão "Baixar" chama `downloads.js` |
| `apps/web/src/pages/SuccessPage.jsx` | **Reescrever** — aguardar/confirmar enrollment em vez de copy estática |
| `apps/web/src/components/AdminRoute.jsx` | **Criar** |
| `apps/web/src/pages/admin/*` | **Criar** (dashboard, produtos, pedidos) |
| `apps/web/src/App.jsx` | Adicionar rotas `/admin/*` protegidas por `AdminRoute` |
| `apps/web/src/api/EcommerceApi.js` | **Depreciar/remover** se o catálogo migrar 100% para Supabase |
| `supabase/migrations/*.sql` | **Criar** — schema completo da seção 2 |
| `supabase/functions/create-order/index.ts` | **Criar** |
| `supabase/functions/asaas-webhook/index.ts` | **Criar** |
| `supabase/functions/get-download-url/index.ts` | **Criar** |

---

## 6. FASES DE IMPLEMENTAÇÃO

Alinhado ao ritmo solo founder já estabelecido no `ROADMAP_EXECUCAO_NORTIS.md`, mas detalhado para esta stack específica.

### Fase 1 — Fundação Supabase (1-2 semanas)
- Criar projeto Supabase (plano free).
- Rodar migration inicial (`profiles`, `products`, RLS básico, trigger `handle_new_user`).
- Configurar Supabase Auth (confirmação de e-mail obrigatória, templates em pt-BR).
- Criar `lib/supabase.js` e reescrever `AuthContext.jsx`.
- Conectar `LoginPage.jsx`/`SignupPage.jsx` já existentes ao novo contexto (sem mudança visual).
- **Critério de pronto**: cadastro e login reais funcionando, sessão persistente, senha nunca em texto puro.

### Fase 2 — Catálogo de Produtos no Supabase (1 semana)
- Migrar apostilas existentes para a tabela `products` (cadastro manual ou script único).
- Criar `api/products.js`.
- Trocar fonte de dados em `ApostilasPage.jsx` e `ProductDetailPage.jsx`.
- **Critério de pronto**: catálogo funciona 100% a partir do Supabase, loja visualmente idêntica à atual.

### Fase 3 — Integração Asaas + Fluxo de Compra (2-3 semanas)
- Criar conta Asaas (sandbox primeiro, depois produção).
- Implementar Edge Function `create-order` (criação de cliente/cobrança na Asaas).
- Implementar Edge Function `asaas-webhook` (validação de assinatura, atualização de `orders`, criação de `enrollments`).
- Atualizar `ShoppingCart.jsx` para chamar `orders.js` em vez da Hostinger.
- **Critério de pronto**: compra completa via Pix/Boleto/Cartão gera `enrollment` automaticamente, sem intervenção manual.

### Fase 4 — Área do Aluno + Download Protegido (2 semanas)
- Implementar Edge Function `get-download-url` (checagem de enrollment, rate limit, marca d'água com `pdf-lib`).
- Reescrever `MyAccountPage.jsx` com dados reais.
- Reescrever `SuccessPage.jsx` com confirmação real (polling/Realtime).
- **Critério de pronto**: aluno compra, é redirecionado, vê a apostila em "Minha Conta" e baixa o PDF com marca d'água em poucos minutos, sem ajuda manual.

### Fase 5 — Painel Administrativo (2 semanas)
- Criar `AdminRoute.jsx` e rotas `/admin/*`.
- CRUD de produtos (título, preço, upload de PDF/capa).
- Lista de pedidos com filtro por status/data.
- Lista de alunos com o que cada um comprou (suporte manual).
- Métricas mínimas: receita do mês, nº de vendas, produto mais vendido.
- **Critério de pronto**: dono do negócio cadastra apostila nova e resolve problema de aluno sem tocar no banco de dados diretamente.

### Fase 6 — Refinamentos (contínuo)
- Cupons de desconto (tabela `coupons` já criada na Fase 1, falta UI + validação no `create-order`).
- E-mail transacional de confirmação de compra (Resend/Brevo).
- Ajustes de UX no checkout e mensagens de erro de pagamento.
- Deprecar/remover `EcommerceApi.js` definitivamente após confirmar que nada mais depende dele.

---

**Documento preparado por**: Arquiteto de Software Sênior
**Complementa**: `MASTERPLAN_NORTIS.md`, `ROADMAP_EXECUCAO_NORTIS.md`
**Versão**: 1.0
