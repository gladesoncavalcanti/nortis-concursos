import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { summarizeSimulationReview } from '../src/api/simulationReviewModel.js';

const migration = readFileSync(
  'supabase/migrations/20260902023000_create_student_journey_review_rpcs.sql',
  'utf8'
);

assert.match(migration, /create or replace function public\.get_my_simulation_review\(p_session_id uuid\)/);
assert.match(migration, /session\.user_id = v_user_id/);
assert.match(migration, /session\.status = 'completed'/);
assert.match(migration, /enrollment\.status = 'active'/);
assert.match(migration, /grant execute on function public\.get_my_simulation_review\(uuid\) to authenticated/);
assert.match(migration, /create or replace function public\.get_admin_lead_nurture_queue\(\)/);
assert.match(migration, /profile\.role = 'admin'/);
assert.match(migration, /comment on function public\.get_admin_lead_nurture_queue\(\) is/);
assert.match(migration, /create or replace function public\.get_my_anonymous_performance_benchmark\(\)/);
assert.match(migration, /'minimum_sample', 3/);
assert.match(migration, /'public_ranking', false/);
assert.match(migration, /cohort\.student_count >= 3/);
assert.match(migration, /grant execute on function public\.get_my_anonymous_performance_benchmark\(\) to authenticated/);
assert.doesNotMatch(migration, /grant select on .*contest_interest_leads.*authenticated/i);
assert.doesNotMatch(migration, /create table public\.orders|alter table public\.orders|create-asaas-checkout|asaas_webhook/i);

const review = summarizeSimulationReview([
  {
    question_id: 'q1',
    syllabus_node_id: 'suas',
    syllabus_node_title: 'SUAS',
    is_correct: false,
  },
  {
    question_id: 'q2',
    syllabus_node_id: 'suas',
    syllabus_node_title: 'SUAS',
    is_correct: true,
  },
  {
    question_id: 'q3',
    syllabus_node_id: 'orcamento',
    syllabus_node_title: 'Orçamento',
    is_correct: true,
  },
]);

assert.equal(review.total, 3);
assert.equal(review.correct, 2);
assert.equal(review.incorrect, 1);
assert.equal(review.accuracy, 67);
assert.equal(review.contents[0].title, 'SUAS');
assert.equal(review.contents[0].accuracy, 50);
assert.equal(review.contents[0].status, 'weak');
assert.equal(review.incorrectQuestions.length, 1);

console.log('test-student-journey-review-rpcs: ok');
