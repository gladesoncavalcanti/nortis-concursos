# 🚀 ROADMAP DE EXECUÇÃO — NORTIS CONCURSOS

**Plano prático para empreendedor solo (não para equipe)**

**Versão**: 1.0
**Complementa**: [`MASTERPLAN_NORTIS.md`](./MASTERPLAN_NORTIS.md) — este documento reduz aquele escopo enterprise a algo executável por **uma pessoa**, com orçamento real de bootstrapping.

---

## 0. COMO LER ESTE DOCUMENTO

O `MASTERPLAN_NORTIS.md` descreve a plataforma **ideal** (arquitetura de microserviços, K8s, equipe de 4-5 pessoas, R$ 453,6 mil). Esse documento é uma referência de "para onde a plataforma pode crescer se virar empresa", **não um plano de ação para agora**.

Este roadmap parte de três decisões diferentes:

1. **Sem reescrita.** O frontend React + Vite atual continua. Não migramos para Next.js nesta fase — SEO forte pode esperar até haver produto/receita provados.
2. **Sem infraestrutura própria.** Nada de servidores para gerenciar, Kubernetes, filas, Elasticsearch. Tudo via serviços gerenciados com plano gratuito ou baixo custo (PocketBase/Supabase, Mercado Pago/Asaas, Resend/Brevo).
3. **Aproveitar o que já existe.** O projeto já roda na Hostinger Horizons e já usa a API de e-commerce da Hostinger (`EcommerceApi.js`), que foi desenhada para se integrar com um sistema de usuários **PocketBase nativo da plataforma** — hoje não utilizado. A Fase 1 investiga e ativa isso antes de considerar montar backend do zero.

### Princípios que guiam toda decisão técnica abaixo

```
1. RECEITA > COMPLETUDE     → priorizar o que aumenta conversão/retenção, não o que "parece profissional"
2. GERENCIADO > CUSTOM      → toda peça de infra deve ter opção de plano gratuito/baixo custo, sem servidor pra você operar
3. INCREMENTAL > BIG BANG   → a loja atual nunca para de vender durante a transição
4. MEDIR > ADIVINHAR        → a partir da Fase 5, prioridade vem de dado real de uso, não de backlog fixo
5. DEFESA REALISTA > DRM    → proteção de PDF é sobre desincentivar cópia, não impedir 100% dos casos
```

### Stack recomendado (visão geral)

| Camada | MASTERPLAN (enterprise) | Este roadmap (solo) |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | React + Vite atual (sem mudança) |
| Backend/Auth | NestJS + microserviços | PocketBase nativo do Horizons (investigar) → fallback Supabase |
| Banco de dados | PostgreSQL + Redis + Elasticsearch | 1 banco só (Postgres do Supabase ou SQLite do PocketBase) |
| Armazenamento de PDFs | S3 + CloudFront | Storage do PocketBase/Supabase com URL assinada |
| Pagamentos | Stripe (+ erro: "Pix via Klarna") | **Mercado Pago Checkout Pro** ou **Asaas** (Pix/boleto/cartão nativos, BR) |
| Orquestração | Kubernetes + Docker Compose | Nenhuma — deploy direto na Hostinger/Vercel |
| Admin | App Next.js separado | Rota `/admin` dentro do próprio app React |
| Blog | CMS com editor WYSIWYG + comentários | Tabela simples + markdown, sem CMS |
| Equipe | 4-5 pessoas | 1 pessoa, part-time |
| Orçamento mensal | ~R$ 38 mil | **R$ 0–300** + taxas de gateway |

---

## FASE 1 — MVP (Fundação Real)

**Objetivo**: sair da autenticação de brinquedo (localStorage) para contas reais vinculadas às compras, sem derrubar a loja que já funciona, e sem construir um backend do zero se não for necessário.

**Duração estimada**: 3–4 semanas (part-time, 10–15h/semana)
**Custo no período**: R$ 0–50/mês

### O que entra

