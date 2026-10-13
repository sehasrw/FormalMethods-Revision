import { readFileSync } from 'node:fs';
const load = (file) => JSON.parse(readFileSync(new URL(`../src/data/${file}`, import.meta.url), 'utf8'));
const papers = load('papers.json');
const questions = load('questions.json');
const keys = load('answers.json');
const topics = new Set(load('topics.json').map((t) => t.id));
const byId = Object.fromEntries(questions.map((q) => [q.id, q]));
const keyById = Object.fromEntries(keys.map((k) => [k.questionId, k]));
const assert = (condition, message) => {if(!condition) throw new Error(message);};
assert(papers.length === 5, 'Expected five papers');
assert(questions.length === 75 && keys.length === 75, 'Expected 75 questions and keys');
assert(new Set(questions.map((q) => q.id)).size === 75, 'Duplicate question id');
assert(new Set(keys.map((k) => k.questionId)).size === 75, 'Duplicate key id');
for (const paper of papers) {
  assert(paper.questionIds.length === 15, `${paper.id}: not 15 questions`);
  assert(new Set(paper.questionIds).size === 15, `${paper.id}: repeated question`);
  assert(paper.questionIds.reduce((n, id) => n + (byId[id]?.marks ?? 0), 0) === 100, `${paper.id}: marks != 100`);
  assert(paper.sections.map((s) => s.marks).join(',') === '20,28,32,20', `${paper.id}: section totals wrong`);
  const counts = { foundational: 0, intermediate: 0, challenging: 0 };
  for (const id of paper.questionIds) {
    const q = byId[id], k = keyById[id];
    assert(q && k, `Missing question/key ${id}`);
    assert(q.paperId === paper.id, `Incorrect paper pointer ${id}`);
    assert(q.marks === k.maxMarks && q.marks > 0, `${id}: wrong key marks`);
    assert(q.tags.length > 0 && q.tags.every((t) => topics.has(t)), `${id}: unexpected tag`);
    assert(Object.hasOwn(counts, q.difficulty), `${id}: invalid difficulty`);
    counts[q.difficulty]++;
    assert(q.options.length === 0 || q.options.length === 4, `${id}: options count`);
    assert(q.type === (q.options.length ? 'single_choice' : 'written'), `${id}: incorrect type`);
    if (q.type === 'single_choice') assert(q.options.some((o) => o.id === k.correctOptionId), `${id}: invalid correct option`);
    else {assert(k.correctOptionId === null, `${id}: written question has MCQ answer`); if(q.parts.length) assert(q.parts.reduce((n,p)=>n+p.marks,0)===q.marks, `${id}: parts marks mismatch`);}
    assert(k.modelAnswerMarkdown.length >= 20, `${id}: answer appears missing`);
  }
  assert(counts.foundational === 5 && counts.intermediate === 6 && counts.challenging === 4, `${paper.id}: difficulty split`);
  for (const s of paper.sections) assert(s.questionIds.reduce((n,id)=>n+byId[id].marks,0)===s.marks,`${paper.id}: ${s.id} mismatch`);
}
console.log('✓ Verified 5 papers, 75 question/key pairs, all five 100-mark totals, topic tags, question parts, MCQ keys and difficulty splits.');
