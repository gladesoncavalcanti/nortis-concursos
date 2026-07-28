# Knowledge — índice (não duplica os documentos originais)

Documento passivo (`docs/claude-staging/`), a promover para `docs/knowledge/` na ativação. Ver `docs/claude-staging/activation-guide.md`.

Este arquivo **não repete** o conteúdo dos documentos de arquitetura já existentes na raiz do repositório — só indexa e resume em 1-2 linhas para saber qual consultar em cada situação. Qualquer decisão nova deve ser registrada aqui (ou em arquivos adicionais dentro deste diretório, quando ativado), sem reescrever os originais.

## Documentos existentes (raiz do repositório)

- **`MASTERPLAN_NORTIS.md`** — visão de longo prazo "enterprise" do produto: autenticação, área do aluno, plataforma de vendas, downloads protegidos, simulados, pagamentos, painel admin, blog/SEO, cupons, afiliados. Consultar para entender a visão completa, não necessariamente o que já está implementado.
- **`ROADMAP_EXECUCAO_NORTIS.md`** — roteiro pragmático de execução solo-founder, que escopa deliberadamente o masterplan para o que é viável agora. Define 5 princípios orientadores (receita > completude, infraestrutura gerenciada > custom, incremental > big-bang, medir > adivinhar, defesa realista > DRM). Consultar antes de propor qualquer coisa que amplie escopo — o roadmap provavelmente já considerou e descartou.
- **`ARQUITETURA_SUPABASE_ASAAS.md`** — arquitetura técnica concreta em uso: frontend React/Vite (inalterado) + Supabase (Postgres/Auth/Storage/Edge Functions) + Asaas (Pix/Boleto/Cartão) como gateway de pagamento. É a referência técnica principal para trabalho em checkout, autenticação e dados.

## Quando registrar uma decisão nova aqui

Só decisões técnicas **novas**, tomadas depois destes três documentos, que ainda não estão registradas em lugar nenhum. Formato sugerido ao ativar: um arquivo por decisão, com data e contexto, dentro deste diretório — sem reabrir ou reescrever os três documentos acima.
