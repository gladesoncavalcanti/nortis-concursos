# Guia de ativação futura (somente leitura — nada aqui é executado automaticamente)

Este documento descreve, passo a passo, como transformar o conteúdo passivo de `docs/claude-staging/` em infraestrutura ativa do Claude Code, **quando você decidir fazer isso**. Nenhuma dessas ações é realizada por este guia ou pela existência desta pasta.

## 0. Checklist de pré-ativação (fazer antes de qualquer item abaixo)

Independentemente do que for ativado, confirme sempre primeiro, na branch de destino real (não presumir a partir dos documentos de `docs/claude-staging/`):

- [ ] Qual é a branch de destino da ativação (`git branch --show-current`)?
- [ ] A integração Supabase já existe nessa branch (`supabase/migrations/`, `supabase/functions/`)?
- [ ] As Edge Functions citadas (`create-asaas-checkout`, `asaas-webhook`) existem de fato nessa branch?
- [ ] As dependências citadas (ex. `@supabase/supabase-js`) estão em `apps/web/package.json` dessa branch?
- [ ] Os scripts citados (`test:supabase`, `test:adapter`, `lint`, `dev`, `build`) estão realmente definidos em `apps/web/package.json` dessa branch?
- [ ] Qual é a plataforma de hospedagem real em produção — confirmada com o responsável do projeto, não presumida (ver divergência Hostinger Horizons vs. `vercel.json` descrita em `templates/CLAUDE.md`)?
- [ ] As variáveis de ambiente necessárias existem (`apps/web/.env.example`) — **confirmar só os nomes, nunca revelar ou copiar valores**?
- [ ] As políticas de RLS relevantes já existem e estão aplicadas (não apenas planejadas)?
- [ ] Qual é o mecanismo de validação de autenticidade do webhook Asaas realmente implementado (conferir documentação oficial do Asaas e o código da Edge Function, não presumir HMAC/assinatura por padrão)?
- [ ] Existe um ambiente de sandbox/teste do Asaas disponível para qualquer teste, de forma que **nenhuma cobrança real seja criada**?
- [ ] Cada modelo (`templates/CLAUDE.md`, cada arquivo em `agents/`) foi revisado linha a linha e atualizado para refletir a branch de destino antes de ser copiado para um caminho ativo do Claude Code?

Só depois de responder a todos os itens acima é que faz sentido seguir para as seções 1–8.

## 1. Ativar `CLAUDE.md`

- Revisar `templates/CLAUDE.md` linha a linha (stack, comandos, restrições).
- Copiar (ou mover) o arquivo para a raiz do repositório como `CLAUDE.md`.
- A partir desse momento, o Claude Code passa a carregá-lo automaticamente em toda sessão nesta pasta.

## 2. Ativar agentes

- Revisar cada arquivo em `agents/`.
- Para cada um que fizer sentido ativar, copiar para `.claude/agents/<nome>.md`, mantendo o frontmatter.
- Conferir o campo `tools` antes de ativar — os modelos aqui propõem apenas `Read, Grep, Glob` (leitura). Qualquer ampliação (`Edit`, `Write`, `Bash`) é uma decisão separada e deve ser avaliada individualmente.
- Agentes só executam quando chamados explicitamente (via `Agent` tool ou pedido direto); a cópia para `.claude/agents/` só os torna *descobertos*, não automáticos.

## 3. Ativar skills

- Não há skills reais preparadas nesta etapa (só a convenção em `skills/README.md`).
- Quando um fluxo realmente se repetir (ex. "sempre que eu pedir X, siga estes passos"), criar `.claude/skills/<nome>/SKILL.md` seguindo essa convenção.
- Skills só rodam quando invocadas via `/nome` ou quando explicitamente referenciadas — nunca automaticamente.

## 4. Criar comandos (`.claude/commands/`)

- Um prompt de `prompts/` que você usa com frequência pode virar um slash-command dedicado.
- Criar `.claude/commands/<nome>.md` com o conteúdo do prompt.
- Comandos são invocados manualmente digitando `/<nome>`.

## 5. Conectores e plugins

- Conectores (Gmail, Notion, Figma, etc.) e plugins não são arquivos deste repositório — são configurados na conta/aplicativo do Claude Code (configurações de MCP/conectores).
- Nada em `docs/claude-staging/` habilita ou desabilita conectores.

## 6. Modo automático / Auto Verify / Computer Use

- São configurações de sessão ou do harness do Claude Code, não deste repositório.
- Recomendação para este projeto (e-commerce com checkout e pagamentos reais via Asaas): manter essas funcionalidades **desligadas por padrão**, habilitando caso a caso e sempre com revisão humana antes de qualquer ação que grave dados, mova dinheiro ou publique conteúdo.

## 7. Sessões em nuvem / Dispatch

- Permitem rodar o Claude Code de forma assíncrona/agendada. Podem ser úteis futuramente para tarefas recorrentes (ex. auditoria semanal de SEO usando `prompts/auditoria-seo.md`).
- Nenhuma sessão em nuvem ou dispatch é configurada por este guia.

## 8. GitHub e revisão de PR

- É possível conectar revisão automatizada de Pull Requests (ex. `/code-review ultra` sobre um PR do GitHub).
- Isso depende de autorização/configuração própria (fora deste repositório) e de você disparar a revisão explicitamente quando quiser.
- Nenhuma integração de PR é ativada aqui.

## Checklist antes de ativar qualquer item acima

- [ ] O conteúdo do arquivo-modelo foi revisado e está atualizado com a realidade do projeto?
- [ ] Não há nenhum segredo, token, chave ou dado sensível no arquivo?
- [ ] O escopo de `tools` de cada agente é o mínimo necessário?
- [ ] Você (não uma automação) está fazendo a cópia/ativação deliberadamente?
