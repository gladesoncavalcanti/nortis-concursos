---
name: alteracao-segura
description: Fluxo obrigatório de segurança para qualquer tarefa que altere código, arquivos, configurações, dependências, banco de dados, Supabase, Asaas, checkout, preços, autenticação, dados de usuários, deploy ou produção no Nortis Concursos. Use antes, durante e depois de implementar mudanças.
---

# Alteração segura — Nortis Concursos

Aplique este fluxo sempre que a tarefa puder modificar o repositório ou algum ambiente do projeto.

## 1. Antes de alterar

Confirme e relate:

1. branch atual;
2. estado de `git status --short`;
3. objetivo exato da mudança;
4. arquivos reais que deverão ser consultados ou alterados;
5. scripts disponíveis no `package.json`;
6. ambiente em que a mudança será testada;
7. forma de reversão.

Nunca implemente diretamente em `feature/supabase-base`. Crie uma branch isolada e atualizada, salvo instrução humana explícita em contrário.

Não presuma caminhos, integrações ou comandos com base apenas em documentação. Verifique sua existência real no repositório.

## 2. Classificação de risco

Classifique a tarefa como:

- **baixo risco:** conteúdo, estilo isolado, documentação ou ajuste visual sem lógica;
- **médio risco:** componentes, rotas, estado, dependências, desempenho ou SEO;
- **alto risco:** checkout, preço, Asaas, Supabase, Edge Functions, autenticação, RLS, dados pessoais, variáveis de ambiente, domínio, Vercel ou produção.

Para tarefas de alto risco:

1. pare antes de editar;
2. informe os arquivos e riscos;
3. solicite aprovação humana explícita;
4. consulte as regras específicas em `docs/claude-staging/rules/`;
5. use o subagente adequado para revisão de leitura quando disponível.

## 3. Proteções obrigatórias

- Nunca exponha chaves, tokens, senhas ou conteúdo de `.env`.
- Nunca coloque `service_role` no frontend.
- Nunca envie preço confiando apenas no valor recebido do frontend.
- Nunca crie cobrança real durante testes.
- Nunca altere produção, domínio, DNS, Vercel, variáveis reais, Supabase ou Asaas de produção sem aprovação explícita.
- Nunca faça commit, push, crie PR, marque PR como pronto ou faça merge sem autorização específica para cada etapa.
- Não altere arquivos fora do escopo.
- Reaproveite componentes, hooks e padrões existentes antes de criar novos.
- Não adicione dependências sem justificar a necessidade.

## 4. Durante a implementação

- Faça a menor mudança suficiente.
- Preserve o funcionamento existente.
- Revise o diff durante o trabalho.
- Verifique se arquivos gerados, especialmente `apps/web/public/llms.txt`, foram alterados involuntariamente.
- Não misture correções não relacionadas.
- Em mudanças visuais, preserve a identidade azul-marinho e dourada do Nortis.
- Em checkout ou pagamento, mantenha o cálculo e a validação final no servidor.

## 5. Validação obrigatória

Antes de considerar a tarefa concluída:

1. execute `npm run lint`;
2. execute `npm run build`;
3. use a pré-visualização local e o Auto Verify quando houver mudança visual ou funcional;
4. teste a área alterada;
5. teste responsividade quando houver impacto de interface;
6. execute `git diff`;
7. execute `git status --short`;
8. confirme que somente os arquivos pretendidos foram alterados;
9. confirme que nenhum segredo apareceu;
10. confirme que nenhuma configuração de produção foi modificada.

O CI do GitHub também executará lint e build no pull request, mas não substitui a validação local.

## 6. Regras adicionais por área

### Checkout, preço ou Asaas

Leia `docs/claude-staging/rules/checkout-asaas.md` antes de editar.

Confirme:

- ambiente sandbox;
- preço recalculado no servidor;
- proteção contra cobrança duplicada;
- idempotência;
- validação de webhook;
- nenhuma cobrança real.

### Supabase, autenticação ou dados

Leia `docs/claude-staging/rules/seguranca-dados.md` antes de editar.

Confirme:

- rotas protegidas;
- políticas RLS;
- separação entre chave pública e `service_role`;
- ausência de dados sensíveis em logs e bundle;
- princípio do menor privilégio.

### Dependências

Confirme que:

- a dependência é necessária;
- a solução não existe na stack atual;
- a alteração está dentro do escopo;
- `package-lock.json` foi atualizado de forma coerente.

## 7. Relatório final obrigatório

Entregue:

- classificação do risco;
- branch usada;
- arquivos alterados;
- resumo objetivo da implementação;
- resultado do lint;
- resultado do build;
- resultado da verificação visual, quando aplicável;
- resultado de `git status --short`;
- riscos restantes;
- ações que ainda dependem de autorização humana.

Pare antes de commit, push, PR ou merge, salvo quando essas ações tiverem sido autorizadas explicitamente.
