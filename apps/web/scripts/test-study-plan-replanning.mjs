import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const api = await readFile(new URL('../src/api/suggestedStudyPlan.js', import.meta.url), 'utf8');
const migration = await readFile(
  new URL('../../../supabase/migrations/20260811020152_add_study_plan_item_source.sql', import.meta.url),
  'utf8'
);

assert.match(api, /\.eq\('item_source', 'suggested'\)/);
assert.match(api, /\.gte\('scheduled_date', firstDate\)/);
assert.match(api, /\.lte\('scheduled_date', lastDate\)/);
assert.match(api, /item_source: 'suggested'/);
assert.doesNotMatch(api, /\.delete\(\)[\s\S]+?item_source', 'manual'/);

assert.match(migration, /add column item_source text not null default 'manual'/);
assert.match(migration, /check \(item_source in \('manual', 'suggested'\)\)/);
assert.match(migration, /where item_source = 'suggested'/);

console.log('Study plan replanning: generated items are isolated and replaced within the target week.');
