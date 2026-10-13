/** Run with `npm run check` or `node scripts/validate-content.mjs`. */
import { readFileSync } from 'node:fs';
import { validateFormalMethodsContent, contentTotals, paperCollections } from '../src/lib/content.js';
const data = JSON.parse(readFileSync(new URL('../src/data/formal-methods.json', import.meta.url), 'utf8'));
const modules = JSON.parse(readFileSync(new URL('../src/data/modules.json', import.meta.url), 'utf8'));
const problems = validateFormalMethodsContent(data);
const check = (c, message) => {if(!c) problems.push(message);};
check(modules.length===4,'Expected four module records');
check(new Set(modules.map(m=>m.id)).size===modules.length,'Duplicate module IDs');
check(modules.find(m=>m.id==='formal-methods')?.status==='available','Formal Methods should be available');
check(modules.find(m=>m.id==='concurrent-programming')?.status==='locked','Concurrent Programming must remain locked');
check(modules.find(m=>m.id==='iot')?.status==='locked','IoT must remain locked');
check(modules.find(m=>m.id==='cyber-security')?.status==='planned','Cyber Security must remain coming soon');
check(modules.filter(m=>m.status==='available').length===1,'Only Formal Methods should be available');
if(problems.length){console.error(`Validation failed (${problems.length} issue${problems.length===1?'':'s'}):`);problems.forEach(p=>console.error(' • '+p));process.exitCode=1;}
else {const totals=contentTotals(data);console.log(`✓ Valid content: ${totals.papers} papers, ${totals.questions} questions/keys, ${totals.marks} total marks, ${totals.lectures} lectures, ${totals.topics} topic tags.`);console.log('✓ Collections: '+paperCollections(data.papers).map(g=>`${g.title}: ${g.papers.length} paper(s)`).join('; '));console.log('✓ Locked module states and existing paper identifiers preserved.');}
