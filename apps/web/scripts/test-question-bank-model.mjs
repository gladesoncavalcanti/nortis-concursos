import assert from 'node:assert/strict';
import { buildQuestionBankView } from '../src/api/questionBankModel.js';

const visibleNodes = [{
  id: 'tdas',
  children: [
    { id: 'geral', children: [] },
    { id: 'especialidade-a', children: [{ id: 'a-1', children: [] }] },
  ],
}];
const questions = [
  { id: 'q1', syllabus_node_id: 'geral', syllabus_nodes: { id: 'geral', title: 'Conteúdo geral' } },
  { id: 'q2', syllabus_node_id: 'a-1', syllabus_nodes: { id: 'a-1', title: 'Conteúdo A' } },
  { id: 'q3', syllabus_node_id: 'outra-especialidade', syllabus_nodes: { id: 'outra-especialidade', title: 'Conteúdo B' } },
  { id: 'q4', syllabus_node_id: null, syllabus_nodes: null },
];
const attempts = [
  { id: '1', question_id: 'q1', is_correct: false, answered_at: '2026-08-10T10:00:00Z' },
  { id: '2', question_id: 'q1', is_correct: true, answered_at: '2026-08-11T10:00:00Z' },
  { id: '3', question_id: 'q3', is_correct: false, answered_at: '2026-08-11T11:00:00Z' },
];

const favorites = [{ question_id: 'q2', created_at: '2026-08-12T10:00:00Z' }];
const all = buildQuestionBankView({ questions, attempts, favorites, visibleNodes });
assert.deepEqual(all.questions.map((question) => question.id), ['q1', 'q2']);
assert.equal(all.counts.all, 2);
assert.equal(all.counts.correct, 1);
assert.equal(all.counts.incorrect, 0);
assert.equal(all.counts.unanswered, 1);
assert.equal(all.questions[0].status, 'correct');
assert.equal(all.questions[0].lastAttempt.id, '2');
assert.equal(all.questions[1].favorite, true);
assert.deepEqual(all.contents.map((content) => content.title), ['Conteúdo A', 'Conteúdo geral']);

const unanswered = buildQuestionBankView({ questions, attempts, visibleNodes, status: 'unanswered' });
assert.deepEqual(unanswered.questions.map((question) => question.id), ['q2']);

const correct = buildQuestionBankView({ questions, attempts, visibleNodes, status: 'correct' });
assert.deepEqual(correct.questions.map((question) => question.id), ['q1']);

const byContent = buildQuestionBankView({ questions, attempts, visibleNodes, contentId: 'a-1' });
assert.deepEqual(byContent.questions.map((question) => question.id), ['q2']);

const favoriteOnly = buildQuestionBankView({ questions, attempts, favorites, visibleNodes, onlyFavorites: true });
assert.deepEqual(favoriteOnly.questions.map((question) => question.id), ['q2']);

const searched = buildQuestionBankView({ questions, attempts, visibleNodes, searchText: 'conteúdo geral' });
assert.deepEqual(searched.questions.map((question) => question.id), ['q1']);

const emptyProfile = buildQuestionBankView({ questions, attempts, visibleNodes: [] });
assert.equal(emptyProfile.counts.all, 0);
assert.deepEqual(emptyProfile.questions, []);

console.log('Banco de questões filtrado: 13 verificações aprovadas.');
