import test from 'node:test';
import assert from 'node:assert/strict';
import {createAttempt,isAnswered,hasAnyResponse,getProgress,gradeQuestion,getScores,getTimeRemaining,formatTime} from '../src/lib/exam.js';
const paper={id:'P1',edition:'1',suggestedMinutes:150};
const mcq={id:'q1',type:'single_choice',options:[{id:'A'},{id:'B'}],parts:[],marks:4};
const written={id:'q2',type:'written',options:[],parts:[{id:'a'},{id:'b'}],marks:7};
const answer={q1:{correctOptionId:'B'},q2:{correctOptionId:null}};
test('create draft attempt and progress counts complete parts only',()=>{
 const a=createAttempt(paper,'timed',1000); assert.equal(a.startedAt,1000);assert.equal(getProgress([mcq,written],a).answered,0);
 a.answers.q1='B';a.answers['q2:a']='work';assert.equal(hasAnyResponse(written,a),true);assert.equal(isAnswered(written,a),false); assert.equal(getProgress([mcq,written],a).answered,1);
 a.answers['q2:b']='more'; assert.equal(getProgress([mcq,written],a).answered,2);
});
test('nothing is marked until the student submits',()=>{
 const a=createAttempt(paper);a.answers.q1='B';assert.equal(gradeQuestion(mcq,answer.q1,a),null);
 a.submittedAt=1000; assert.equal(gradeQuestion(mcq,answer.q1,a),4);
});
test('only MCQs grade automatically; written requires self-mark',()=>{
 const a=createAttempt(paper);a.submittedAt=1000;a.answers.q1='A';
 assert.deepEqual(getScores([mcq,written],answer,a),{awarded:0,gradedOutOf:4,possible:11,remaining:7,fullyGraded:false,writtenRemaining:1});
 a.grades.q2=6;assert.equal(getScores([mcq,written],answer,a).awarded,6);assert.equal(getScores([mcq,written],answer,a).fullyGraded,true);
});
test('time limit is advisory, may become negative',()=>{
 const a=createAttempt(paper,'timed',1000);assert.equal(getTimeRemaining(a,paper,1000),9000000);assert.equal(getTimeRemaining(a,paper,1000+9000001),-1);assert.equal(formatTime(9000000),'02:30:00');
});