- [ ] **Investigar o PocketBase nativo do Horizons**: acessar o painel Hostinger Horizons e confirmar se há uma coleção `users` PocketBase exposta para o projeto (a API de checkout já espera `customer.external_id` referenciando esse registro — ver `src/api/EcommerceApi.js:318-330`).
  - Se **sim**: usar o SDK JS do PocketBase (`pocketbase` no npm) direto no frontend para registro/login/sessão. Ganho: zero infraestrutura nova, e as compras passam a ser vinculadas à conta certa automaticamente.
  - Se **não** (plano não expõe isso, ou está bloqueado): usar **Supabase** (Auth + Postgres + Storage, tudo grátis até ~50k usuários ativos/mês) como backend próprio, mantendo o mesmo objetivo.
- [ ] Reescrever `AuthContext.jsx` para consumir o backend real escolhido (nada de `localStorage.setItem('nortis_users', ...)` com senha em texto puro).
- [ ] Verificação de e-mail obrigatória antes de habilitar downloads (necessário desde já, pois será pré-requisito da Fase 2).
- [ ] Conectar o checkout: `ShoppingCart.jsx` (`handleCheckout`) passa a enviar `customer: { external_id, email }` para `initializeCheckout`, vinculando a compra à conta logada.
- [ ] **Corrigir bugs críticos já identificados no diagnóstico**:
  - `useCart.jsx:69-73` — `getCartTotal()` quebra com carrinho vazio (acessa `cartItems[0]` sem checar).
  - `ProductsList.jsx` — chamada a `getProductQuantities`, confirmar que existe e está tratada com try/catch.
  - Rota `/atualizacoes` existe em `pages/` mas não está registrada em `App.jsx`.
  - `ProductDetailPage.jsx:133` — sanitizar `dangerouslySetInnerHTML` com **DOMPurify** antes de renderizar `product.description`.
  - Mover `ECOMMERCE_API_URL` / `ECOMMERCE_STORE_ID` para variáveis de ambiente (`.env`), criar `.env.example`.
- [ ] Estados de loading/erro consistentes nas páginas que ainda não têm (usar os componentes `Skeleton`/`Spinner` já existentes em `components/ui`).

### O que fica de fora (adiado de propósito)

OAuth social, 2FA, auditoria de login, rate limiting sofisticado, painel administrativo, simulados, download de PDF (isso é Fase 2 — a Fase 1 só resolve *quem é o usuário*).

### Critério de "pronto"

Um visitante cria conta de verdade (senha com hash, não plaintext), faz login, compra uma apostila, e a compra fica de fato associada à conta dele no backend — não apenas em `localStorage` do navegador. A loja continua funcionando exatamente como hoje para quem não migrou de fluxo.

---

## FASE 2 — Área do Aluno

**Objetivo**: dar ao aluno logado um motivo concreto para voltar ao site: ver o que comprou, baixar com segurança, e testar conhecimento em um simulado simples.

**Duração estimada**: 4–6 semanas
**Custo no período**: R$ 0–100/mês (ainda dentro de free tiers)

### O que entra

- [ ] **Tabela `enrollments`**: liga `user_id` (do backend da Fase 1) a `product_id` (da Hostinger) com status e data de expiração de acesso.
- [ ] **Sincronização de pedido pago → enrollment**: via webhook da Hostinger Ecommerce API se disponível; caso não haja webhook configurável nesse plano, um polling simples (checar pedidos novos do usuário logado ao entrar na área dele) resolve na prática.
- [ ] **Download protegido "realista"** (não DRM perfeito — ver seção de segurança abaixo):
  - Checagem de `enrollment` ativo antes de liberar qualquer link.
  - URL assinada de curta duração (10–15 min) gerada pelo backend (PocketBase/Supabase Storage já suportam isso nativamente).
  - Limite simples de downloads/dia por produto (ex: 5/dia) guardado em uma tabela de auditoria (`user_downloads`).
  - Marca d'água leve (nome + e-mail do comprador) aplicada ao PDF com **`pdf-lib`** (biblioteca JS gratuita, roda em função serverless — sem custo de licença).
