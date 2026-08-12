import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const migrationPath = fileURLToPath(new URL(
  '../../../supabase/migrations/20260812045948_seed_specialty_flashcards.sql',
  import.meta.url
));
const sql = readFileSync(migrationPath, 'utf8');

assert.match(sql, /drop policy if exists "flashcard_decks_enrolled_read"/i);
assert.match(sql, /drop policy if exists "flashcards_enrolled_read"/i);
assert.match(sql, /create policy "flashcard_decks_enrolled_read"[\s\S]+?to authenticated/i);
assert.match(sql, /create policy "flashcards_enrolled_read"[\s\S]+?to authenticated/i);
assert.match(sql, /enrollment\.user_id\s*=\s*\(select auth\.uid\(\)\)/i);
assert.match(sql, /enrollment\.status\s*=\s*'active'/i);
assert.match(sql, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/i);
assert.match(sql, /profile\.target_specialty_id\s*=\s*flashcard_decks\.syllabus_node_id/i);
assert.match(sql, /profile\.target_specialty_id\s*=\s*deck\.syllabus_node_id/i);

assert.match(sql, /create or replace function public\.review_flashcard/i);
assert.match(sql, /if v_user is null[\s\S]+?authentication_required/i);
assert.match(sql, /invalid_rating/i);
assert.match(sql, /access_denied/i);
assert.match(sql, /specialty_mismatch/i);
assert.match(sql, /on conflict \(user_id, flashcard_id\) do update/i);
assert.match(sql, /revoke all on function public\.review_flashcard\(uuid, text\) from public, anon/i);
assert.match(sql, /grant execute on function public\.review_flashcard\(uuid, text\) to authenticated/i);

assert.match(sql, /insert into public\.flashcard_decks/i);
assert.match(sql, /specialty\.node_type = 'specialty'/i);
assert.match(sql, /not exists[\s\S]+?existing\.syllabus_node_id = specialty\.id/i);
assert.match(sql, /insert into public\.flashcards/i);
assert.match(sql, /subject\.node_type = 'subject'/i);
assert.match(sql, /subject\.parent_id = specialty\.id/i);
assert.match(sql, /subject\.description/i);
assert.match(sql, /not exists[\s\S]+?existing\.deck_id = deck\.id/i);

assert.doesNotMatch(sql, /insert into public\.(orders|order_items|payments|downloads)/i);
assert.doesNotMatch(sql, /asaas|edge function|secret/i);
assert.doesNotMatch(sql, /delete from|truncate/i);

console.log('Flashcards por especialidade: 28 verificacoes estaticas aprovadas.');
