import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(
  new URL(
    '../../../supabase/migrations/20260811030248_create_review_attempt_function.sql',
    import.meta.url
  ),
  'utf8'
);

assert.match(migration, /create or replace function public\.submit_review_attempt/);
assert.match(migration, /security definer\s+set search_path = ''/);
assert.match(migration, /v_user_id uuid := auth\.uid\(\)/);
assert.match(migration, /enrollment\.status = 'active'/);
assert.match(migration, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/);
assert.match(migration, /profile\.target_specialty_id = v_specialty_id/);
assert.match(migration, /option\.question_id = p_question_id/);
assert.match(migration, /order by attempt\.answered_at desc, attempt\.id desc/);
assert.match(migration, /v_latest_attempt_id is null or v_latest_is_correct/);
assert.match(migration, /raise exception 'review_not_pending'/);
assert.match(migration, /'practice',\s+null,\s+null/);
assert.match(migration, /revoke all on function public\.submit_review_attempt\(uuid, uuid\) from public, anon/);
assert.match(migration, /grant execute on function public\.submit_review_attempt\(uuid, uuid\) to authenticated/);

console.log('Revisão inteligente: 13 proteções da migration aprovadas.');
