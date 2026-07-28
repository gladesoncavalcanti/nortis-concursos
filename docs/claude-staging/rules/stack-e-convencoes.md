# Regras — stack e convenções

Documento passivo (`docs/claude-staging/`), a promover para `docs/rules/` na ativação. Ver `docs/claude-staging/activation-guide.md`. **Fonte canônica da descrição de stack deste projeto** — outros arquivos desta pasta devem referenciar este documento em vez de repetir a lista completa.

## Escopo e pré-requisitos (branch atual vs. arquitetura-alvo)

- Esta infraestrutura foi escrita numa worktree/branch (`chore/claude-infrastructure`) criada a partir de `master`.
- A `master` contém hoje apenas a base do frontend (React/Vite, componentes, documentos de arquitetura da raiz). **Não contém** a integração Supabase/Asaas — essa integração existe, no momento em que este documento foi escrito, apenas na branch `feature/supabase-base` (Edge Functions, migrations, dependência `@supabase/supabase-js`, `apps/web/.env`/`.env.example`, scripts `test:supabase`/`test:adapter`).
- Os itens abaixo marcados **⚠ depende de feature/supabase-base** descrevem a arquitetura-alvo do projeto, não necessariamente o estado da branch em que você está trabalhando agora. `master` e `feature/supabase-base` ainda não foram integradas.
- **Antes de tratar qualquer item marcado como fato da sua branch atual, confirme:** `git branch --show-current`, se os caminhos citados existem de fato (`ls`/`Glob`), e se os comandos citados estão realmente em `apps/web/package.json`. Nenhuma instrução deste conjunto de documentos deve presumir que `feature/supabase-base` já foi incorporada a `master`.

## Stack confirmada — presente em qualquer branch atual do projeto

- Monorepo npm workspaces; único app real: `apps/web`.
- React 18 + Vite 7, `react-router-dom` v7.
- UI: Radix UI + shadcn (`apps/web/src/components/ui/`) + Tailwind CSS + `framer-motion`.
- Formulários: `react-hook-form` + `zod`.
- Lint: ESLint 9, flat config (`apps/web/eslint.config.mjs`), plugins `react`, `react-hooks`, `import`.

## Stack-alvo — ⚠ depende de feature/supabase-base

- Backend/dados: Supabase (Postgres, Auth, Storage, Edge Functions) — caminhos `supabase/migrations/`, `supabase/functions/`.
- Pagamentos: Asaas via Supabase Edge Functions (`create-asaas-checkout`, `asaas-webhook`) — sem SDK Asaas no frontend.
- Dependência `@supabase/supabase-js` no `apps/web/package.json`.
- Scripts `npm run test:supabase` e `npm run test:adapter` (verificações ad-hoc, não é framework de testes).
- `apps/web/.env` / `apps/web/.env.example`.

## Verificação disponível — vale para qualquer branch

**Sem framework de testes automatizados (Jest/Vitest/Playwright) e sem CI (`.github/` não existe) em nenhuma branch conhecida do projeto.** O único documento que precisa afirmar isso em detalhe é este; os demais arquivos desta pasta devem apenas referenciá-lo. `npm run lint` (raiz) é a única verificação automatizada real disponível hoje.

## Convenções a seguir

- Reutilizar componentes de `apps/web/src/components/ui/` antes de criar um novo componente visual do zero.
- Usar os tokens de cor definidos em `apps/web/src/index.css` (`hsl(var(--primary))`, etc.) em vez de valores hex hardcoded — ver identidade visual completa em `docs/claude-staging/templates/CLAUDE.md`.
- Seguir o padrão de hooks/contexts já existente (`useCart`, `AuthContext`) para novo estado compartilhado.
- Rodar `npm run lint` (raiz) antes de considerar qualquer mudança pronta.

## Convenções a evitar

- Não introduzir uma segunda biblioteca de UI concorrente com Radix/shadcn.
- Não assumir existência de testes automatizados ou pipeline de CI ao planejar verificação de mudanças.
- Não editar `package.json`/`package-lock.json` sem necessidade clara.
- **Não presumir que a integração Supabase/Asaas (itens marcados ⚠ acima) já existe na branch em que você está trabalhando** — confirme antes de citar esses caminhos/comandos como fato.
