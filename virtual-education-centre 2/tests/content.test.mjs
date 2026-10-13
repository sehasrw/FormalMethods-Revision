import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateFormalMethodsContent, contentTotals, paperCollections, scopeTitle } from '../src/lib/content.js';

const baseline=JSON.parse(readFileSync(new URL('../src/data/formal-methods.json',import.meta.url)));

test('the five unchanged source papers pass the shared import validator',()=>{
 assert.deepEqual(validateFormalMethodsContent(baseline),[]);
 assert.deepEqual(contentTotals(baseline),{papers:5,questions:75,marks:500,lectures:2,topics:15});
 assert.deepEqual(paperCollections(baseline.papers).map(c=>c.title),['Lectures 1 & 2']);
 assert.equal(scopeTitle([1,2,3]),'Lectures 1–3');
 assert.equal(scopeTitle([3]),'Lecture 3');
});

test('a future lecture and complete new paper can be published by changing JSON only',()=>{
 const future=structuredClone(baseline);
 future.lectures.push({number:3,title:'Placeholder lecture for structural test',source:'fixture'});
 future.topics.push({id:'L3.T',lecture:3,title:'Fixture topic',pages:'1'});
 const paper={id:'FM-L3-P06',number:6,title:'Fixture Paper - not published',scope:[3],suggestedMinutes:120,totalMarks:100,questionCount:1,questionIds:['FM-L3-P06-Q01'],sections:[{id:'A',title:'Test section',marks:100,questionIds:['FM-L3-P06-Q01']}],edition:'1.0'};
 future.papers.push(paper);
 future.questions.push({id:'FM-L3-P06-Q01',paperId:paper.id,number:1,section:'A',type:'single_choice',difficulty:'foundational',marks:100,tags:['L3.T'],promptMarkdown:'Test-only content, not a real examination.',parts:[],options:[{id:'A',text:'A'},{id:'B',text:'B'},{id:'C',text:'C'},{id:'D',text:'D'}]});
 future.answers.push({questionId:'FM-L3-P06-Q01',correctOptionId:'A',modelAnswerMarkdown:'This is a test fixture answer, not university material.',maxMarks:100,gradingMode:'auto_single_choice'});
 assert.deepEqual(validateFormalMethodsContent(future),[]);
 assert.equal(contentTotals(future).papers,6);
 assert.equal(contentTotals(future).questions,76);
 assert.deepEqual(paperCollections(future.papers).map(c=>c.title),['Lectures 1 & 2','Lecture 3']);
 assert.deepEqual(future.papers.slice(0,5),baseline.papers); // old attempts remain compatible
});

test('incorrect key, unknown topic, mismatched marks, or duplicate paper URL is refused',()=>{
 const broken=structuredClone(baseline);
 broken.answers[0].correctOptionId='Z';
 broken.questions[1].tags=['UNKNOWN'];
 broken.papers[1].number=1;
 broken.papers[2].totalMarks=99;
 const errors=validateFormalMethodsContent(broken).join('\n');
 assert.match(errors,/exactly one correct option/);
 assert.match(errors,/unknown topic tag/);
 assert.match(errors,/duplicate identifiers/);
 assert.match(errors,/marks .* differ from totalMarks/);
});
