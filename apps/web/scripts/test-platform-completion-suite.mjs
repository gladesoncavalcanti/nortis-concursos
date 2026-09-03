import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync(
  'supabase/migrations/20260903090000_create_platform_completion_suite.sql',
  'utf8'
);
const questionApi = readFileSync('apps/web/src/api/questions.js', 'utf8');
const questionFavoritesApi = readFileSync('apps/web/src/api/questionFavorites.js', 'utf8');
const questionBankPage = readFileSync('apps/web/src/pages/QuestionBankPage.jsx', 'utf8');
const materialsPage = readFileSync('apps/web/src/pages/MaterialsLibraryPage.jsx', 'utf8');
const materialMarksApi = readFileSync('apps/web/src/api/materialMarks.js', 'utf8');
const adminPage = readFileSync('apps/web/src/pages/AdminDashboardPage.jsx', 'utf8');
const simulationsPage = readFileSync('apps/web/src/pages/SimulationsPage.jsx', 'utf8');
const productDetailPage = readFileSync('apps/web/src/pages/ProductDetailPage.jsx', 'utf8');
const nurtureConfig = readFileSync('apps/web/src/config/nurtureCampaigns.js', 'utf8');
const assetsConfig = readFileSync('apps/web/src/config/sedesLearningAssets.js', 'utf8');

assert.match(migration, /create table if not exists public\.question_favorites/);
assert.match(migration, /primary key \(user_id, question_id\)/);
assert.match(migration, /question_favorites_self_read/);
assert.match(migration, /question_favorites_self_insert/);
assert.match(migration, /question_favorites_self_delete/);
assert.match(migration, /from public\.questions question/);
assert.match(migration, /join public\.enrollments enrollment/);
assert.match(migration, /enrollment\.product_id = question\.product_id/);
assert.match(migration, /enrollment\.status = 'active'/);

assert.match(migration, /create table if not exists public\.student_material_marks/);
assert.match(migration, /student_material_marks_self_update/);
assert.match(migration, /create table if not exists public\.student_leaderboard_snapshots/);
assert.match(migration, /scope_type in \('weekly', 'subject', 'simulation', 'specialty'\)/);
assert.match(migration, /create table if not exists public\.lead_nurture_campaign_steps/);
assert.match(migration, /boas-vindas/);
assert.match(migration, /reativacao-7-dias/);

assert.doesNotMatch(migration, /sendgrid|twilio|resend|smtp|whatsapp_business|fetch\(|net\.http/i);
assert.doesNotMatch(migration, /create-asaas|asaas|checkout_url|public\.orders|public\.order_items/i);
assert.doesNotMatch(migration, /alter table public\.orders|alter table public\.order_items|alter table public\.products/i);

assert.match(questionApi, /getMyQuestionFavorites/);
assert.match(questionApi, /favoritesUnavailable/);
assert.match(questionFavoritesApi, /question_favorites/);
assert.match(questionFavoritesApi, /upsert/);
assert.match(questionFavoritesApi, /delete\(\)/);
assert.match(questionBankPage, /Mostrar somente questões favoritas/);
assert.match(questionBankPage, /Buscar por assunto ou termo/);
assert.match(questionBankPage, /Favoritar/);

assert.match(materialMarksApi, /student_material_marks/);
assert.match(materialsPage, /Marcar estudado/);
assert.match(materialsPage, /getMyMaterialMarks/);
assert.match(assetsConfig, /resumo-servico-social-pse/);
assert.match(assetsConfig, /mapa-tecnico-administrativo-processo/);
assert.match(assetsConfig, /resumo-direito-administrativo-autotutela/);

assert.match(simulationsPage, /Boletim do simulado/);
assert.match(simulationsPage, /modo prova sem feedback durante a tentativa/);
assert.match(simulationsPage, /Variação frente à tentativa anterior/);

assert.match(adminPage, /Exportar radar/);
assert.match(adminPage, /Alertas operacionais/);
assert.match(adminPage, /Régua de relacionamento SEDES/);
assert.match(nurtureConfig, /SEDES_NURTURE_CAMPAIGN_STEPS/);
assert.match(nurtureConfig, /whatsapp/);
assert.match(productDetailPage, /Oferta de lançamento SEDES-DF/);
assert.match(productDetailPage, /O acesso gratuito provisório continua separado da compra paga/);

console.log('Suite de conclusão da plataforma: verificações estáticas aprovadas.');
