import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Tiny browser scaffold to test rendered campus HTML and hash routing without installing a DOM package.
const app = { innerHTML: '' };
const handlers = {};
const storage = new Map();
globalThis.localStorage = {getItem:key=>storage.get(key)??null, setItem:(key,value)=>storage.set(key,value)};
globalThis.document = {
 querySelector: selector => selector === '#app' ? app : null,
 documentElement: {dataset:{}},
 addEventListener:(name,cb)=>{handlers[`document:${name}`]=cb},
};
globalThis.location = {hash:'#/'};
globalThis.window = {location:globalThis.location,scrollTo:()=>{},addEventListener:(name,cb)=>{handlers[name]=cb}};
globalThis.fetch = async url => {
 const file=String(url).replace(/^\.\/src\/data\//,'');
 return {ok:true,json:async()=>JSON.parse(readFileSync(new URL(`../src/data/${file}`,import.meta.url),'utf8'))};
};
await import('../src/main.js');
// Let the async data fetch and render finish.
await new Promise(resolve=>setTimeout(resolve,20));

test('the home page shows four modules, only Formal Methods linked',()=>{
 assert.match(app.innerHTML,/YOUR VIRTUAL EDUCATION CENTRE/);
 assert.match(app.innerHTML,/Formal Methods/);
 assert.match(app.innerHTML,/Concurrent Programming/);
 assert.match(app.innerHTML,/Cyber Security/);
 assert.match(app.innerHTML,/Internet of Things \(IoT\)/);
 assert.equal((app.innerHTML.match(/class="course-card /g)||[]).length,4);
 assert.equal((app.innerHTML.match(/class="course-card open" href=/g)||[]).length,1);
 assert.doesNotMatch(app.innerHTML,/centre-orbit|centre-floating-card|centre-metrics|centre-hero-visual/);
 assert.doesNotMatch(app.innerHTML,/class="sidebar/); // campus is full width
 assert.match(app.innerHTML,/href="#\/formal-methods"/);
});
test('Formal Methods dashboard remains reachable via its module route',()=>{
 location.hash='#/formal-methods';handlers.hashchange();
 assert.match(app.innerHTML,/Think precisely\./);
 assert.match(app.innerHTML,/Revision papers/);
 assert.match(app.innerHTML,/All modules/);
});
test('existing paper paths remain available',()=>{
 location.hash='#/papers';handlers.hashchange();
 assert.match(app.innerHTML,/5 papers covering Lectures 1 &amp; 2/);
 assert.equal((app.innerHTML.match(/class="paper-card minimal-paper"/g)||[]).length,5);
});
test('module library route loads the four choices',()=>{
 location.hash='#/modules';handlers.hashchange();
 assert.match(app.innerHTML,/All your modules/);
 assert.equal((app.innerHTML.match(/class="course-card /g)||[]).length,4);
});
