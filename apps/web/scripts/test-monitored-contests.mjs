import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MONITORED_CONTESTS, getMonitoredContestBySlug } from '../src/config/monitoredContests.js';

const read = (url) => readFileSync(fileURLToPath(url), 'utf8');

const app = read(new URL('../src/App.jsx', import.meta.url));
const header = read(new URL('../src/components/Header.jsx', import.meta.url));
const footer = read(new URL('../src/components/Footer.jsx', import.meta.url));
const contestsPage = read(new URL('../src/pages/ConcursosPage.jsx', import.meta.url));
const detailPage = read(new URL('../src/pages/ConcursoDetailPage.jsx', import.meta.url));
const cta = read(new URL('../src/components/ContestInterestCta.jsx', import.meta.url));
const api = read(new URL('../src/api/contestInterest.js', import.meta.url));
const migration = read(new URL(
  '../../../supabase/migrations/20260831004426_create_contest_interest_leads.sql',
  import.meta.url
));
const migrationWithoutComments = migration
  .split('\n')
  .filter((line) => !line.trimStart().startsWith('--'))
  .join('\n');

assert.ok(MONITORED_CONTESTS.length >= 7, 'deve haver um lote inicial relevante de concursos');

const slugs = MONITORED_CONTESTS.map((contest) => contest.slug);
assert.equal(new Set(slugs).size, slugs.length, 'slugs devem ser únicos');

for (const contest of MONITORED_CONTESTS) {
  assert.equal(contest.statusLabel, 'Em andamento');
  assert.ok(contest.title);
  assert.ok(contest.organ);
  assert.ok(contest.location);
  assert.ok(contest.phase);
  assert.ok(contest.summary);
  assert.ok(contest.nortisPlan);
  assert.ok(contest.sourceLabel);
  assert.ok(contest.sourceUrl);
  assert.ok(Array.isArray(contest.confirmedFacts));
  assert.ok(contest.confirmedFacts.length >= 3);
  assert.equal(getMonitoredContestBySlug(contest.slug)?.title, contest.title);

  if (contest.sourceUrl.startsWith('http')) {
    const sourceHost = new URL(contest.sourceUrl).hostname;
    assert.match(
      sourceHost,
      /(gov\.br|tce\.sp\.gov\.br|rj\.gov\.br|abgf\.gov\.br|ibge\.gov\.br)$/,
      `fonte deve ser oficial: ${contest.sourceUrl}`
    );
  } else {
    assert.match(contest.sourceUrl, /^\/[a-z0-9/-]+$/);
  }
}

assert.match(app, /import ConcursosPage from '@\/pages\/ConcursosPage\.jsx';/);
assert.match(app, /import ConcursoDetailPage from '@\/pages\/ConcursoDetailPage\.jsx';/);
assert.match(app, /path="\/concursos"/);
assert.match(app, /path="\/concursos\/:slug"/);
assert.match(header, /path: '\/concursos', label: 'Concursos'/);
assert.match(footer, /to="\/concursos"/);
assert.match(contestsPage, /MONITORED_CONTESTS\.map/);
assert.match(contestsPage, /Em andamento|statusLabel/);
assert.match(contestsPage, /ContestInterestCta/);
assert.match(detailPage, /getMonitoredContestBySlug/);
assert.match(detailPage, /Informações confirmadas/);
assert.match(detailPage, /não libera matrícula, não envolve pagamento/);
assert.match(detailPage, /ContestInterestCta/);

assert.match(cta, /useAuth\(\)/);
assert.match(cta, /navigate\('\/signup'\)/);
assert.match(cta, /claimContestInterest\(contestSlug\)/);
assert.match(cta, /Interesse registrado/);

assert.match(api, /supabase\.rpc\('claim_contest_interest'/);
assert.doesNotMatch(api, /from\('contest_interest_leads'\)/);

assert.match(migration, /create table if not exists public\.contest_interest_leads/);
assert.match(migration, /user_id uuid not null references auth\.users\(id\) on delete cascade/);
assert.match(migration, /unique \(user_id, contest_slug\)/);
assert.match(migration, /alter table public\.contest_interest_leads enable row level security/);
assert.match(migration, /revoke all on table public\.contest_interest_leads from anon, authenticated/);
assert.match(migration, /create or replace function public\.claim_contest_interest\(p_contest_slug text\)/);
assert.match(migration, /security definer/);
assert.match(migration, /v_user_id uuid := auth\.uid\(\)/);
assert.match(migration, /authentication_required/);
assert.match(migration, /invalid_contest_slug/);
assert.match(migration, /on conflict \(user_id, contest_slug\)/);
assert.match(migration, /grant execute on function public\.claim_contest_interest\(text\) to authenticated/);

for (const slug of slugs) {
  assert.match(migration, new RegExp(`'${slug}'`), `migration deve aceitar o slug ${slug}`);
}

const protectedWords = `${contestsPage}\n${detailPage}`;
assert.doesNotMatch(protectedWords, /asaas|checkout|orders|order_items|supabase\.from|supabase\.rpc/i);
assert.doesNotMatch(migrationWithoutComments, /\b(insert into|update|delete from|drop table|alter table)\s+public\.orders?\b/i);
assert.doesNotMatch(migrationWithoutComments, /\b(insert into|update|delete from|drop table|alter table)\s+public\.order_items\b/i);
assert.doesNotMatch(migrationWithoutComments, /\bpublic\.(orders?|order_items|payments?|asaas\w*)\b/i);

console.log('Concursos em acompanhamento: verificações estáticas aprovadas.');
