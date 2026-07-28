# Claude Staging — infraestrutura passiva (não ativa)

Esta pasta contém **modelos e documentação de referência** para uma futura infraestrutura de trabalho do Claude Code no projeto Nortis Concursos. Nada aqui é reconhecido automaticamente pelo Claude Code: é uma área de rascunho/staging, propositalmente fora dos caminhos que o Claude Code varre (`CLAUDE.md` na raiz, `.claude/agents/`, `.claude/skills/`, `.claude/commands/`, `.claude/settings.json`).

## Contexto importante: branch em que isto foi escrito

- Este conteúdo foi produzido numa worktree/branch (`chore/claude-infrastructure`) criada a partir de `master`.
- `master` contém hoje apenas a base do frontend (React/Vite, componentes, documentos de arquitetura da raiz). **Alguns dos documentos aqui dentro descrevem uma arquitetura-alvo** que depende da integração Supabase/Asaas, existente no momento em que isto foi escrito apenas na branch `feature/supabase-base` (Edge Functions, migrations, `apps/web/.env`, scripts de teste ad-hoc). `master` e `feature/supabase-base` ainda não foram integradas.
- Arquivos que descrevem essa arquitetura-alvo marcam os trechos dependentes com **⚠ depende de feature/supabase-base**. Não trate esses trechos como fato da branch em que você estiver trabalhando sem confirmar antes (ver `activation-guide.md`, seção "Checklist de pré-ativação").
- **Nada deve ser ativado (copiado para `CLAUDE.md`, `.claude/agents/`, etc.) sem antes validar esses pré-requisitos na branch de destino.**

## Por que existe

Preparar o conteúdo de arquitetura, regras, agentes e checklists com calma, revisar tudo, e só depois decidir — de forma deliberada — o que ativar de fato. Ver [`activation-guide.md`](activation-guide.md) para o procedimento (ainda não executado).

## Estrutura

- `templates/CLAUDE.md` — rascunho do futuro `CLAUDE.md` da raiz.
- `agents/` — rascunhos dos futuros arquivos de `.claude/agents/`.
- `skills/` — convenção para futuras skills reais em `.claude/skills/`.
- `rules/` — regras permanentes do projeto (`rules/stack-e-convencoes.md` é a fonte canônica da descrição de stack; os demais arquivos a referenciam).
- `checklists/` — checklists manuais de pré e pós-alteração.
- `knowledge/` — índice para a documentação de arquitetura já existente na raiz do repositório (`MASTERPLAN_NORTIS.md`, `ROADMAP_EXECUCAO_NORTIS.md`, `ARQUITETURA_SUPABASE_ASAAS.md`).
- `prompts/` — prompts operacionais reutilizáveis, para copiar/colar quando necessário.

## Regra permanente desta pasta

Nenhum arquivo aqui dentro pode conter segredos: senhas, tokens, chaves do Supabase ou do Asaas, conteúdo de `.env`, ou dados pessoais/financeiros reais. Sempre referenciar variáveis por **nome**, nunca por valor.
