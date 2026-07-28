# Checklist — antes de alterar

Documento passivo (`docs/claude-staging/`), a promover para `docs/checklists/` na ativação. Ver `docs/claude-staging/activation-guide.md`.

Este projeto **não tem CI nem testes automatizados** (ver `docs/claude-staging/rules/stack-e-convencoes.md`) — a verificação é manual. Este checklist existe para compensar isso.

## Confirmação de contexto (fazer sempre primeiro)

- [ ] Confirmei a branch atual (`git branch --show-current`)?
- [ ] Confirmei se a integração Supabase/Asaas já foi incorporada a esta branch (existência de `supabase/`, `@supabase/supabase-js` em `apps/web/package.json`) — não presumir com base em documentos deste diretório?
- [ ] Confirmei que os arquivos/caminhos que pretendo citar ou alterar realmente existem (`Glob`/`ls`), em vez de assumir a partir de `docs/claude-staging/`?
- [ ] Confirmei os comandos reais disponíveis em `apps/web/package.json` (nem todo comando citado em documentação existe em toda branch)?
- [ ] Confirmei a plataforma de hospedagem real antes de qualquer suposição sobre deploy (ver nota de divergência em `docs/claude-staging/templates/CLAUDE.md`)?
- [ ] Confirmei que o ambiente em que vou testar **não é produção** (não é o site real recebendo clientes/pagamentos reais)?
- [ ] Confirmei que estou numa branch de trabalho apropriada e que existe um jeito de reverter (branch/commit de referência, backup) antes de começar?

## Antes de qualquer alteração

- [ ] Entendi em qual parte da stack a mudança acontece (frontend `apps/web/src`, Edge Function, migração Supabase)?
- [ ] Se a mudança toca checkout/pagamento/preço, li `docs/claude-staging/rules/checkout-asaas.md` (ou `docs/rules/checkout-asaas.md`, se já ativo)?
- [ ] Se a mudança toca autenticação/dados de usuário, li `docs/claude-staging/rules/seguranca-dados.md`?
- [ ] Verifiquei se já existe um componente/hook/padrão reaproveitável antes de criar algo novo?
- [ ] Sei como vou verificar manualmente que a mudança funciona (não existe suíte de testes que vá pegar isso por mim)?

## Antes de alterar dependências (`package.json`)

- [ ] Essa dependência nova é realmente necessária, ou algo em Radix/shadcn já resolve?
- [ ] Confirmei que a mudança não é feita "de passagem" dentro de uma tarefa não relacionada?

## Antes de qualquer coisa perto de segredos

- [ ] Confirmei que nenhuma chave/token real vai aparecer em código, log, commit ou documentação?
