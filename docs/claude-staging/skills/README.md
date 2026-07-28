<!--
MODELO INATIVO — não é uma skill real. Fica em docs/claude-staging/skills/,
fora de .claude/skills/, então o Claude Code não a descobre nem executa.
-->

# Convenção para futuras skills

Nenhuma skill real é criada nesta etapa. Este arquivo só documenta a convenção para quando um fluxo de trabalho realmente se repetir e valer a pena formalizar como skill.

## Quando criar uma skill

Só depois de identificar um fluxo que:
- se repete de forma parecida mais de uma vez (não é um pedido único);
- tem passos claros e reproduzíveis, não decisão de julgamento caso a caso;
- se beneficia de ser invocado por um nome curto (`/nome`) em vez de reexplicado toda vez.

Exemplos plausíveis para este projeto (a confirmar antes de criar): "auditoria de SEO de uma página nova", "checklist pré-alteração de checkout", "revisão de novo componente UI contra a identidade visual".

## Como criar (quando chegar a hora)

1. Criar a pasta `.claude/skills/<nome-em-kebab-case>/`.
2. Dentro dela, criar `SKILL.md` com um front-matter mínimo (`name`, `description`) e o passo a passo do fluxo.
3. Manter a skill focada em um único fluxo — se ela cresce para cobrir vários fluxos não relacionados, provavelmente deveria ser duas skills.
4. Nunca incluir segredos, tokens ou dados sensíveis no corpo da skill.

Ver `docs/claude-staging/activation-guide.md` para o contexto de ativação (seção "Ativar skills").
