# Regras — segurança de dados

Documento passivo (`docs/claude-staging/`), a promover para `docs/rules/` na ativação. Ver `docs/claude-staging/activation-guide.md`.

## ⚠ Pré-requisito: parte destas regras depende de feature/supabase-base

As regras de RLS, Supabase Auth e `.env`/`service_role` abaixo descrevem a arquitetura-alvo do projeto, hoje presente apenas na branch `feature/supabase-base`. Em `master`, essas peças ainda não existem. Confirmar a branch de trabalho antes de tratar qualquer regra abaixo como se já estivesse implementada.

## Segredos — regra absoluta

Nenhum arquivo deste repositório (código, documentação, `.claude/`, `docs/`) pode conter:
- Chaves Supabase, especialmente `service_role` (acesso total, nunca deve sair do backend/Edge Functions).
- Tokens/API keys do Asaas (sandbox ou produção).
- Conteúdo copiado de `apps/web/.env`.
- Senhas, dados pessoais ou financeiros reais de clientes.

Segredos reais vivem apenas em `apps/web/.env` (não versionado, coberto pelo `.gitignore` raiz), quando esse arquivo existir na branch. `apps/web/.env.example` documenta os **nomes** das variáveis, nunca valores.

## Row Level Security (RLS) e menor privilégio — ⚠ depende de feature/supabase-base

- Toda tabela do Supabase exposta a partir do frontend (diretamente ou via Edge Function) deve ter RLS habilitado — proteção de UI (esconder um botão) não substitui RLS no banco.
- Aplicar o princípio do menor privilégio: cada papel/chave só deve ter acesso ao mínimo necessário para sua função (ex. leitura pública de catálogo não precisa do mesmo acesso que escrita de pedido).
- **Antes de tratar RLS como "existente" ou "configurado" em qualquer resposta, confirmar diretamente em `supabase/migrations/` que as políticas realmente existem** — não presumir com base neste documento.

## Separação anon key / service role — ⚠ depende de feature/supabase-base

- A `anon key` do Supabase é pública por design (usada no frontend) e depende inteiramente de RLS para proteger os dados — nunca tratar a `anon key` como segredo, mas também nunca assumir que ela sozinha protege dados sem RLS ativo.
- A `service_role` key tem acesso total e ignora RLS — **proibição absoluta de uso no frontend**, em qualquer contexto, mesmo temporário ou de debug. Só pode existir em ambiente de servidor (Edge Functions, scripts administrativos locais não versionados).

## Checkout de convidado — ⚠ depende de feature/supabase-base

- O checkout de convidado (compra sem conta) cria registros (pedido, dados de contato) por um caminho não autenticado — exige RLS específica para permitir apenas inserção controlada (ex. via Edge Function com validação), nunca leitura ou escrita livre por usuários anônimos.
- Validar toda entrada de checkout de convidado no servidor (formato de e-mail, CPF, endereço, quantidade) — nunca confiar apenas na validação client-side (`zod` no frontend é UX, não segurança).
- Evitar enumeração de pedidos: identificadores de pedido não devem ser sequenciais/previsíveis de forma que permitam a um usuário adivinhar e consultar pedidos de outra pessoa; endpoints de consulta de pedido devem exigir posse de um identificador não adivinhável (token/UUID) ou autenticação.

## Dados de usuário e dados sensíveis

- Autenticação via Supabase Auth (`apps/web/src/contexts/AuthContext.jsx`, quando presente na branch); rotas sensíveis protegidas por `ProtectedRoute.jsx`.
- Dados de pedido/pagamento (nome, endereço, valor) e dados pessoais são sensíveis — tratar com o mesmo cuidado de dados financeiros, mesmo que não sejam segredos de sistema.
- Logs (aplicação, Edge Functions, ferramentas de observabilidade) não podem conter dados pessoais completos, valores de cobrança sensíveis, nem qualquer segredo — preferir logar identificadores (ex. ID de pedido) em vez de payloads inteiros.

## Ao revisar ou propor código

- Sinalizar imediatamente qualquer chave/token encontrado hardcoded, logado, ou exposto no frontend.
- Verificar que webhooks (`asaas-webhook`, quando presente) validam a origem antes de confiar no conteúdo, pelo mecanismo oficialmente suportado pela integração (ver `docs/claude-staging/rules/checkout-asaas.md`).
- Nunca sugerir desabilitar verificação de autenticidade "para simplificar debug" — propor alternativa que mantenha a validação.
- **Antes da ativação real de qualquer política de RLS descrita como regra, confirmar que ela de fato existe** (migração aplicada, não só planejada) — não presumir a partir deste documento.
