import assert from'node:assert/strict';import{buildTutorGuidance}from'../src/api/tutorGuidance.js';
const base={answered:10,accuracy:80,completedSimulations:1,streak:3,review:[{question_id:'a'}]};
assert.match(buildTutorGuidance({...base,answered:0},'next'),/Comece pelo banco/);
assert.match(buildTutorGuidance(base,'review'),/1 questão/);
assert.match(buildTutorGuidance({...base,review:[]},'review'),/fila de erros está vazia/);
assert.match(buildTutorGuidance(base,'performance'),/80%/);
assert.match(buildTutorGuidance(base,'next'),/Prioridade de hoje/);
assert.match(buildTutorGuidance({...base,review:[],completedSimulations:0},'next'),/primeiro simulado/);
console.log('Tutor guidance: 6 verificações aprovadas.');
