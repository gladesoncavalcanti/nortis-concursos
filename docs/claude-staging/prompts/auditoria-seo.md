# Prompt — auditoria de SEO

Documento passivo (`docs/claude-staging/`), a promover para `docs/prompts/` na ativação. Uso manual: copiar o texto abaixo e colar em uma sessão do Claude Code quando quiser rodar esta auditoria.

## Prompt

```
Faça uma auditoria de SEO on-page do site Nortis Concursos (SPA React, apps/web),
focada em:

1. Meta tags: verifique, para cada página em apps/web/src/pages/, se react-helmet
   define título, descrição e (quando fizer sentido) dados estruturados coerentes
   com o conteúdo da página.
2. tools/generate-llms.js: confirme o que esse script gera no build e se o
   conteúdo está atualizado com as páginas/produtos reais.
3. Estrutura de URLs: avalie se as rotas (react-router-dom v7) são claras e
   amigáveis para indexação.
4. Limitações conhecidas de SPA: sinalize explicitamente onde a renderização
   client-side pode limitar indexação, sem prometer resultado que dependeria de
   SSR/SSG (não implementado neste projeto).

Reporte achados priorizados, sem aplicar nenhuma mudança automaticamente —
apenas liste recomendações para decisão humana.
```
