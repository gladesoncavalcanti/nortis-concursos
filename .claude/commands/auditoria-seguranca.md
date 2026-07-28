Faça uma auditoria de segurança no repositório Nortis Concursos, focada em:

1. Segredos: procure por chaves Supabase (especialmente service_role), tokens Asaas,
   ou qualquer valor que pareça ter saído de um .env, em código, commits recentes,
   documentação e configurações do .claude/. Nada disso deveria estar versionado.
2. Autenticação e autorização: verifique se rotas/páginas sensíveis (área do aluno,
   dados de pedido) estão de fato protegidas (ProtectedRoute + regras no Supabase),
   não só escondidas na UI.
3. Webhook do Asaas (supabase/functions/asaas-webhook): confirme que ele valida a
   autenticidade da origem antes de confiar no payload recebido.
4. Dependências: rode `npm run lint` a partir da raiz e reporte problemas relevantes;
   note que não há scanner de vulnerabilidades automatizado configurado no projeto.

Reporte achados por severidade, sem executar nenhuma correção automaticamente —
apenas liste o que encontrou e recomende o próximo passo para cada item.