- [ ] **Dashboard "Minhas Apostilas"**: lista o que foi comprado, botão de baixar, data de expiração de acesso. Sem gamificação, sem progresso de leitura ainda.
- [ ] **Simulado v1** (o mínimo que já entrega valor):
  - Um tipo de quiz só (múltipla escolha simples), sem timer sofisticado.
  - Banco de questões cadastrado manualmente (10–20 questões por apostila já cobre o suficiente para validar o recurso).
  - Resultado individual: % de acerto + lista do que errou. **Sem** comparação com turma, sem análise de IA — isso entra só se o recurso for usado de fato.

### O que fica de fora

Fórum/comunidade, gamificação (pontos/badges/ranking), plano de estudos com IA, múltiplos tipos de prova, exportação de resultado em PDF.

### Critério de "pronto"

Um aluno que comprou uma apostila consegue logar, ver ela listada na área dele, baixar o PDF com marca d'água em segurança, e fazer pelo menos um simulado de teste com resultado exibido na tela.

---

## FASE 3 — Pagamentos

**Objetivo**: ter Pix, boleto e cartão parcelado funcionando de forma confiável, com liberação de acesso automática — e decidir com dados (não suposição) se vale a pena sair do checkout hospedado da Hostinger.

**Duração estimada**: 3–5 semanas
**Custo no período**: sem mensalidade fixa — apenas taxas por transação (Mercado Pago: ~4,99% cartão à vista, ~0,99% Pix, boleto com taxa fixa por emissão)

### O que entra

- [ ] **Primeiro passo, antes de qualquer integração nova**: confirmar no painel Hostinger se a Ecommerce API já suporta Pix/boleto nativamente. Se sim, essa fase encolhe para "apenas ligar o webhook de pagamento aprovado ao `enrollment`" da Fase 2 — sem trocar de gateway.
- [ ] **Se não suportar nativamente**: integrar **Mercado Pago Checkout Pro** (ou Asaas como alternativa) só para os produtos digitais (apostilas), mantendo a Hostinger para o resto se houver outros produtos físicos/diferentes.
  - Cartão de crédito com parcelamento nativo (até 12x, já resolvido pelo gateway).
  - Pix com QR code + copia-e-cola.
  - Boleto bancário.
  - Webhook de confirmação de pagamento → cria `enrollment` automaticamente (reaproveita a tabela da Fase 2).
- [ ] **Cupom de desconto simples**: uma tabela (`coupons`), tipos percentual ou valor fixo, sem BOGO/afiliado/regras condicionais complexas ainda.
- [ ] **E-mail transacional**: confirmação de compra + link de acesso, via Resend ou Brevo (planos gratuitos cobrem o volume inicial confortavelmente).
- [ ] Página de erro de pagamento clara (hoje `ShoppingCart.jsx` só mostra um toast genérico) e reforço de mensagens de segurança no checkout (ex.: "pagamento processado por [gateway], seus dados não passam pelo nosso servidor").

### O que fica de fora

Split de pagamento automático para afiliados, assinatura recorrente, antifraude customizado (o gateway já cobre o nível básico necessário nessa escala), múltiplas moedas.

### Critério de "pronto"

Um cliente compra com Pix, cartão ou boleto, recebe e-mail de confirmação, e o acesso à apostila aparece automaticamente na área dele — **sem você precisar liberar nada manualmente**.

---

## FASE 4 — Painel Administrativo

**Objetivo**: parar de editar produto/preço na mão via múltiplos painéis e ter uma tela própria para cadastrar apostila, ver vendas e resolver problema de aluno rapidamente.

**Duração estimada**: 3–4 semanas
**Custo no período**: R$ 0 adicional (reaproveita o backend já contratado)

### O que entra

- [ ] Rota `/admin` **dentro do próprio app React** (não um app Next.js separado), protegida por checagem de `role === 'admin'` no backend escolhido — reaproveita os 55 componentes `shadcn`/Radix já existentes no projeto (`Table`, `Dialog`, `Card`, `Badge`, etc.), sem precisar de biblioteca nova de UI.
- [ ] **CRUD de produto digital**: título, descrição, preço, upload do PDF (via Storage do backend), imagem de capa.
- [ ] **Lista de pedidos/vendas** com filtro por data e status.
- [ ] **Lista de alunos** mostrando o que cada um comprou — essencial para suporte manual (reenviar acesso, resetar senha, investigar reclamação).
- [ ] **Gerador de cupom** reaproveitando a tabela da Fase 3.
- [ ] **Métricas mínimas**: receita do mês, número de vendas, produto mais vendido — uma query simples renderizada em 3-4 cards, sem dashboard de BI.

