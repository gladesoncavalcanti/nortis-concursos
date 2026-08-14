# Fundação técnica do fluxo discursivo (Tutor Nortis) — estado real, não especulativo

Documento passivo (`docs/claude-staging/`), a promover para `docs/knowledge/` na ativação (ver
`docs/claude-staging/activation-guide.md`). Registra o que **existe de fato** na branch
`feat/tutor-discursiva-foundation` (PR #80) após validação real contra o Supabase do projeto
`iglgqzcvjcueucfholog`, em 2026-08-13. Não repete `ARQUITETURA_SUPABASE_ASAAS.md` — só documenta a
peça nova.

## O que isto é

Uma fundação técnica mínima — schema, RLS, acesso e UI de rascunho/envio — para o aluno escrever e
enviar uma redação dissertativa vinculada a um produto em que está matriculado. **Não é** um motor
de correção. Nenhuma decisão pedagógica foi tomada aqui (ver seção "O que deliberadamente NÃO
existe ainda").

## Tabelas

### `public.essay_themes`
Tema de redação, associado a um produto (curso) e opcionalmente a um nó do edital.

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `product_id` | uuid NOT NULL | FK → `products(id)` ON DELETE CASCADE |
| `syllabus_node_id` | uuid | FK → `syllabus_nodes(id)` ON DELETE SET NULL |
| `title` | text NOT NULL | 2–200 chars (trim) |
| `prompt_text` | text NOT NULL | 10–8000 chars (trim) — o enunciado |
| `source_reference` | text | opcional, 2–500 chars (trim) |
| `active` | boolean NOT NULL | default `true` — controla visibilidade |
| `sort_order` | integer NOT NULL | default `0` |
| `created_at` / `updated_at` | timestamptz NOT NULL | default `now()` |

Índices: `essay_themes_product_sort_idx (product_id, sort_order)`,
`essay_themes_syllabus_node_idx (syllabus_node_id) where syllabus_node_id is not null`.

### `public.essay_submissions`
Uma redação (rascunho ou enviada) de um aluno para um tema.

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid NOT NULL | FK → `auth.users(id)` ON DELETE CASCADE |
| `theme_id` | uuid NOT NULL | FK → `essay_themes(id)` |
| `essay_text` | text NOT NULL | default `''`, ≤ 20000 chars |
| `status` | text NOT NULL | default `'draft'`; enum `draft \| submitted \| processing \| corrected \| failed` |
| `created_at` / `updated_at` | timestamptz NOT NULL | default `now()` |
| `submitted_at` | timestamptz | null enquanto draft |

Constraints adicionais: `essay_submissions_non_empty_when_active` (texto vazio só é permitido em
`draft`) e `essay_submissions_submitted_at_consistency` (`submitted_at` é null sse `status='draft'`).
Índices: `essay_submissions_user_created_idx (user_id, created_at desc)`,
`essay_submissions_theme_idx (theme_id)`.

Os estados `processing`/`corrected`/`failed` existem no enum **apenas para não travar um mecanismo
de servidor futuro** — nenhum código atual escreve esses valores; a RLS ativa bloqueia o próprio
aluno de pular para eles (ver abaixo).

## RLS e grants (verificado contra o banco real, não apenas lido do SQL)

`anon`: zero grants em ambas as tabelas (nem RLS chega a ser avaliada — `permission denied`).
`authenticated`: `select` em `essay_themes`; `select, insert, update` em `essay_submissions`
(sem `delete`).

Policies:
- `essay_themes_enrolled_read` (select) — tema `active` **e** matrícula ativa (status `active`,
  não expirada) no produto do tema.
- `essay_submissions_self_read` (select) — apenas `user_id = auth.uid()`, sem exigir matrícula
  ainda ativa (o aluno mantém acesso ao que já escreveu mesmo se a matrícula expirar depois).
- `essay_submissions_enrolled_insert` (insert) — só `status='draft'`, `user_id=auth.uid()`, tema
  ativo e matrícula ativa no produto do tema.
- `essay_submissions_draft_owner_update` (update) — `USING`: só linha própria **e ainda em
  draft** (avalia o estado antes do update). `WITH CHECK`: só própria, só `draft`→`draft` ou
  `draft`→`submitted`, e ainda exige tema ativo + matrícula ativa. Qualquer tentativa de pular
  para `processing`/`corrected`/`failed`, de reatribuir `user_id`/`theme_id`, ou de editar uma
  linha já `submitted`, é rejeitada pelo Postgres (`insufficient_privilege`/42501) ou resulta em
  0 linhas afetadas.

Não há policy de `delete` — `authenticated` não tem o grant, então qualquer tentativa falha por
`permission denied` antes mesmo da RLS.

## Fluxo de estado

```
draft --(submitEssay, texto não-vazio)--> submitted
```

`submitted → processing → corrected` (ou `failed`) é reservado a um mecanismo de servidor que
**não existe ainda** nesta fundação. Uma vez `submitted`, o aluno não pode mais editar o texto
(bloqueado por RLS e, na UI, o textarea nem é renderizado fora de `draft`).

## Acesso (frontend) e rotas

- `apps/web/src/api/essayThemes.js` — `getActiveEssayThemes()`, `getEssayThemeById()`.
- `apps/web/src/api/essaySubmissions.js` — `createEssayDraft`, `updateEssayDraftText`,
  `submitEssay`, `getMyEssaySubmission`. Nunca confia em `user_id` vindo do client (lê de
  `supabase.auth.getUser()`); mensagens de erro são genéricas e não distinguem "não existe" de
  "não é seu" (evita vazamento de existência de recursos de terceiros).
- `apps/web/src/api/essaySubmissionValidation.js` — `isEssayTextSubmittable(text)`, validação
  pura sem import, espelha (mas não substitui) o constraint
  `essay_submissions_non_empty_when_active` do banco.
- `apps/web/src/pages/EssayThemesPage.jsx` (`/minha-conta/tutor/redacao`) e
  `EssayEditorPage.jsx` (`/minha-conta/tutor/redacao/:submissionId`) — ambas atrás de
  `ProtectedRoute` (mesmo guard de todas as rotas de `/minha-conta/*`; usuário não autenticado é
  redirecionado a `/login`, sem vazar a existência da rota).
- Link de entrada a partir de `StudyTutorPage.jsx` (Tutor Nortis).

## Como rodar os testes

Suíte estática (sem credenciais, roda sempre):
```bash
node scripts/test-essay-foundation-schema.mjs
node scripts/test-essay-foundation-flow.mjs
node scripts/test-essay-foundation-rollback.mjs
```

Suíte de RLS real (depende de `npx supabase login` + `link` já feitos localmente; segue o mesmo
padrão de `test-supabase-connection.mjs`/`test-products-adapter.mjs` — detecta ausência de
configuração e sai com código 0 sem quebrar a suíte estática):
```bash
npm run test:essay-rls --prefix apps/web
```
Executa `supabase/tests/rls_essay_foundation.sql`: 20 cenários (leitura/escrita própria e
cruzada, anon, sem matrícula, transições de estado inválidas, texto vazio, delete, troca de
`user_id`/`theme_id`, cliente tentando inserir/alterar tema) dentro de uma única transação
`begin ... rollback` — nenhum dado é persistido, independentemente do resultado.

## Como validar migrations

```bash
npx supabase migration list
npx supabase db push --dry-run
```
`db push` real só deve ser executado a partir de um `--dry-run` limpo, mostrando exclusivamente
as migrations da fundação discursiva pendentes — nunca com uma migration histórica no meio.

## Rollback

`supabase/rollbacks/20260812060000_rollback_essay_themes_and_submissions.sql` — **manual only**,
fica fora de `supabase/migrations/` de propósito (a CLI aplica automaticamente tudo que está lá).
Escopo estritamente restrito a `essay_submissions`/`essay_themes` (nesta ordem, por causa da FK).
Nunca executado neste ciclo de validação.

## O que deliberadamente NÃO existe ainda

Nada abaixo foi implementado, esboçado como stub, ou decidido nesta fundação — citado
explicitamente para não ser confundido com contrato oficial:

- Rubrica, Taxonomia, Contrato Pedagógico, Espelho de correção, Casos de Calibração (CAC),
  Orientações Técnicas (OT), DLP, Contrato JSON, Prompt Consolidado.
- Motor de correção por IA, escolha de modelo, escolha de provedor, qualquer chamada de IA.
- Nota, diagnóstico discursivo, evidência, prioridade discursiva, atividade pós-correção.
- Qualquer mecanismo de servidor que mova `essay_submissions.status` para `processing`,
  `corrected` ou `failed` — o enum existe, o mecanismo não.
- Qualquer regra de "um rascunho por tema" — hoje um aluno pode ter mais de um rascunho para o
  mesmo tema (ex.: duas abas abertas); isso não é um defeito de segurança (cada rascunho continua
  isolado por RLS), é uma decisão de produto ainda não tomada — não implementada aqui de propósito.

## Áreas explicitamente não tocadas por este trabalho

Checkout, Asaas, Edge Functions, Storage, `get-download-url`, leads, comportamento comercial da
Sprint Discursiva, `/minha-conta/tutor` (a página em si, só ganhou um link novo), Auth global,
qualquer uma das 10 migrations históricas reconciliadas (commit `758b0be` — apenas rename local,
conteúdo bit-a-bit preservado).
