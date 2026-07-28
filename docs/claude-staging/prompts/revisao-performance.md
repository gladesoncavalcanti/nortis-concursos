# Prompt — revisão de performance

Documento passivo (`docs/claude-staging/`), a promover para `docs/prompts/` na ativação. Uso manual: copiar o texto abaixo e colar em uma sessão do Claude Code quando quiser rodar esta revisão.

## Prompt

```
Revise a performance do frontend do Nortis Concursos (apps/web), focando em:

1. Rode `npm run build` a partir da raiz e reporte o tamanho do bundle gerado
   (dist/apps/web) e quaisquer avisos do Vite sobre chunks grandes.
2. Identifique páginas/rotas que carregam muitas dependências pesadas
   (ex. framer-motion, recharts, os ~30 pacotes Radix UI) e avalie se lazy
   loading de rota resolveria.
3. Verifique carregamento de imagens nas páginas de catálogo (ApostilasPage,
   ProductDetailPage) — tamanho, formato, se há lazy loading.
4. Não há métricas automatizadas (sem Lighthouse CI, sem CI configurado) —
   baseie a análise no output do build e em inspeção manual via DevTools.

Reporte achados priorizados por impacto esperado x esforço, sem aplicar nenhuma
mudança automaticamente — apenas liste recomendações para decisão humana.
```
