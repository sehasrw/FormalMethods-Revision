import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const modules=JSON.parse(readFileSync(new URL('../src/data/modules.json',import.meta.url)));

test('the campus lists four modules with stable unique IDs',()=>{
 assert.equal(modules.length,4);
 assert.equal(new Set(modules.map(m=>m.id)).size,4);
 assert.deepEqual(modules.map(m=>m.id),['formal-methods','concurrent-programming','cyber-security','iot']);
});
test('only Formal Methods is available at launch',()=>{
 assert.deepEqual(modules.filter(m=>m.status==='available').map(m=>m.id),['formal-methods']);
 assert.equal(modules.find(m=>m.id==='concurrent-programming').status,'locked');
 assert.equal(modules.find(m=>m.id==='iot').status,'locked');
 assert.equal(modules.find(m=>m.id==='cyber-security').status,'planned');
});
