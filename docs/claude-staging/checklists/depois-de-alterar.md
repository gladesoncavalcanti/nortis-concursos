# Checklist — depois de alterar

Documento passivo (`docs/claude-staging/`), a promover para `docs/checklists/` na ativação. Ver `docs/claude-staging/activation-guide.md`.

Como não há CI nem testes automatizados (ver `docs/claude-staging/rules/stack-e-convencoes.md`), esta verificação pós-alteração é manual e é a única rede de segurança real do projeto.

## Verificação padrão

- [ ] Rodei `npm run lint` (raiz) e não há erros novos?
- [ ] Rodei `npm run dev` e naveguei manualmente até a área alterada — o comportamento é o esperado?
- [ ] Verifiquei visualmente que a identidade visual (cores, tipografia) continua consistente?
- [ ] Testei em telas pequenas (mobile) se a mudança afeta layout/responsividade?

## Se a mudança tocou checkout/pagamento

- [ ] Simulei o fluxo completo (catálogo -> carrinho -> checkout) manualmente?
- [ ] Confirmei que o preço mostrado na UI é exatamente o que seria enviado ao Asaas, e que o valor final é recalculado no servidor (não apenas repassado do frontend)?
- [ ] Testei idempotência: repetir a mesma ação de checkout (duplo clique, retry) não gerou cobrança duplicada?
- [ ] Testei repetição/reenvio do evento de webhook e confirmei que o processamento não duplicou efeitos (ex. não liberou acesso duas vezes)?
- [ ] Se toquei no webhook, confirmei que a validação de autenticidade/origem continua ativa?
- [ ] Confirmei que **nenhuma cobrança real foi criada** durante os testes (usei ambiente/sandbox do Asaas, não produção)?

## Se a mudança tocou autenticação/dados

- [ ] Confirmei que rotas protegidas continuam exigindo login?
- [ ] Verifiquei que as políticas RLS relevantes continuam ativas e cobrindo a tabela/caso alterado (não só a proteção de UI)?
- [ ] Confirmei que nenhum dado sensível (segredo, dado pessoal, valor de cobrança completo) aparece em console/log durante o teste manual?
- [ ] Confirmei que nenhuma chave/segredo (especialmente `service_role`) aparece em código ou bundle do frontend?

## Antes de considerar a tarefa concluída

- [ ] Rodei `git diff`/`git status` e revisei que só os arquivos pretendidos foram alterados?
- [ ] Nenhum segredo, token ou valor de `.env` apareceu em nenhum arquivo alterado?
- [ ] Confirmei que nenhuma configuração de produção (deploy, variáveis de ambiente reais, DNS, painel de hosting) foi modificada durante o trabalho?
