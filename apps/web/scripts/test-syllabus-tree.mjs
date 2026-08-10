import assert from 'node:assert/strict';
import { buildSyllabusTree, getSyllabusNodeTypeLabel } from '../src/api/syllabusTree.js';

const nodes = [
  { id: 'topic', parent_id: 'subject', title: 'Tópico B', sort_order: 20 },
  { id: 'position-b', parent_id: null, title: 'Cargo B', sort_order: 20 },
  { id: 'subject', parent_id: 'position-a', title: 'Disciplina', sort_order: 10 },
  { id: 'position-a', parent_id: null, title: 'Cargo A', sort_order: 10 },
  { id: 'topic-a', parent_id: 'subject', title: 'Tópico A', sort_order: 10 },
];

const tree = buildSyllabusTree(nodes);

assert.deepEqual(tree.map((node) => node.id), ['position-a', 'position-b']);
assert.equal(tree[0].children[0].id, 'subject');
assert.deepEqual(tree[0].children[0].children.map((node) => node.id), ['topic-a', 'topic']);
assert.equal(getSyllabusNodeTypeLabel('position'), 'Cargo');
assert.equal(getSyllabusNodeTypeLabel('unknown'), 'Conteúdo');
assert.deepEqual(buildSyllabusTree([]), []);

console.log('Syllabus tree: 6 verificações aprovadas.');