### O que fica de fora

Múltiplos administradores com permissões granulares, analytics avançado (funil de conversão, LTV, churn), exportação CSV/PDF, editor WYSIWYG de blog, logs de auditoria completos.

### Critério de "pronto"

Você consegue cadastrar uma apostila nova do zero, ver quanto vendeu no mês corrente, e resolver o problema de um aluno (reenviar link de acesso, por exemplo) — tudo sem abrir o banco de dados na mão.

---

## FASE 5 — Plataforma Completa (backlog orientado a dados)

**Objetivo**: a partir daqui, parar de seguir um roadmap fixo e priorizar pelo que o uso real e os pedidos dos alunos pedem. **Implementar um item por vez, medir impacto, só então seguir para o próximo.**

**Duração estimada**: contínua, sem prazo fechado
**Custo no período**: variável, tipicamente R$ 0–150/mês por item ativado

### Ordem sugerida por retorno esperado (não é obrigação seguir à risca — validar com dados da Fase 1-4 antes)

1. **Blog simples para SEO** — sem CMS, sem comentários, sem agendamento sofisticado. Uma tabela `posts` + markdown, 2–4 publicações/mês focadas em termos de cauda longa (`"apostila SEDES-DF 2026"`, `"como estudar para [concurso X]"`). Meta tags dinâmicas e sitemap são o único investimento técnico real aqui.
2. **Melhorias no simulado**: timer, comparação com a média de quem já fez o mesmo simulado, mais bancos de questões — só depois de confirmar que os alunos estão de fato usando a v1 da Fase 2.
3. **Programa de afiliados básico**: link com parâmetro de rastreio (`?ref=codigo`) + tabela simples de comissão. Pagamento de comissão **manual via Pix** no início — automação de saque só se o volume de afiliados justificar.
4. **E-mail de recuperação de carrinho abandonado**: tipicamente tem ROI maior que afiliados nesse estágio e reaproveita o serviço de e-mail já contratado na Fase 3.
5. **Assinatura/membership** (se o catálogo de apostilas crescer o suficiente para justificar "acesso a tudo por mensalidade").
6. **App mobile**: só considerar depois de tração real comprovada — não é prioridade típica para infoproduto de concurso público, onde o consumo é majoritariamente desktop/PDF.

### O que fica fora permanentemente (a menos que a empresa cresça e contrate equipe)

Kubernetes, microserviços separados por domínio, Elasticsearch, multi-region, 2FA obrigatório para aluno comum (pode continuar opcional), gamificação complexa (pontos/badges/ranking), CMS com WYSIWYG completo.

---

## SEGURANÇA PARA VENDA DE PDFS — Nota Técnica

DRM perfeito não existe para PDF — qualquer pessoa determinada consegue tirar print ou usar ferramenta de remoção de marca d'água. O objetivo realista é **elevar o custo de redistribuição o suficiente para desincentivar a maioria**, não bloquear 100% dos casos:

1. **Nunca expor o PDF em URL pública fixa** — sempre via URL assinada com expiração curta (10-15 min), gerada sob demanda após checar o `enrollment`.
2. **Rate limit de download** (ex: 5/dia por produto) já corta o caso mais comum de abuso — compartilhamento do link.
3. **Marca d'água com nome + e-mail do comprador** em cada página — desincentiva redistribuição porque o vazamento é rastreável até a conta.
4. **Log de auditoria de cada download** (quem, quando, IP) — não impede nada sozinho, mas permite identificar e agir sobre contas que abusam do limite.
5. **Termos de uso claros** deixando explícito que o compartilhamento cancela o acesso — needed juridicamente, mesmo que a aplicação prática seja rara.

Isso é exatamente o pacote descrito na Fase 2 acima — não é necessário nada além disso nesse estágio.

---

