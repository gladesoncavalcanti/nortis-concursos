// Valida a camada de acesso (funções puras testáveis sem rede) e a
// integração de rotas/componentes do fluxo discursivo, além de
// confirmar que áreas protegidas e a rota /minha-conta/tutor
// permanecem intactas. Mesmo padrão estático dos demais testes do
// projeto — sem chamada real ao Supabase.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isEssayTextSubmittable } from '../src/api/essaySubmissionValidation.js';

const srcPath = (relative) => fileURLToPath(new URL(`../src/${relative}`, import.meta.url));
const read = (relative) => readFileSync(srcPath(relative), 'utf8');

// 7) submissão vazia rejeitada na camada aplicável (função pura)
assert.equal(isEssayTextSubmittable(''), false);
assert.equal(isEssayTextSubmittable('   '), false);
assert.equal(isEssayTextSubmittable('\n\t  '), false);
assert.equal(isEssayTextSubmittable(null), false);
assert.equal(isEssayTextSubmittable(undefined), false);
assert.equal(isEssayTextSubmittable('Texto válido.'), true);

// 8) tema obrigatório na criação: createEssayDraft exige themeId no
// insert (verificação estática do código-fonte)
const submissionsApi = read('api/essaySubmissions.js');
assert.match(submissionsApi, /export async function createEssayDraft\(\{\s*themeId\s*\}\)/);
assert.match(submissionsApi, /\.insert\(\{\s*user_id:\s*user\.id,\s*theme_id:\s*themeId\s*\}\)/);

// 9) fluxo de criação da submissão: draft -> atualizar texto -> enviar,
// cada etapa mapeada para uma função exportada distinta
assert.match(submissionsApi, /export async function updateEssayDraftText/);
assert.match(submissionsApi, /export async function submitEssay/);
assert.match(submissionsApi, /export async function getMyEssaySubmission/);
assert.match(submissionsApi, /status: 'submitted'/);
assert.match(submissionsApi, /submitted_at: new Date\(\)\.toISOString\(\)/);

// submitEssay rejeita texto vazio antes de tentar a escrita
assert.match(submissionsApi, /if \(!isEssayTextSubmittable\(text\)\)/);

const themesApi = read('api/essayThemes.js');
assert.match(themesApi, /export async function getActiveEssayThemes/);
assert.match(themesApi, /export async function getEssayThemeById/);

// 11) componentes/rotas esperadas
const app = read('App.jsx');
assert.match(app, /import EssayThemesPage from '@\/pages\/EssayThemesPage\.jsx'/);
assert.match(app, /import EssayEditorPage from '@\/pages\/EssayEditorPage\.jsx'/);
assert.match(app, /path="\/minha-conta\/tutor\/redacao"/);
assert.match(app, /path="\/minha-conta\/tutor\/redacao\/:submissionId"/);

const themesPage = read('pages/EssayThemesPage.jsx');
assert.match(themesPage, /getActiveEssayThemes/);
// getOrCreateEssayDraft (não createEssayDraft direto): regra "1 draft
// por tema" (20260818023136_add_essay_submissions_one_draft_per_theme.sql)
// exige buscar o rascunho existente antes de criar um novo — ver
// test-essay-draft-per-theme.mjs para a verificação dedicada dessa regra.
assert.match(themesPage, /getOrCreateEssayDraft/);
assert.match(themesPage, /Nenhum tema disponível no momento/); // estado vazio
assert.match(themesPage, /role="alert"/); // estado de erro
assert.match(themesPage, /animate-spin/); // estado de carregamento

const editorPage = read('pages/EssayEditorPage.jsx');
assert.match(editorPage, /getMyEssaySubmission/);
assert.match(editorPage, /updateEssayDraftText/);
assert.match(editorPage, /submitEssay/);
assert.match(editorPage, /Confirmar envio/); // confirmação antes do envio
assert.match(editorPage, /Redação enviada/); // estado neutro pós-envio
// não promete nota, correção ou revisão humana (frases de afirmação,
// não a mera menção ao tema em comentários explicativos)
assert.doesNotMatch(editorPage, /sua nota|nota final|correção realizada|revisão humana|corrigid[ao] com|resultado da correção/i);

// 12) rota antiga /minha-conta/tutor permanece existente e intocada em
// sua lógica original
assert.match(app, /path="\/minha-conta\/tutor"/);
const tutorPage = read('pages/StudyTutorPage.jsx');
assert.match(tutorPage, /buildTutorGuidance/);
assert.match(tutorPage, /O que estudar agora\?/);
assert.match(tutorPage, /Nenhum texto é enviado a um provedor externo de IA/);

// 13) Sprint Discursiva existente permanece intacta
const sprintPage = read('pages/SprintDiscursivaPage.jsx');
assert.match(sprintPage, /revisão humana nas correções pagas/i);
assert.match(sprintPage, /Ainda não há compra online/i);
const discursivaInterestApi = read('api/discursivaInterest.js');
assert.match(discursivaInterestApi, /discursive_interest_leads/);
assert.match(app, /path="\/sprint-discursiva-sedes-df"/);

// Fase 4 (deliberadamente não implementada nesta noite): nenhuma
// referência a motor de IA, rubrica, taxonomia, DLP ou prompt em
// runtime dentro do fluxo discursivo novo.
for (const file of [submissionsApi, themesApi, themesPage, editorPage]) {
  assert.doesNotMatch(file, /openai|anthropic|rubrica|taxonomia|prompt consolidado|\bdlp\b/i);
}

console.log('Fundação discursiva — camada de acesso e fluxo: 27 verificações aprovadas.');
