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
assert.match(detailPage, /getMonitoredContestBySlug/);
assert.match(detailPage, /Informações confirmadas/);

const protectedWords = `${contestsPage}\n${detailPage}`;
assert.doesNotMatch(protectedWords, /asaas|checkout|orders|order_items|supabase\.from|supabase\.rpc/i);

console.log('Concursos em acompanhamento: verificações estáticas aprovadas.');
