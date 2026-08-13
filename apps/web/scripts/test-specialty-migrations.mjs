import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const migration = (name) => readFileSync(resolve(root, 'supabase/migrations', name), 'utf8');
const profile = migration('20260810140016_add_target_specialty.sql');
const profileFoundation = migration('20260810123529_create_student_study_profiles.sql');
const subjectFiles = [
  '20260810140042_seed_specialty_subjects.sql',
  '20260810140050_seed_specialty_subjects.sql',
  '20260810140059_seed_specialty_subjects.sql',
  '20260810140110_seed_specialty_subjects.sql',
  '20260810140119_seed_specialty_subjects.sql',
].map(migration);
const subjects = subjectFiles.join('\n');
const specialtyRows = (profile.match(/^  \('/gm) ?? []).length;
const subjectRows = (subjects.match(/^  \('/gm) ?? []).length;
const codes = ['200','201','202','400','401','402','403','404','405','406','407','408','409','410','411'];

assert.equal(specialtyRows, 15);
assert.equal(subjectRows, 68);
codes.forEach((code) => assert.match(profile, new RegExp(`Cargo ${code} -`)));
assert.match(profile, /target_specialty_id uuid references public\.syllabus_nodes/);
assert.match(profile, /revoke all on public\.student_study_profiles from authenticated/);
assert.match(profile, /grant select, insert, update on public\.student_study_profiles to authenticated/);
assert.match(profile, /create function public\.validate_study_profile_specialty\(\)/);
assert.match(profile, /before insert or update of target_role, target_specialty_id/);
assert.match(profile, /specialty_type is distinct from 'specialty'/);
assert.match(profileFoundation, /study_profiles_self_read/);
assert.match(profileFoundation, /study_profiles_self_insert/);
assert.match(profileFoundation, /study_profiles_self_update/);
assert.match(profileFoundation, /user_id=\(select auth\.uid\(\)\)/);
subjectFiles.forEach((sql) => {
  assert.match(sql, /^with subject_seed/m);
  assert.match(sql, /on conflict do nothing;\s*$/);
});
assert.doesNotMatch(subjects, /LUANNA KIM|tokens truncated|2001\.4\.7/);
assert.match(subjects, /Lei Distrital nº 2\.834\/2001\. 4\.7 Lei de Improbidade/);
assert.match(subjects, /Psicologia Social/);
assert.match(subjects, /Metodologia de Pesquisa Social e Avaliação de Políticas/);
console.log('Specialty migrations: verificações aprovadas.');
