<!--
MODELO INATIVO — não é o CLAUDE.md real do projeto.
Este arquivo vive em docs/claude-staging/templates/ e não é carregado
automaticamente pelo Claude Code. Ver docs/claude-staging/activation-guide.md
para o procedimento de ativação (copiar para a raiz como CLAUDE.md).
-->

# CLAUDE.md — Nortis Concursos

Documento central de contexto para trabalhar neste repositório.

## Escopo e pré-requisitos antes de ativar este documento

Este modelo foi escrito numa worktree/branch (`chore/claude-infrastructure`) criada a partir de `master`, que **não contém** a integração Supabase/Asaas — essa integração existe hoje apenas em `feature/supabase-base`. Itens abaixo marcados **⚠ depende de feature/supabase-base** descrevem a arquitetura-alvo do projeto, não necessariamente o estado da branch de destino no momento da ativação. **Antes de copiar este arquivo para a raiz como `CLAUDE.md` ativo, confirme na branch de destino:** se `feature/supabase-base` já foi integrada, se os caminhos/comandos citados realmente existem (`git branch --show-current`, `ls`, conferir `apps/web/package.json`), e qual é a plataforma de hospedagem real (ver seção "Hospedagem" abaixo — não confirmada nesta pesquisa).

## Arquitetura

Monorepo npm workspaces. O código de produção vive inteiramente em `apps/web/` — a raiz do repositório só orquestra scripts (`concurrently`) e guarda documentação.

- Frontend: React 18 + Vite 7, SPA com `react-router-dom` v7.
- UI: componentes Radix UI + shadcn (`apps/web/src/components/ui/`), Tailwind CSS, `framer-motion`.
- Formulários: `react-hook-form` + `zod`.
- Backend/dados (⚠ depende de feature/supabase-base): Supabase (Postgres, Auth, Storage, Edge Functions) — integração descrita em detalhe em `ARQUITETURA_SUPABASE_ASAAS.md` (raiz do repo).
- Pagamentos (⚠ depende de feature/supabase-base): Asaas (Pix/Boleto/Cartão), acessado via Supabase Edge Functions (`create-asaas-checkout`, `asaas-webhook`), nunca diretamente do frontend.

A lista completa e as regras de "não presumir" estão centralizadas em `docs/claude-staging/rules/stack-e-convencoes.md` (fonte canônica) — este resumo não deve divergir dela.

### Hospedagem — não confirmada de forma inequívoca

Há sinais conflitantes na documentação do projeto e entre branches:
- `ARQUITETURA_SUPABASE_ASAAS.md` (raiz) afirma que o site roda via Hostinger Horizons.
- Um `vercel.json` (rewrite de SPA) existe na branch `feature/supabase-base`, mas **não existe** na branch `master`/nesta worktree — pode ser configuração de teste, ambiente alternativo, ou remanescente não utilizado; não há confirmação de qual plataforma está de fato servindo produção.

**Regra de pré-ativação: confirmar a plataforma de produção real (com o responsável pelo projeto, painel de deploy, ou DNS) antes de ativar qualquer orientação de deploy neste `CLAUDE.md`.** Não presumir Vercel nem Hostinger Horizons sem essa confirmação; se a informação permanecer incerta, deixar esta seção explicitamente como "a confirmar" em vez de escolher uma das duas.

Para a visão de longo prazo e as decisões que levaram a este desenho, ver `docs/claude-staging/knowledge/README.md` (índice dos 3 documentos de arquitetura da raiz).

## Comandos

Confirmados em qualquer branch atual do projeto (rodar a partir da raiz do monorepo — os scripts da raiz só fazem proxy para `apps/web`):

```bash
npm run dev     # inicia o Vite dev server (apps/web, porta 3000)
npm run build   # build de produção (apps/web) -> dist/apps/web
npm run lint    # eslint . --quiet (apps/web)
```

- `npm run lint:warn` (dentro de `apps/web`) — lint sem `--quiet`, mostra warnings. Confirmado em qualquer branch.
- `npm run test:supabase` / `npm run test:adapter` (⚠ depende de feature/supabase-base) — scripts ad-hoc de verificação (conexão Supabase / adapter de produtos), não são um framework de testes. **Confirmar em `apps/web/package.json` que existem na branch de destino antes de citá-los como disponíveis** — não existem em `master`.

Detalhe completo e regra de "sem CI/testes automatizados" em `docs/claude-staging/rules/stack-e-convencoes.md`.

## Identidade visual (Nortis Concursos)

Fonte canônica desta informação neste conjunto de documentos — outros arquivos (ex. `docs/claude-staging/agents/ui-ux.md`) devem referenciar esta seção em vez de repeti-la.

Definida em `apps/web/src/index.css` e `apps/web/tailwind.config.js`. Cores oficiais da marca (usar sempre os tokens Tailwind/CSS var, nunca hex hardcoded em componentes novos):

| Token | Uso | Valor |
|---|---|---|
| `--primary` / `--nortis-primary-blue` | Azul-marinho principal | `#0B2340` |
| `--secondary` / `--nortis-secondary-blue` | Azul secundário | `#294761` |
| `--accent` / `--nortis-golden` | Dourado de destaque | `#C5A13A` |
| `--background` / `--nortis-dark-navy` | Fundo escuro padrão | `#202630` |

Tipografia: `Poppins` (títulos, `font-heading`) e `Inter` (corpo de texto, `font-body`), carregadas via Google Fonts em `index.css`. O layout é "dark by design" (tema escuro é o padrão, não um modo alternativo). Esta seção é confirmada em qualquer branch (verificada diretamente em `apps/web/src/index.css`).

## Restrições permanentes

Estas restrições valem para qualquer trabalho automatizado ou assistido neste repositório, salvo pedido explícito e pontual do responsável pelo projeto:

- Não alterar `package.json` / `package-lock.json` sem necessidade clara e comunicada.
- Não alterar lógica de checkout, preços, integração Asaas ou Supabase Edge Functions sem revisão humana explícita — envolve dinheiro real de clientes. (⚠ só se aplica depois que a integração existir na branch de destino.)
- Não commitar segredos: chaves Supabase (especialmente `service_role`), tokens Asaas, ou qualquer conteúdo de `.env`. Quando `apps/web/.env` existir (⚠ depende de feature/supabase-base), esses valores vivem só ali (não versionado) — ver `apps/web/.env.example` para os nomes das variáveis, se presente na branch.
- Não ativar automações de produção (deploy automático, auto-merge, hooks de Git) sem aprovação explícita.
- Antes de mexer no checkout/pagamentos, consultar `docs/claude-staging/rules/checkout-asaas.md` (ou seu equivalente ativado em `docs/rules/`, se já promovido) — inclui regra de pré-ativação equivalente.

## Fluxo de trabalho recomendado

1. Rodar `npm run dev` a partir da raiz para validar mudanças de UI localmente.
2. Rodar `npm run lint` antes de considerar qualquer alteração pronta.
3. Para mudanças em checkout/pagamentos, seguir o checklist em `docs/claude-staging/checklists/antes-de-alterar.md` e `depois-de-alterar.md`.
4. Para decisões de arquitetura novas, registrar em `docs/claude-staging/knowledge/` (ou seu equivalente ativo), sem reescrever os documentos originais da raiz.