## CRONOGRAMA CONSOLIDADO (part-time, solo)

```
Mês 1        Mês 2        Mês 3        Mês 4        Mês 5+
|------------|------------|------------|------------|---------->
FASE 1: MVP
     FASE 2: Área do Aluno
                  FASE 3: Pagamentos
                        FASE 4: Painel Admin
                              FASE 5: Backlog orientado a dados (contínuo)
```

**Fases 1–4 (núcleo funcional)**: ~4–5 meses trabalhando 10–15h/semana.

> Por que esse prazo é parecido com o do MASTERPLAN enterprise (que previa 4-5 meses para uma equipe cobrir escopo equivalente)? Porque o escopo aqui foi cortado na mesma proporção em que a equipe foi reduzida — 1 pessoa fazendo 30% do escopo original demora aproximadamente o mesmo tempo que 4-5 pessoas fazendo 100%.

---

## ORÇAMENTO REAL (solo, mensal)

| Item | Fase em que entra | Custo mensal estimado |
|---|---|---|
| Backend (PocketBase Horizons ou Supabase free/starter) | 1 | R$ 0–50 |
| Storage de PDFs | 2 | Incluso no backend acima até volume moderado |
| E-mail transacional (Resend/Brevo free tier) | 3 | R$ 0 até ~3k e-mails/mês |
| Gateway de pagamento (Mercado Pago/Asaas) | 3 | R$ 0 fixo, só taxa por transação (~1–5%) |
| Domínio + hosting | já existente | já contratado na Hostinger |
| **Total fixo mensal** | | **R$ 0–300** |

Comparar com os **R$ 38 mil/mês** do MASTERPLAN enterprise — a diferença inteira vem de não contratar equipe e usar serviços gerenciados com free tier generoso em vez de infraestrutura própria.

---

## DIFERENÇAS-CHAVE EM RELAÇÃO AO MASTERPLAN_NORTIS.md

| Decisão do MASTERPLAN | Por que não se aplica aqui | Alternativa neste roadmap |
|---|---|---|
| NestJS + microserviços por domínio | Overhead de manutenção inviável para 1 pessoa | Backend único gerenciado (PocketBase/Supabase) |
| Kubernetes + Docker Compose | Não há equipe de DevOps | Deploy direto, sem orquestração |
| Stripe com "Pix via Klarna" | Tecnicamente incorreto — Klarna ≠ Pix, Stripe não tem Pix nativo confiável no BR | Mercado Pago Checkout Pro / Asaas |
| Next.js 14 desde a Fase 1 | Reescrita cara sem ganho imediato de receita | Manter Vite + React atual; considerar SSR só quando SEO virar gargalo real |
| Admin como app Next.js separado | Complexidade duplicada | Rota `/admin` dentro do app existente |
| Blog com CMS + comentários + agendamento | Esforço desproporcional ao estágio | Tabela simples + markdown |
| Elasticsearch para busca de produtos | Catálogo pequeno não justifica | Busca simples via query no banco |
| Equipe de 4-5 pessoas, R$ 453,6 mil/ano | Não é o contexto do projeto | 1 pessoa, R$ 0–300/mês em ferramentas |

---

## PRÓXIMOS PASSOS IMEDIATOS

1. Acessar o painel da Hostinger Horizons e verificar se a coleção PocketBase `users` está acessível/documentada para uso direto no frontend (isso decide se a Fase 1 usa PocketBase ou Supabase).
2. Confirmar no painel da Hostinger Ecommerce API se Pix/boleto já são suportados nativamente (isso decide o tamanho real da Fase 3).
3. Criar o `.env` / `.env.example` e mover `ECOMMERCE_API_URL` e `ECOMMERCE_STORE_ID` para variável de ambiente — tarefa de 10 minutos que já pode ser feita antes de iniciar a Fase 1 formalmente.
4. Corrigir o bug de `getCartTotal()` com carrinho vazio (`useCart.jsx:69-73`) — bug ativo em produção, correção isolada e de baixo risco.

---

**Documento preparado por**: Arquiteto de Software Sênior
**Complementa**: `MASTERPLAN_NORTIS.md`
**Versão**: 1.0
