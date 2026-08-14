/**
 * Regras puras de validação de submissão de redação — sem nenhum
 * import, para poder ser testado com `node` puro, sem bundler (ver
 * apps/web/scripts/test-essay-foundation-flow.mjs). Mesmo padrão de
 * discursivaInterestValidation.js.
 */

/**
 * Um texto só pode ser efetivamente enviado se restar conteúdo depois
 * de removidos os espaços nas pontas. Mesma regra aplicada pelo
 * constraint essay_submissions_non_empty_when_active no banco —
 * validar aqui evita uma ida desnecessária ao servidor, mas o banco
 * continua sendo a autoridade final, independente do que o client
 * envie.
 */
export function isEssayTextSubmittable(text) {
  return typeof text === 'string' && text.trim().length > 0;
}
