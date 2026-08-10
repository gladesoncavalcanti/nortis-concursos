import assert from 'node:assert/strict';
import { collectSubjectIds, filterSyllabusForProfile, getSpecialtyOptions } from '../src/api/specialtySelection.js';

const nodes = [
  { id: 'tdas', slug: 'tdas', children: [
    { id: 'common-t', node_type: 'subject', children: [] },
    { id: 'agent', title: 'Agente Social', node_type: 'specialty', children: [{ id: 'agent-subject', node_type: 'subject', children: [] }] },
  ] },
  { id: 'edas', slug: 'edas', children: [
    { id: 'common-e', node_type: 'subject', children: [] },
    { id: 'psych', title: 'Psicologia', node_type: 'specialty', children: [{ id: 'psych-subject', node_type: 'subject', children: [] }] },
  ] },
];

assert.deepEqual(getSpecialtyOptions(nodes, 'tecnico').map((item) => item.value), ['agent']);
assert.deepEqual(getSpecialtyOptions(nodes, 'superior').map((item) => item.value), ['psych']);
assert.deepEqual(getSpecialtyOptions(nodes, 'indeciso').map((item) => item.value), ['agent', 'psych']);
const filtered = filterSyllabusForProfile(nodes, 'superior', 'psych');
assert.equal(filtered.length, 1);
assert.deepEqual(filtered[0].children.map((item) => item.id), ['common-e', 'psych']);
assert.deepEqual(collectSubjectIds(filtered), ['common-e', 'psych-subject']);
console.log('Specialty selection: 5 verificações aprovadas.');
