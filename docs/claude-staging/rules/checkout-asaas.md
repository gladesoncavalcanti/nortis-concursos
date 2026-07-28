# Regras — checkout e Asaas

Documento passivo (`docs/claude-staging/`), a promover para `docs/rules/` na ativação. Ver `docs/claude-staging/activation-guide.md`. Resumo operacional — a fonte completa é `ARQUITETURA_SUPABASE_ASAAS.md` (raiz do repositório), que não deve ser duplicada aqui.

## ⚠ Pré-requisito: esta integração ainda não existe em `master`

Toda esta página descreve a arquitetura-alvo do checkout, hoje presente apenas na branch `feature/supabase-base` (Edge Functions `create-asaas-checkout`/`asaas-webhook`, `supabase/migrations/`). **Antes de aplicar qualquer regra abaixo como se fosse o estado atual do código, confirme que a branch de trabalho já contém essa integração** (`git branch --show-current`, `Glob` em `supabase/`). Nenhuma instrução aqui deve ser tratada como fato de `master` até essa confirmação.

## Regras de negócio

- O pagamento é processado via Asaas (Pix, Boleto, Cartão), sempre por trás de Supabase Edge Functions — o frontend nunca fala diretamente com a API do Asaas nem manuseia chaves de pagamento.
- `create-asaas-checkout` inicia a cobrança; `asaas-webhook` recebe a confirmação assíncrona do Asaas e deve validar a autenticidade da origem antes de confiar no payload.
- Existe suporte a checkout de convidado (guest checkout) — ver migrações relacionadas em `supabase/migrations/`, quando presentes na branch.
- Preço exibido ao cliente deve corresponder exatamente ao valor enviado para o Asaas — qualquer divergência é um bug crítico, não um detalhe visual.

## Regras obrigatórias de integridade de preço e pedido

- **O preço e o valor final da cobrança devem ser sempre recalculados no servidor (Edge Function), a partir de dados confiáveis do banco** — nunca aceitar como fonte de verdade um preço, subtotal ou total enviado pelo frontend.
- Antes de criar a cobrança, validar no servidor: produto existe, quantidade é válida, produto está disponível para venda, e o valor calculado bate com o que será cobrado.
- Aplicar idempotência na criação de cobrança — uma mesma tentativa de checkout (reenvio de formulário, duplo clique, retry de rede) não pode gerar duas cobranças para o mesmo pedido. O mecanismo concreto (chave de idempotência, verificação de pedido pendente, etc.) deve ser confirmado na documentação oficial do Asaas/Supabase antes da implementação — não inventar um mecanismo aqui.

## Regras obrigatórias para o webhook

- Registrar e tratar eventos repetidos do webhook (o Asaas pode reenviar notificações) — o processamento deve ser tolerante a duplicidade e não deve aplicar o mesmo efeito (ex. liberar acesso, confirmar pedido) duas vezes para o mesmo evento.
- Prever proteção contra replay (reenvio malicioso ou acidental de um payload antigo).
- Validar a autenticidade do webhook usando o mecanismo oficialmente suportado pela integração Asaas/Supabase em uso (ex. verificação de origem/token documentado pelo Asaas). **Não inventar ou presumir um esquema de assinatura/HMAC específico se isso não estiver de fato implementado ou documentado na integração real** — antes da ativação desta regra, consultar a documentação oficial do Asaas para confirmar qual mecanismo de validação está disponível e qual está de fato em uso no projeto.
- Prever tratamento seguro para falhas e reprocessamento: se o processamento do webhook falhar, o evento deve poder ser reprocessado sem duplicar efeitos (ver idempotência acima), e a falha não deve expor detalhes sensíveis em resposta pública.

## Regras de segurança para este fluxo

- Nenhuma chave/token do Asaas ou do Supabase (especialmente `service_role`) pode aparecer em código de frontend, log, commit ou documentação — sempre referenciar por nome de variável de ambiente (ver `apps/web/.env.example`, quando presente na branch).
- Segredos (chaves Asaas, `service_role` do Supabase) permanecem exclusivamente no backend/Edge Functions — nunca no bundle do frontend nem em variáveis expostas ao cliente.
- Nunca registrar tokens, chaves ou credenciais em logs, mesmo em logs de erro/debug.
- Mudanças em `asaas-webhook` exigem atenção redobrada: é um endpoint público que precisa validar autenticidade antes de alterar o estado de um pedido.
- Qualquer alteração no fluxo de checkout deve ser tratada como alteração de código de produção real — não como uma mudança de UI comum.

## Antes de mexer neste fluxo

1. Confirmar que a integração já existe na branch de trabalho (ver seção de pré-requisito acima).
2. Ler `ARQUITETURA_SUPABASE_ASAAS.md` (raiz) para o desenho completo.
3. Ler este arquivo e `docs/claude-staging/checklists/antes-de-alterar.md`.
4. Verificar a documentação oficial do Asaas para o mecanismo de validação de webhook e de idempotência antes de implementar ou revisar qualquer coisa relacionada.
5. Qualquer mudança de lógica de pagamento/preço exige revisão humana explícita antes de ser considerada concluída, incluindo confirmação de que nenhuma cobrança real foi criada durante testes (usar ambiente sandbox do Asaas).
