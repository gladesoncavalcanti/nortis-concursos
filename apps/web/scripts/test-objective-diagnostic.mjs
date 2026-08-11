import assert from 'node:assert/strict';
import {
  buildDiagnosticEvolution,
  buildObjectiveDiagnostic,
  rankObjectiveWeaknesses,
} from '../src/api/objectiveDiagnosticModel.js';

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
  { question_id: 'q1', is_correct: true, answered_at: '2026-08-10T08:00:00Z', diagnostic_cycles: { cycle_number: 1 }, questions: { syllabus_nodes: questions[0].syllabus_nodes } },
  { question_id: 'q2', is_correct: false, answered_at: '2026-08-10T08:00:00Z', diagnostic_cycles: { cycle_number: 1 }, questions: { syllabus_nodes: questions[1].syllabus_nodes } },
  { question_id: 'q1', is_correct: false, answered_at: '2026-08-10T10:00:00Z', diagnostic_cycles: { cycle_number: 2 }, questions: { syllabus_nodes: questions[0].syllabus_nodes } },
  { question_id: 'q2', is_correct: true, answered_at: '2026-08-10T10:00:00Z', diagnostic_cycles: { cycle_number: 2 }, questions: { syllabus_nodes: questions[1].syllabus_nodes } },
  { question_id: 'q3', is_correct: false, answered_at: '2026-08-10T10:00:00Z', diagnostic_cycles: { cycle_number: 2 }, questions: { syllabus_nodes: { id: 'other', title: 'Outra especialidade', node_type: 'subject' } } },
], ['s1', 's2']);

assert.deepEqual(weaknesses.map((item) => item.title), ['Rede SUAS']);
assert.deepEqual(weaknesses.map((item) => item.accuracy), [0]);
assert.equal(weaknesses[0].answered, 1, 'somente o ciclo mais recente orienta a prioridade');

const noWeaknesses = rankObjectiveWeaknesses([
  { question_id: 'q1', is_correct: false, answered_at: '2026-08-10T08:00:00Z', diagnostic_cycles: { cycle_number: 1 }, questions: { syllabus_nodes: questions[0].syllabus_nodes } },
  { question_id: 'q1', is_correct: true, answered_at: '2026-08-10T10:00:00Z', diagnostic_cycles: { cycle_number: 2 }, questions: { syllabus_nodes: questions[0].syllabus_nodes } },
  { question_id: 'q2', is_correct: true, answered_at: '2026-08-10T10:00:00Z', diagnostic_cycles: { cycle_number: 2 }, questions: { syllabus_nodes: questions[1].syllabus_nodes } },
], ['s1', 's2']);
assert.deepEqual(noWeaknesses, [], 'um ciclo mais recente com 100% não gera reforço por desempenho');

const cycles = [
  { id: 'c1', cycle_number: 1, status: 'completed', started_at: '2026-08-01T10:00:00Z', completed_at: '2026-08-01T10:20:00Z' },
  { id: 'c2', cycle_number: 2, status: 'completed', started_at: '2026-08-10T10:00:00Z', completed_at: '2026-08-10T10:20:00Z' },
];
const history = [
  { cycle_id: 'c1', cycle_number: 1, cycle_status: 'completed', subject_id: 's1', subject_title: 'Rede SUAS', answered: 1, correct: 0, accuracy: 0 },
  { cycle_id: 'c1', cycle_number: 1, cycle_status: 'completed', subject_id: 's2', subject_title: 'PAIF', answered: 1, correct: 1, accuracy: 100 },
  { cycle_id: 'c2', cycle_number: 2, cycle_status: 'completed', subject_id: 's1', subject_title: 'Rede SUAS', answered: 1, correct: 1, accuracy: 100 },
  { cycle_id: 'c2', cycle_number: 2, cycle_status: 'completed', subject_id: 's2', subject_title: 'PAIF', answered: 1, correct: 1, accuracy: 100 },
];
const evolution = buildDiagnosticEvolution({ cycles, history, selfAssessments });
assert.equal(evolution.cycles.length, 2, 'os dois ciclos permanecem no histórico');
assert.equal(evolution.initial.accuracy, 50);
assert.equal(evolution.current.accuracy, 100);
assert.equal(evolution.overall.key, 'improved');
assert.equal(evolution.overall.delta, 50);
assert.equal(evolution.comparison.find((item) => item.subjectId === 's1').trend.key, 'improved');
assert.equal(evolution.comparison.find((item) => item.subjectId === 's2').trend.key, 'stable');
assert.equal(evolution.comparison.find((item) => item.subjectId === 's1').selfConfidence, 5, 'autopercepção permanece um sinal separado');
console.log('Objective diagnostic: ciclos, evolução e cálculo recente aprovados.');
