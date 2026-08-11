import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { normalizeTopicNote, validateTopicNote } from '../src/api/topicNotesModel.js';

assert.equal(normalizeTopicNote('  ponto importante  '), 'ponto importante');
assert.equal(normalizeTopicNote(null), '');
assert.match(validateTopicNote('   ').error, /Escreva/);
assert.equal(validateTopicNote('Anotação válida').error, null);
assert.equal(validateTopicNote('x'.repeat(5000)).error, null);
assert.match(validateTopicNote('x'.repeat(5001)).error, /5000/);

const migrationPath = fileURLToPath(new URL('../../../supabase/migrations/20260811052344_create_student_topic_notes.sql', import.meta.url));
const sql = readFileSync(migrationPath, 'utf8');
assert.match(sql, /create table public\.student_topic_notes/i);
assert.match(sql, /primary key \(user_id, syllabus_node_id\)/i);
assert.match(sql, /char_length\(btrim\(note\)\) between 1 and 5000/i);
assert.match(sql, /enable row level security/i);
assert.match(sql, /for select[\s\S]*to authenticated[\s\S]*auth\.uid\(\)/i);
assert.match(sql, /for insert[\s\S]*with check/i);
assert.match(sql, /for update[\s\S]*using[\s\S]*with check/i);
assert.match(sql, /for delete[\s\S]*auth\.uid\(\)/i);
assert.match(sql, /enrollment\.status = 'active'/i);
assert.match(sql, /enrollment\.expires_at is null or enrollment\.expires_at > now\(\)/i);
assert.match(sql, /revoke all on public\.student_topic_notes from anon, authenticated/i);
assert.match(sql, /grant select, insert, update, delete on public\.student_topic_notes to authenticated/i);
assert.doesNotMatch(sql, /security definer/i);

console.log('Anotações por conteúdo: 19 verificações aprovadas.');
