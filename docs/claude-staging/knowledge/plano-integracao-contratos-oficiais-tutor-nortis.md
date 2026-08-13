# PLANO de integração dos contratos oficiais do motor de correção — Tutor Nortis

> **Isto é um PLANO técnico, não um contrato oficial.** Nenhum dos onze artefatos abaixo teve
> conteúdo literal disponível nesta sessão de trabalho. Nada aqui foi recriado, inferido ou
> preenchido por memória — apenas a estrutura de integração (quem consome o quê, em que ordem,
> com que testes) para quando o conteúdo literal existir e for fornecido pelo Controle Mestre.
> Documento passivo (`docs/claude-staging/`), sujeito à mesma ressalva de
> `docs/claude-staging/knowledge/README.md`.

## Os onze artefatos (existem conceitualmente, conteúdo literal ausente)

1. Rubrica Nortis v1
2. Taxonomia Nortis v1
3. Contrato Pedagógico
4. Espelho Nortis por Tema
5. Catálogo Nortis de Atividades
6. Casos de Calibração (CAC)
7. Protocolo DLP/Desempate
8. Contrato Técnico Estruturado
9. Contrato JSON Nortis v1
10. Subcontrato JSON de Saída da IA
11. Prompt Consolidado do Corretor Nortis v1

## Quem consome cada artefato

| Artefato | Consumidor | Camada |
|---|---|---|
| Rubrica Nortis v1 | Motor de correção (ainda não existe) | Backend/Edge Function futura |
| Taxonomia Nortis v1 | Motor de correção; possivelmente `essay_themes` (categorização) | Backend + Banco (coluna futura?) |
| Contrato Pedagógico | Motor de correção — regras de julgamento | Backend |
| Espelho Nortis por Tema | Motor de correção — por `essay_themes.id` específico | Backend, referenciando `essay_themes` |
| Catálogo Nortis de Atividades | Fluxo pós-correção (não existe) — o que oferecer ao aluno após o resultado | Backend + Frontend futuro |
| Casos de Calibração (CAC) | Validação/teste do motor de correção antes de ir ao ar | Testes do backend, não roda em produção |
| Protocolo DLP/Desempate | Motor de correção — resolução de ambiguidade de nota/critério | Backend |
| Contrato Técnico Estruturado | Define a interface entre motor de correção e banco/frontend | Todas as camadas (é o contrato "guarda-chuva") |
| Contrato JSON Nortis v1 | Formato de entrada enviado ao provedor de IA (ainda sem provedor escolhido) | Backend (Edge Function futura) |
| Subcontrato JSON de Saída da IA | Formato de saída esperado do provedor de IA — precisa virar uma coluna/estrutura em `essay_submissions` (ex. `result_payload jsonb`, ainda não existe) | Backend + Banco (migration futura) |
| Prompt Consolidado do Corretor Nortis v1 | Texto literal enviado ao modelo de IA (provedor/modelo ainda não escolhidos) | Backend (Edge Function futura) |

## Dependências entre eles (ordem lógica, não uma escolha de implementação)

```
Contrato Técnico Estruturado (define a interface geral)
        │
        ├── Taxonomia Nortis v1 ──┐
        ├── Rubrica Nortis v1 ────┤── formam o julgamento do Contrato Pedagógico
        ├── Espelho por Tema ─────┘   (cada tema precisa do seu próprio espelho)
        │
        ├── Contrato JSON Nortis v1 (entrada) ──┐
        ├── Subcontrato JSON de Saída da IA ─────┤── moldam o Prompt Consolidado
        │                                         │   e o schema de resposta esperado
        ├── Protocolo DLP/Desempate ─────────────┘
        │
        ├── Casos de Calibração (CAC) ── valida o conjunto acima ANTES de qualquer
        │                                 chamada real de IA em produção
        │
        └── Catálogo Nortis de Atividades ── só faz sentido depois que uma correção
                                               real (Rubrica + Espelho + Contrato JSON)
                                               já produz um resultado utilizável
```

## Ordem recomendada de implementação (quando o conteúdo literal existir)

1. **Contrato Técnico Estruturado** — define a interface antes de qualquer código, evita retrabalho.
2. **Migration de banco** para os campos novos que o resultado da correção vai precisar (ex. `essay_submissions.result_payload jsonb`, possivelmente uma tabela nova `essay_corrections` separada de `essay_submissions` para não sobrecarregar a tabela existente) — decisão de schema real só quando o Contrato JSON/Subcontrato de Saída estiverem disponíveis, não antes.
3. **Rubrica + Taxonomia + Espelho por Tema** — carregados como dado (provavelmente uma tabela nova, não hardcoded em código), associados a `essay_themes.id`.
4. **Contrato JSON de entrada + Prompt Consolidado** — só depois que 1–3 existem, porque o prompt referencia a rubrica/taxonomia/espelho.
5. **Casos de Calibração** rodados contra o motor antes de qualquer submissão real de aluno ser processada.
6. **Protocolo DLP/Desempate** — tratamento de caso-limite, implementado junto com o motor, testado com CAC.
7. **Catálogo de Atividades pós-correção** — última peça, depende de um resultado real já existir.

## Testes necessários (quando esta fase começar)

- Testes de schema para qualquer tabela/coluna nova (mesmo padrão de `test-essay-foundation-schema.mjs`).
- Testes de contrato: validar que o JSON de entrada gerado bate exatamente com o Contrato JSON Nortis v1 antes de qualquer chamada real de IA.
- Testes de Casos de Calibração como suíte obrigatória antes de qualquer deploy do motor de correção — falha de qualquer CAC bloqueia o deploy.
- Testes de RLS para qualquer tabela nova de resultado de correção (aluno só vê o próprio resultado — mesmo padrão de `essay_submissions_self_read`).
- Teste de que o texto do aluno nunca é logado/exposto fora do necessário (LGPD/DLP).

## Pontos de segurança a considerar desde já (sem implementar nada agora)

- Chave/token do provedor de IA nunca no frontend — só em Edge Function, mesmo padrão do Asaas.
- Custo por chamada de IA é dinheiro real — precisa de alguma forma de limite/quota antes de produção (fora de escopo desta sessão, mas relevante para quando essa fase começar).
- Resultado da correção deve seguir a mesma regra de RLS "só o dono lê" já estabelecida para `essay_submissions`.
- Nenhuma nota/diagnóstico deve ser exposta como definitiva sem alguma forma de tratamento de erro do provedor de IA (timeout, resposta malformada, etc.) — o Protocolo DLP/Desempate provavelmente cobre parte disso, mas o tratamento de falha técnica (não pedagógica) do provedor é uma responsabilidade adicional do backend.

## O que este documento explicitamente NÃO faz

Não cria nenhuma tabela, coluna, função, Edge Function, policy ou arquivo de configuração relacionado ao motor de correção. Não escolhe provedor de IA, modelo, nem estima custo. Não inventa nenhum conteúdo de Rubrica/Taxonomia/Espelho/CAC/DLP/Contrato JSON/Prompt. É estritamente um mapa de integração para quando o conteúdo literal desses artefatos for fornecido pelo Controle Mestre.
