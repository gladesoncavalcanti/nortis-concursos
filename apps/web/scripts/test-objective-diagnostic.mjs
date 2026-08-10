import assert from 'node:assert/strict';
import { buildObjectiveDiagnostic, rankObjectiveWeaknesses } from '../src/api/objectiveDiagnosticModel.js';

const questions = [
  { id: 'q1', sort_order: 10, syllabus_nodes: { id: 's1', title: 'Rede SUAS', node_type: 'subject' } },
  { id: 'q2', sort_order: 20, syllabus_nodes: { id: 's2', title: 'PAIF', node_type: 'subject' } },
];
const results = [
  { question_id: 'q1', is_correct: false, answered_at: '2026-08-10T10:00:00Z' },
  { question_id: 'q1', is_correct: true, answered_at: '2026-08-10T09:00:00Z' },
];
const selfAssessments = [
  { syllabus_node_id: 's1', confidence: 5 },
  { syllabus_node_id: 's2', confidence: 2 },
];

const summary = buildObjectiveDiagnostic({ questions, results, selfAssessments });
assert.equal(summary.total, 2);
assert.equal(summary.answered, 1, 'uma questão não pode ser contada duas vezes');
assert.equal(summary.correct, 0, 'vale o resultado mais recente');
assert.equal(summary.accuracy, 0);
assert.equal(summary.completed, false);
assert.equal(summary.comparison[0].selfConfidence, 5);
assert.equal(summary.comparison[0].accuracy, 0);
assert.equal(summary.comparison[1].selfConfidence, 2);
assert.equal(summary.comparison[1].accuracy, null);

const weaknesses = rankObjectiveWeaknesses([
  { question_id: 'q1', is_correct: true, answered_at: '2026-08-10T08:00:00Z', questions: { syllabus_nodes: questions[0].syllabus_nodes } },
  { question_id: 'q1', is_correct: false, answered_at: '2026-08-10T10:00:00Z', questions: { syllabus_nodes: questions[0].syllabus_nodes } },
  { question_id: 'q2', is_correct: true, answered_at: '2026-08-10T10:00:00Z', questions: { syllabus_nodes: questions[1].syllabus_nodes } },
  { question_id: 'q3', is_correct: false, answered_at: '2026-08-10T10:00:00Z', questions: { syllabus_nodes: { id: 'other', title: 'Outra especialidade', node_type: 'subject' } } },
], ['s1', 's2']);

assert.deepEqual(weaknesses.map((item) => item.title), ['Rede SUAS', 'PAIF']);
assert.deepEqual(weaknesses.map((item) => item.accuracy), [0, 100]);
assert.equal(weaknesses[0].answered, 1, 'repetição da mesma questão não duplica evidência');
console.log('Objective diagnostic: verificações de cálculo aprovadas.');
