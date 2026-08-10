import assert from'node:assert/strict';import{buildSuggestedStudyItems}from'../src/api/studyPlanSuggestions.js';
const items=buildSuggestedStudyItems({profile:{daily_minutes:120,primary_difficulty:'legislacao'},progress:{answered:10,review:[{}]},startDate:new Date('2026-08-10T12:00:00Z')});
assert.equal(items.length,5);assert.equal(items[0].title,'Revisar questões com erro');assert.equal(items[0].duration_minutes,60);assert.equal(items[1].title,'Revisar legislação prioritária');assert.equal(items[0].scheduled_date,'2026-08-10');assert.equal(items[4].title,'Realizar simulado e analisar o resultado');
const beginner=buildSuggestedStudyItems({profile:{daily_minutes:30,primary_difficulty:'organizacao'},progress:{answered:0,review:[]},startDate:new Date('2026-08-10T12:00:00Z')});assert.equal(beginner.length,3);assert.equal(beginner[0].title,'Revisar conteúdo prioritário');
console.log('Study plan suggestions: 7 verificações aprovadas.');
