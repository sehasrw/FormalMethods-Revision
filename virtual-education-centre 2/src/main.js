import {
  STORAGE_KEY, THEME_KEY, createAttempt, isAnswered, hasAnyResponse, getProgress,
  gradeQuestion, getScores, getTimeRemaining, formatTime, readAttempts, saveAttempts,
} from './lib/exam.js';
import { scopeTitle, paperCollections, contentTotals, validateFormalMethodsContent } from './lib/content.js';

const app = document.querySelector('#app');
const html = (s = '') => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const ICONS = {
  lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  cpu:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9zM9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>',
  wifi:'<path d="M2 8a15 15 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r="1"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a16 16 0 0 1 0 20M12 2a16 16 0 0 0 0 20"/>',
  graduation:'<path d="m2 9 10-5 10 5-10 5L2 9Zm4 3v6c3 3 9 3 12 0v-6M22 9v7"/>',
  sparkles:'<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3ZM4 18l.7 1.3L6 20l-1.3.7L4 22l-.7-1.3L2 20l1.3-.7L4 18ZM19 17l.8 1.2L21 19l-1.2.8L19 21l-.8-1.2L17 19l1.2-.8L19 17Z"/>',
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  book:'<path d="M4 19V5a2 2 0 0 1 2-2h15v16H6a2 2 0 0 0 0 4h15"/><path d="M4 19a2 2 0 0 0 2 2"/>',
  layers:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/>',
  arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  left:'<path d="M19 12H5m7 7-7-7 7-7"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flag:'<path d="M5 21V4m0 0c6-3 8 4 15 0v12c-7 4-9-3-15 0"/>',
  moon:'<path d="M20.7 13A9 9 0 0 1 11 3.3a9 9 0 1 0 9.7 9.7"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v3h16v-3"/>',
  printer:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6z"/>',
  reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v5m0-8h.01"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  file:'<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M13 2v7h7"/><path d="M8 14h8m-8 4h8"/>',
  save:'<path d="M5 3h12l4 4v14H3V3h2zm2 0v7h10V3M7 21v-8h10v8"/>',
  alert:'<path d="M12 3 2 21h20L12 3z"/><path d="M12 9v5m0 3h.01"/>',
  chart:'<path d="M4 20h16M7 17v-6m5 6V4m5 13v-9"/>',
  refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M5 9A8 8 0 0 1 19 7l1 1M4 16l1 1a8 8 0 0 0 14-2"/>',
};
const icon = (name, size=18) => `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] ?? ICONS.file}</svg>`;

// Only a small, escape-first subset of Markdown is needed for the authored papers.
// Never run arbitrary question content through innerHTML without escaping it first.
function renderInline(source) {
  return html(source).split(/(`[^`\n]*`)/g).map((part) => {
    if (part.startsWith('`') && part.endsWith('`')) return `<code>${part.slice(1,-1)}</code>`;
    return part.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>');
  }).join('');
}
function markdown(source = '') {
  const sections = String(source).trim().split(/(^```[^\n]*\n[\s\S]*?^```[ \t]*$)/gm).filter(Boolean);
  return sections.map((item) => {
    if (item.startsWith('```')) {
      return `<pre class="code-snippet"><code>${html(item.replace(/^```[^\n]*\n/,'').replace(/\n```\s*$/,''))}</code></pre>`;
    }
    return item.trim().split(/\n\s*\n/).filter(Boolean).map((paragraph) => `<p>${renderInline(paragraph.replace(/\n/g,' '))}</p>`).join('');
  }).join('');
}
function promptMarkdown(s){return markdown(s.replace(/\*\*\(\d+(?:\+\d+)*\)\*\*/g,''));}
function go(hashValue){window.location.hash = hashValue;}
function progressBar(n,total){const percent=total ? Math.round(n/total*100):0; return `<div class="progress-track" role="progressbar" aria-valuenow="${n}" aria-valuemin="0" aria-valuemax="${total}" aria-label="Completed questions"><div class="progress-fill" style="width:${percent}%"></div></div>`;}
const two = (n) => String(n).padStart(2,'0');
let db={papers:[],questions:[],answers:[],topics:[],modules:[],lectures:[]}, paperMap={}, questionMap={}, answerMap={};
let attempts=readAttempts(localStorage);
let mobileNavOpen=false;
let toastTimer=null;
let tickInterval=null;
try {document.documentElement.dataset.theme=localStorage.getItem(THEME_KEY) === 'dark'?'dark':'light';}catch{document.documentElement.dataset.theme='light';}

function save() {if(!saveAttempts(localStorage,attempts)) showToast('Local browser storage is unavailable. Your responses may not persist.',true);}
function attemptFor(paper){const a=attempts[paper.id];return a?.edition===paper.edition ? a:null;}
function currentPaperQuestions(p){return p.questionIds.map((id)=>questionMap[id]);}
function paperStatus(p){const a=attemptFor(p);return !a?'not-started':a.submittedAt?'completed':'in-progress';}
function showToast(message, warning=false){let el=document.querySelector('#toast'); if(!el)return;el.textContent=message;el.className=`toast show ${warning?'warning':''}`;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.className='toast';},3500);}
function sidebar(route){
 const campus=route==='/' || route==='/modules';
 if(campus)return '';
 const active=(path)=>route===path || (path==='/papers' && route.startsWith('/paper/'));
 const links=[
  ['/formal-methods','Overview'],
  ['/papers','Revision papers'],
  ['/syllabus','Syllabus map'],
  ['/guide','How it works']
 ];
 return `<aside class="sidebar ${mobileNavOpen?'open':''}" id="sidebar">
    <a class="brand minimalist-brand" href="#/" aria-label="StudyHub home">Study<span>Hub</span><small>Learning centre</small></a>
    <nav class="main-nav" aria-label="Formal Methods navigation">
      <a href="#/" class="nav-item nav-back">${icon('left',15)} All modules</a>
      <p class="sidebar-group-title">FORMAL METHODS</p>
      ${links.map(([path,title])=>`<a href="#${path}" class="nav-item ${active(path)?'active':''}" ${active(path)?'aria-current="page"':''}>${title}</a>`).join('')}
    </nav>
    <p class="minimal-sidebar-foot">Progress is saved on this device.</p>
  </aside>`;
}
function chrome(route, body){
 const dark=document.documentElement.dataset.theme==='dark';
 const isPrint=route.includes('/print');
 const campus=route==='/' || route==='/modules';
 const header=campus
  ? `<a href="#/" class="campus-brand" aria-label="StudyHub home">Study<span>Hub</span></a>
     <div class="header-actions"><a href="#/modules" class="campus-nav ${route==='/modules'?'is-active':''}" ${route==='/modules'?'aria-current="page"':''}>Modules</a><button class="icon-button" data-action="theme" title="Toggle light/dark mode" aria-label="Toggle light or dark theme">${icon(dark?'sun':'moon',18)}</button></div>`
  : `<div class="topbar-left"><button class="icon-button mobile-menu" data-action="mobile-menu" aria-label="Open navigation">${icon('menu')}</button><div class="breadcrumb"><span>FORMAL METHODS</span><span class="slash">/</span><strong>${html(routeLabel(route))}</strong></div></div>
     <div class="header-actions"><button class="icon-button" data-action="theme" title="Toggle light/dark mode" aria-label="Toggle light or dark theme">${icon(dark?'sun':'moon',18)}</button></div>`;
 app.innerHTML=`<div class="layout ${campus?'campus-layout':''} ${isPrint?'printing':''}">
   ${sidebar(route)}
   <div class="workspace"><header class="topbar">${header}</header>
   <main class="main" id="main-content">${body}</main>
   </div><div class="mobile-scrim ${mobileNavOpen?'show':''}" data-action="close-menu"></div>
 </div><div id="toast" class="toast" role="status" aria-live="polite"></div>`;
 mobileNavOpen=false;
 window.scrollTo(0,0);
}
function routeLabel(route){if(route==='/' )return 'Learning centre';if(route==='/modules')return 'Modules';if(route==='/formal-methods')return 'Formal Methods';if(route==='/papers')return 'Paper library';if(route==='/syllabus')return 'Syllabus map';if(route==='/guide')return 'Guide';if(route.includes('/review/'))return 'Answer review';if(route.includes('/results'))return 'Results';if(route.includes('/print'))return 'Print paper';if(route.includes('/q/'))return 'Examination';return 'Paper details';}
function getStats(){let done=0,active=0,best=[];for(const p of db.papers){const a=attemptFor(p);if(a?.submittedAt){done++;const scores=getScores(currentPaperQuestions(p),answerMap,a);if(scores.fullyGraded)best.push(scores.awarded);}else if(a)active++;}return {done,active,highest:best.length?Math.max(...best):null};}
function paperCard(p){
 const state=paperStatus(p),a=attemptFor(p),questions=currentPaperQuestions(p),progress=getProgress(questions,a);
 const status=state==='completed'?'Completed':state==='in-progress'?'In progress':'Not started';
 const dest=state==='completed'?`#/paper/${p.number}/results`:state==='in-progress'?`#/paper/${p.number}/q/${a.lastQuestion??1}`:`#/paper/${p.number}`;
 const label=state==='completed'?'View results':state==='in-progress'?'Resume paper':'Open paper';
 return `<a class="paper-card minimal-paper" href="${dest}">
    <div class="paper-card-top"><span class="paper-number">PAPER ${two(p.number)}</span><span class="status-pill ${state}">${status}</span></div>
    <h3>${html(p.title)}</h3>
    <p class="paper-description">${html(scopeTitle(p.scope))} · ${questions.length} questions · ${p.totalMarks} marks · ${p.suggestedMinutes} minutes</p>
    ${a?`<div class="paper-progress">${progressBar(progress.answered,questions.length)}<span>${progress.answered} of ${questions.length} answered</span></div>`:''}
    <div class="card-link">${label} <span aria-hidden="true">→</span></div>
  </a>`;
}
function moduleCard(module){
 const open=module.status==='available';
 const badge=open?'Available':module.status==='planned'?'Coming soon':'Locked';
 const totals=contentTotals(db);
 const description=open?`${scopeSummary()} revision papers, with guided marking and explanations.`:
   'Study papers will be added in a future update.';
 const card=`<div class="course-card-head"><span class="course-number">MODULE ${html(module.number)}</span><span class="course-state ${open?'course-state-open':'course-state-pending'}">${badge}</span></div>
   <h3>${html(module.title)}</h3><p>${html(description)}</p>
   <div class="course-card-footer">${open?`<span>${totals.papers} papers · ${totals.questions} questions</span><strong>Enter module <span aria-hidden="true">→</span></strong>`:'<span>Not available yet</span>'}</div>`;
 return open?`<a class="course-card open" href="#/formal-methods" aria-label="Open ${html(module.title)} module">${card}</a>`:
   `<article class="course-card unavailable" aria-label="${html(module.title)} — ${badge}">${card}</article>`;
}
function moduleCatalogue(){
 const count=db.modules.filter(m=>m.status==='available').length;
 return `<section class="catalogue-section" id="module-catalogue">
   <div class="catalogue-head"><div><h2>Modules</h2><p>${count} module${count===1?'':'s'} available now. More are on the way.</p></div><span class="module-count">${two(count)} available / ${two(db.modules.length)} total</span></div>
   <div class="course-grid" id="course-grid">${db.modules.map(moduleCard).join('')}</div>
 </section>`;
}
function scopeSummary(){
 const scopes=paperCollections(db.papers);
 return scopes.length===1?scopes[0].title:scopes.map(x=>x.title).join(', ');
}
function collectionSections(papers){
 return paperCollections(papers).map(group=>`<section class="collection-section" aria-label="${html(group.title)}">
  <div class="section-heading minimal-section-heading"><div><h2>${html(group.title)}</h2><p>${group.papers.length} paper${group.papers.length===1?'':'s'} · ${group.papers.reduce((n,p)=>n+p.questionIds.length,0)} questions</p></div></div>
  <div class="paper-grid">${group.papers.map(paperCard).join('')}</div>
 </section>`).join('');
}
function centerHome(catalogueOnly=false){
 const stats=getStats();
 const headline=catalogueOnly?'All your modules.':'A calmer way to study.';
 return `<div class="page-container centre-page">
   <section class="centre-intro">
     <div class="centre-intro-label">YOUR VIRTUAL EDUCATION CENTRE</div>
     <h1>${headline}</h1>
     <p>Choose a subject, practise with purpose, and keep your revision in one place.</p>
   </section>
   ${moduleCatalogue()}
   <footer class="centre-footer">${stats.active||stats.done?`${stats.active} paper${stats.active===1?'':'s'} in progress · ${stats.done} completed. `:''}Your answers and progress stay in this browser. No account required.</footer>
  </div>`;
}
function dashboard(){
 const stats=getStats(), totals=contentTotals(db);
 return `<div class="page-container formal-home">
   <div class="formal-intro"><span class="centre-intro-label">FORMAL METHODS · ${html(scopeSummary().toUpperCase())}</span>
   <h1>Think precisely.</h1>
   <p>Choose a revision collection and paper. Your existing answers stay saved in this browser.</p>
   <div class="formal-summary"><span>${totals.papers} papers</span><span>${totals.questions} questions</span><span>${totals.marks} marks</span><span>${stats.done} submitted</span></div></div>
   <div class="section-heading minimal-section-heading"><div><h2>Revision collections</h2><p>Practice at your own pace or choose a timed paper.</p></div><a class="text-link" href="#/syllabus">View syllabus <span aria-hidden="true">→</span></a></div>
   ${collectionSections(db.papers)}
   <p class="simple-footnote">MCQs are marked automatically after submission. Written answers use guided self-marking.</p>
 </div>`;
}
function paperLibrary(){
 const totals=contentTotals(db);
 return `<div class="page-container">
 <div class="page-intro"><div><span class="section-kicker">FORMAL METHODS</span><h1>Revision papers</h1><p>${totals.papers} papers covering ${html(scopeSummary())}.</p></div></div>
 <div class="filter-row"><div class="filters" role="group" aria-label="Filter papers"><button data-filter="all" class="chip active">All</button><button data-filter="not-started" class="chip">Not started</button><button data-filter="in-progress" class="chip">In progress</button><button data-filter="completed" class="chip">Completed</button></div></div>
 <div id="library-grid">${collectionSections(db.papers)}</div>
 <p class="simple-footnote">Answers appear after submission. Written responses require self-marking.</p></div>`;
}
function syllabusPage(){
 const groups=[...db.lectures].sort((a,b)=>a.number-b.number).map(l=>({...l,topics:db.topics.filter(t=>t.lecture===l.number)}));
 return `<div class="page-container"><div class="page-intro"><div><span class="section-kicker">LECTURE COVERAGE</span><h1>The syllabus <em>map.</em></h1><p>Topics are derived from the lecture materials supplied for each paper.</p></div><div class="total-bubble">${db.topics.length}<span>topic clusters</span></div></div><div class="topic-groups">${groups.map(g=>`<section class="topic-group"><div class="topic-group-title"><span class="lecture-badge">LECTURE ${two(g.number)}</span><h2>${html(g.title)}</h2></div><div class="topic-list">${g.topics.map(t=>{const matches=db.questions.filter(q=>q.tags.includes(t.id)).length;return `<div class="topic-row"><span class="topic-code">${html(t.id)}</span><div class="topic-details"><strong>${html(t.title)}</strong><p>${html(t.description??'')}</p><small>Lecture ${g.number}${t.pages?' • slide'+(String(t.pages).includes('–')?'s':'')+' '+html(t.pages):''}</small></div><span class="topic-count">${matches} tagged questions</span></div>`;}).join('')}</div></section>`).join('')}</div><div class="scope-notice"><div><strong>Lecture-aligned revision</strong><p>Each paper states its lecture scope. Questions are checked against tagged topics before publication; later-lecture material is not included in earlier-lecture papers.</p></div></div></div>`;
}
function guidePage(){return `<div class="page-container"><div class="page-intro"><div><span class="section-kicker">A QUICK ORIENTATION</span><h1>How to use <em>Exam Studio.</em></h1><p>Designed as a thoughtful, independent revision space—not a replacement for lecturer marking.</p></div></div><div class="guide-grid"><article class="guide-card"><span class="step-number">01</span><h3>Choose your paper</h3><p>${db.papers.length} revision papers covering ${html(scopeSummary())}. Study in untimed practice mode or switch on a paper-specific advisory timer.</p></article><article class="guide-card"><span class="step-number">02</span><h3>Work through questions</h3><p>Select one MCQ answer or type written solutions and calculations. Use the navigator to jump, flag, or revisit questions. Your browser saves responses automatically.</p></article><article class="guide-card"><span class="step-number">03</span><h3>Submit to unlock answers</h3><p>Once submitted, MCQs are marked automatically. Compare written answers with the provided explanation and assign marks using the examiner rubric.</p></article><article class="guide-card"><span class="step-number">04</span><h3>Review your results</h3><p>Use the per-question review and final score to identify revision priorities. Download a JSON copy of your attempt, or retake a paper from scratch.</p></article></div><div class="guide-panel"><div class="guide-panel-icon">${icon('info',22)}</div><div><h3>Important assessment notes</h3><p>Written answers are <b>not automatically verified</b>. Self-awarded marks are for your personal study, not lecturer-certified results. The timer does not force submission. Attempts are stored only in this browser's local storage—clearing site data, changing devices or using private mode can remove them.</p><p>Because this is a public static revision site, answer keys are included in files available to the browser. They are hidden by the interface until submission, but this is <b>not secure proctored examination software</b>.</p><p>Accepted mathematical alternatives may differ from model solutions when logically equivalent and type-correct.</p></div></div><a class="btn btn-primary" href="#/papers">Choose a paper ${icon('arrow',17)}</a></div>`;}
function paperIntro(p){
 const a=attemptFor(p),status=paperStatus(p);
 if(status==='completed')return resultPage(p);
 if(status==='in-progress')go(`#/paper/${p.number}/q/${a.lastQuestion??1}`);
 return `<div class="page-container narrow-page"><a class="back-link" href="#/papers">${icon('left',16)} Back to papers</a><div class="paper-intro-card"><div class="paper-intro-head"><span class="paper-number">REVISION PAPER ${two(p.number)}</span><span class="scope-label">${html(scopeTitle(p.scope).toUpperCase())}</span></div><h1>${html(p.title)}</h1><p>One independent virtual examination, with four sections and a separate explanatory marking guide released after submission.</p><div class="intro-stats"><div><b>${p.questionIds.length}</b><span>Questions</span></div><div><b>${p.totalMarks}</b><span>Total marks</span></div><div><b>${p.suggestedMinutes}</b><span>Suggested minutes</span></div></div><h3>Paper breakdown</h3><div class="section-breakdown">${p.sections.map(s=>`<div><span>${s.id}</span><strong>${html(s.title)}</strong><small>${s.marks} marks</small></div>`).join('')}</div><div class="mode-picker"><h3>Select your revision mode</h3><label class="mode-option selected"><input type="radio" name="mode" value="practice" checked /><span class="mode-icon">${icon('book',20)}</span><span><b>Practice mode</b><small>Work without a countdown. Save and resume when you like.</small></span></label><label class="mode-option"><input type="radio" name="mode" value="timed" /><span class="mode-icon">${icon('clock',20)}</span><span><b>Timed practice</b><small>${p.suggestedMinutes}-minute advisory countdown; no automatic submission.</small></span></label></div><div class="intro-actions"><button class="btn btn-primary" data-action="start" data-paper="${p.number}">Start this paper ${icon('arrow',17)}</button><a class="btn btn-outline" href="#/paper/${p.number}/print">${icon('printer',17)} Print questions</a></div><p class="disclaimer-small">MCQs will be auto-marked. You will self-assess longer answers against the published rubrics after submitting.</p></div></div>`;
}
function answerField(q, attempt, key, part=null){
 const id=part?`${q.id}:${part.id}`:q.id;
 const val=String(attempt.answers[id]??'');
 return `<div class="response-control"><label for="ans-${html(id)}">Your ${part?`answer to part (${part.id})`:'answer and workings'}</label><textarea id="ans-${html(id)}" data-answer="${html(id)}" data-question="${q.id}" rows="${part?4:7}" placeholder="Write your explanation or working here…" spellcheck="true">${html(val)}</textarea><span class="response-help">${icon('save',13)} Saved locally as you type</span></div>`;
}
function renderQuestionBody(q,attempt,review=false){
 const savedChoice=attempt?.answers[q.id]??'';
 const prefix=q.promptMarkdown?`<div class="question-prompt markdown">${promptMarkdown(q.promptMarkdown)}</div>`:'';
 if(q.type==='single_choice'){
  return `${prefix}<fieldset class="options" ${review?'disabled':''}><legend class="sr-only">Select one answer</legend>${q.options.map(option=>`<label class="option ${savedChoice===option.id?'selected':''}"><input type="radio" name="choice-${q.id}" data-answer="${q.id}" data-question="${q.id}" value="${option.id}" ${savedChoice===option.id?'checked':''}/><span class="option-letter">${option.id}</span><span class="option-text markdown">${markdown(option.text)}</span><span class="option-indicator">${icon('check',15)}</span></label>`).join('')}</fieldset>`;
 }
 return `${prefix}${q.parts.length?q.parts.map(part=>`<section class="question-part"><div class="part-header"><h3>Part (${part.id})</h3><span>${part.marks} mark${part.marks===1?'':'s'}</span></div><div class="markdown">${promptMarkdown(part.promptMarkdown)}</div>${review?savedResponse(attempt.answers[`${q.id}:${part.id}`]):answerField(q,attempt,null,part)}</section>`).join(''):(review?savedResponse(attempt.answers[q.id]):answerField(q,attempt))}`;
}
function savedResponse(value){return `<div class="saved-response"><span>YOUR RESPONSE</span><div>${html(String(value??'').trim()||'No answer entered.')}</div></div>`;}
function questionNavigator(p,questions,attempt,active,review){
 const done=getProgress(questions,attempt);
 return `<aside class="question-navigator"><div class="navigator-card"><div class="navigator-head"><h3>Question navigator</h3><span>${done.answered}/${done.total}</span></div>${progressBar(done.answered,done.total)}<div class="question-map">${questions.map((q,i)=>{let cls=[i+1===active?'current':'',isAnswered(q,attempt)?'answered':'',attempt.flags[q.id]?'flagged':''].filter(Boolean).join(' ');return `<a href="#/paper/${p.number}/${review?'review':'q'}/${i+1}" class="map-button ${cls}" aria-label="Question ${i+1}, ${isAnswered(q,attempt)?'answered':'not fully answered'}">${i+1}${attempt.flags[q.id]?'<i>•</i>':''}</a>`;}).join('')}</div><div class="navigator-key"><span><i class="key-dot answered"></i> Answered</span><span><i class="key-dot active"></i> Current</span><span><i class="key-dot flagged"></i> Flagged</span></div></div><div class="navigator-help">${icon('info',16)} Your answers are saved on this device. You can leave and resume before submitting.</div></aside>`;
}
function examPage(p,number=1){
 const attempt=attemptFor(p);if(!attempt)return paperIntro(p);if(attempt.submittedAt)return reviewPage(p,number);
 const questions=currentPaperQuestions(p);const n=Math.min(questions.length,Math.max(1,number));const q=questions[n-1];attempt.lastQuestion=n;save();
 const progress=getProgress(questions,attempt);const previous=n>1?`<a class="btn btn-outline" href="#/paper/${p.number}/q/${n-1}">${icon('left',17)} Previous</a>`:'<span></span>';
 const next=n<questions.length?`<a class="btn btn-primary" href="#/paper/${p.number}/q/${n+1}">Next question ${icon('arrow',17)}</a>`:`<button class="btn btn-primary" data-action="submit" data-paper="${p.number}">Finish &amp; submit ${icon('check',17)}</button>`;
 return `<div class="exam-container"><div class="exam-bar"><div><a class="back-link" href="#/papers">${icon('left',16)} All papers</a><h1>Paper ${two(p.number)} <span> / ${html(p.title)}</span></h1></div><div class="exam-tools">${attempt.mode==='timed'?`<span class="timer" id="paper-timer" data-timer-paper="${p.number}">${icon('clock',17)} <span>${formatTime(p.suggestedMinutes*60000)}</span></span>`:`<span class="practice-label">${icon('book',16)} Untimed practice</span>`}<button class="btn btn-outline btn-small" data-action="submit" data-paper="${p.number}">Submit paper</button></div></div><div class="exam-progress-label"><span><b>${progress.answered} of ${questions.length}</b> fully answered</span><span>Section ${q.section} · Question ${n}</span></div>${progressBar(progress.answered,questions.length)}<div class="exam-grid"><div class="question-column"><article class="question-panel"><div class="question-topline"><span class="section-kicker">SECTION ${q.section} <span>·</span> ${html(p.sections.find(s=>s.id===q.section).title.toUpperCase())}</span><button class="flag-button ${attempt.flags[q.id]?'is-flagged':''}" data-action="flag" data-id="${q.id}">${icon('flag',16)} ${attempt.flags[q.id]?'Flagged':'Flag for review'}</button></div><div class="question-heading"><h2>Question ${two(n)}</h2><span class="marks-tag">${q.marks} MARKS</span></div><div class="question-subline"><span class="difficulty ${q.difficulty}">${q.difficulty}</span>${q.tags.map(t=>`<span class="topic-tag">${t}</span>`).join('')}</div><div class="question-body">${renderQuestionBody(q,attempt)}</div></article><div class="question-bottom">${previous}<span class="question-position">${n} of ${questions.length}</span>${next}</div></div>${questionNavigator(p,questions,attempt,n,false)}</div></div>`;
}
function resultPage(p){
 const attempt=attemptFor(p);if(!attempt)return paperIntro(p);if(!attempt.submittedAt)return examPage(p,attempt.lastQuestion??1);
 const questions=currentPaperQuestions(p), s=getScores(questions,answerMap,attempt);const progress=getProgress(questions,attempt);
 const mcqs=questions.filter(q=>q.type==='single_choice');const correct=mcqs.filter(q=>gradeQuestion(q,answerMap[q.id],attempt)===q.marks).length;
 return `<div class="page-container results-container"><a class="back-link" href="#/papers">${icon('left',16)} Back to papers</a><section class="results-hero"><div class="results-copy"><span class="results-kicker">PAPER ${two(p.number)} · SUBMITTED</span><h1>Paper complete.<br/><em>Now learn from it.</em></h1><p>${html(p.title)}</p><div class="results-actions"><button class="btn btn-white" data-action="export" data-paper="${p.number}">${icon('download',17)} Export attempt</button><a class="btn btn-transparent" href="#/paper/${p.number}/review/1">Review each question ${icon('arrow',17)}</a></div></div><div class="results-score"><span>YOUR SCORE</span><b>${s.awarded}<small>/ ${p.totalMarks}</small></b><div class="results-line"></div><span>${s.fullyGraded?'FULLY SELF-MARKED':'PARTIALLY MARKED'}</span></div></section><div class="results-stats"><div><b>${s.gradedOutOf}</b><span>Marks evaluated of ${p.totalMarks}</span></div><div><b>${correct}/${mcqs.length}</b><span>MCQs correct</span></div><div><b>${s.writtenRemaining}</b><span>Written questions to self-mark</span></div><div><b>${progress.answered}/${questions.length}</b><span>Questions fully answered</span></div></div>${!s.fullyGraded?`<div class="assessment-notice">${icon('alert',19)} <div><strong>This isn't a final score yet.</strong><p>Your ${s.awarded} mark${s.awarded===1?'':'s'} reflect only evaluated questions (${s.gradedOutOf}/${p.totalMarks} possible marks). ${s.remaining} mark${s.remaining===1?' is':'s are'} still awaiting your own rubric-based evaluation. Open each written answer and enter a fair score.</p></div></div>`:`<div class="assessment-notice success-notice">${icon('check',20)} <div><strong>Self-assessment complete: ${s.awarded}/${p.totalMarks}</strong><p>All questions have marks. Written question grades were entered by you, not verified by an examiner.</p></div></div>`}<div class="section-heading results-heading"><div><span class="section-kicker">ANSWER REVIEW</span><h2>Question breakdown</h2><p>Select any question to compare your response with its marking guide.</p></div><button class="text-button danger" data-action="reset" data-paper="${p.number}">${icon('reset',16)} Retake paper</button></div><div class="result-question-list">${questions.map((q,i)=>{const grade=gradeQuestion(q,answerMap[q.id],attempt);return `<a href="#/paper/${p.number}/review/${i+1}" class="result-question"><span class="result-q-num">${two(i+1)}</span><div><strong>Question ${i+1}</strong><small>Section ${q.section} • ${q.tags.join(', ')}</small></div><span class="result-grade ${grade==null?'pending':grade===q.marks?'full':'partial'}">${grade==null?'Self-mark needed':`${grade} / ${q.marks} marks`}</span>${icon('arrow',17)}</a>`;}).join('')}</div><p class="disclaimer-small">Attempt data is stored in your browser only. Export to keep a copy before clearing site data.</p></div>`;
}
function reviewPage(p,number=1){
 const attempt=attemptFor(p);if(!attempt?.submittedAt)return examPage(p,number);
 const questions=currentPaperQuestions(p);const n=Math.max(1,Math.min(questions.length,number)),q=questions[n-1],key=answerMap[q.id],grade=gradeQuestion(q,key,attempt);
 return `<div class="exam-container review-layout"><div class="exam-bar"><div><a class="back-link" href="#/paper/${p.number}/results">${icon('left',16)} Results overview</a><h1>Review Question ${two(n)} <span> / Paper ${two(p.number)}</span></h1></div><span class="review-mode-label">${icon('book',16)} ANSWER REVIEW</span></div><div class="exam-grid"><div class="question-column"><article class="question-panel"><div class="question-topline"><span class="section-kicker">SECTION ${q.section} · ${q.tags.join(' / ')}</span><span class="marks-tag">${q.marks} MARKS</span></div><div class="question-heading"><h2>Question ${two(n)}</h2></div><div class="question-body">${renderQuestionBody(q,attempt,true)}</div></article><article class="answer-panel"><div class="answer-panel-header"><div class="answer-symbol">${icon('check',21)}</div><div><span class="section-kicker">EXAMINER'S MARKING KEY</span><h3>Model answer &amp; explanation</h3></div></div><div class="markdown answer-content">${markdown(key.modelAnswerMarkdown)}</div>${q.type==='single_choice'?`<div class="auto-grade ${grade===q.marks?'correct':'incorrect'}">${icon(grade===q.marks?'check':'alert',18)} ${grade===q.marks?'Correct':'Incorrect or unanswered'} · Your choice: ${html(attempt.answers[q.id]??'none')} · Correct choice: ${key.correctOptionId} · ${grade}/${q.marks} marks</div>`:`<div class="self-mark-box"><div><strong>Your self-assessed mark</strong><p>Compare every requirement with the examiner's marking guidance, then award a whole number from 0 to ${q.marks}.</p></div><label class="mark-entry">Mark <input type="number" inputmode="numeric" min="0" max="${q.marks}" step="1" data-mark="${q.id}" value="${grade??''}" placeholder="—" aria-label="Score for question ${n} out of ${q.marks}"/> <span>/ ${q.marks}</span></label><button class="btn btn-primary btn-small" data-action="save-mark" data-id="${q.id}" data-paper="${p.number}" data-question="${n}">Save mark ${icon('check',15)}</button></div>`}</article><div class="question-bottom"><a class="btn btn-outline" href="${n>1?`#/paper/${p.number}/review/${n-1}`:`#/paper/${p.number}/results`}">${icon('left',16)} ${n>1?'Previous question':'Results'}</a><span class="question-position">${n} of ${questions.length}</span><a class="btn btn-primary" href="${n<questions.length?`#/paper/${p.number}/review/${n+1}`:`#/paper/${p.number}/results`}">${n<questions.length?'Next answer':'Back to results'} ${icon('arrow',17)}</a></div></div>${questionNavigator(p,questions,attempt,n,true)}</div></div>`;
}
function printPage(p){const qs=currentPaperQuestions(p);return `<div class="page-container print-page"><div class="print-control"><a class="back-link" href="#/paper/${p.number}">${icon('left',16)} Return to paper</a><button class="btn btn-primary" data-action="print">${icon('printer',17)} Print questions only</button></div><div class="print-heading"><h1>Formal Methods — Revision Paper ${two(p.number)}</h1><h2>${html(p.title)}</h2><p>${html(scopeTitle(p.scope))} • ${p.suggestedMinutes} minutes • ${p.totalMarks} marks</p><p><strong>Instructions:</strong> Answer all questions. Show your working. For MCQs select one option.</p></div>${p.sections.map(section=>`<section class="print-section"><h2>Section ${section.id} — ${html(section.title)} (${section.marks} marks)</h2>${section.questionIds.map((id)=>{const q=questionMap[id];return `<div class="print-question"><h3>Q${q.number} <span>(${q.marks} marks)</span></h3><div class="markdown">${markdown(q.promptMarkdown)}</div>${q.options.length?`<ol type="A">${q.options.map(o=>`<li>${markdown(o.text)}</li>`).join('')}</ol>`:''}${q.parts.map(x=>`<div class="print-part"><b>(${x.id})</b> ${markdown(x.promptMarkdown)} <span>(${x.marks} marks)</span></div>`).join('')}<div class="print-writing-space"></div></div>`;}).join('')}</section>`).join('')}</div>`;}
function render(){clearInterval(tickInterval);const route=decodeURIComponent(location.hash.replace(/^#/,'')||'/');let content;
 if(route==='/')content=centerHome();
 else if(route==='/modules')content=centerHome(true);
 else if(route==='/formal-methods')content=dashboard();
 else if(route==='/papers')content=paperLibrary();
 else if(route==='/syllabus')content=syllabusPage();
 else if(route==='/guide')content=guidePage();
 else {const match=route.match(/^\/paper\/(\d+)(?:\/(q|review)\/(\d+)|\/(results|print))?$/);if(!match){content=`<div class="page-container empty-page"><h1>Page not found</h1><a class="btn btn-primary" href="#/">Return home</a></div>`;}else{const p=db.papers.find(x=>x.number===Number(match[1]));if(!p){content='<div class="page-container"><h1>Paper not found</h1></div>';}else if(match[4]==='results')content=resultPage(p);else if(match[4]==='print')content=printPage(p);else if(match[2]==='review')content=reviewPage(p,Number(match[3]));else if(match[2]==='q')content=examPage(p,Number(match[3]));else content=paperIntro(p);}}
 chrome(route,content);
 if(route.startsWith('/paper/')&&route.includes('/q/')){ const matched=route.match(/\/paper\/(\d+)\/q\//),p=db.papers.find(x=>x.number===Number(matched?.[1]));if(p){tickInterval=setInterval(()=>{const a=attemptFor(p),el=document.querySelector('#paper-timer');if(el&&a?.mode==='timed'){const left=getTimeRemaining(a,p);el.querySelector('span').textContent=`${left<0?'+':''}${formatTime(left)}`;el.classList.toggle('over-time',left<0);}},1000);}}
}
function refreshProgress(){
 const m=location.hash.match(/^#\/paper\/(\d+)\/q\/(\d+)$/);if(!m)return;
 const p=db.papers.find(p=>p.number===Number(m[1])),a=attemptFor(p),prog=getProgress(currentPaperQuestions(p),a);
 const label=document.querySelector('.exam-progress-label b');if(label)label.textContent=`${prog.answered} of ${p.questionIds.length}`;
 document.querySelectorAll('.progress-fill').forEach(el=>el.style.width=`${Math.round(prog.answered/p.questionIds.length*100)}%`);
 const btns=document.querySelectorAll('.map-button');btns.forEach((btn,i)=>{const q=questionMap[p.questionIds[i]];btn.classList.toggle('answered',isAnswered(q,a));});
}
function setAnswer(field){const qid=field.dataset.question;if(!qid)return;const p=db.papers.find(x=>x.questionIds.includes(qid)),a=attemptFor(p);if(!a||a.submittedAt)return;
 const aid=field.dataset.answer;if(!aid)return;a.answers[aid]=field.type==='radio'?field.value:field.value;
 save(); if(field.type==='radio'){document.querySelectorAll('.option').forEach(o=>o.classList.toggle('selected',o.querySelector('input')?.checked));}
 refreshProgress();
}
function exportAttempt(p,a){const questions=currentPaperQuestions(p);const output={exportedAt:new Date().toISOString(),paper:{id:p.id,edition:p.edition,title:p.title},attempt:a,summary:a.submittedAt?getScores(questions,answerMap,a):null,gradingNotice:'Written questions are self-marked, not examiner verified.'};
 const file=new Blob([JSON.stringify(output,null,2)],{type:'application/json'});const url=URL.createObjectURL(file);const link=document.createElement('a');link.href=url;link.download=`Formal-Methods-Paper-${two(p.number)}-Attempt.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener('change',(e)=>{
 if(e.target.matches('[data-answer]'))setAnswer(e.target);
 if(e.target.matches('input[name="mode"]'))document.querySelectorAll('.mode-option').forEach(el=>el.classList.toggle('selected',el.querySelector('input').checked));
});
document.addEventListener('input',(e)=>{if(e.target.matches('textarea[data-answer]'))setAnswer(e.target);});
document.addEventListener('click',(e)=>{
 const button=e.target.closest('[data-action]');if(!button)return;
 const action=button.dataset.action;
 if(action==='mobile-menu'){mobileNavOpen=true;document.querySelector('.sidebar')?.classList.add('open');document.querySelector('.mobile-scrim')?.classList.add('show');return;}
 if(action==='close-menu'){mobileNavOpen=false;document.querySelector('.sidebar')?.classList.remove('open');document.querySelector('.mobile-scrim')?.classList.remove('show');return;}
 if(action==='theme'){const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem(THEME_KEY,theme);}catch{}render();return;}
 if(action==='start'){
  const p=db.papers.find(p=>p.number===Number(button.dataset.paper));if(attemptFor(p))return go(`#/paper/${p.number}/q/${attemptFor(p).lastQuestion??1}`);
  const mode=document.querySelector('input[name="mode"]:checked')?.value??'practice';attempts[p.id]=createAttempt(p,mode);save();go(`#/paper/${p.number}/q/1`);return;
 }
 if(action==='flag'){const id=button.dataset.id;const p=db.papers.find(p=>p.questionIds.includes(id));const a=attemptFor(p);if(!a||a.submittedAt)return;a.flags[id]=!a.flags[id];save();render();showToast(a.flags[id]?'Question flagged for review':'Flag removed');return;}
 if(action==='submit'){
  const p=db.papers.find(p=>p.number===Number(button.dataset.paper)),a=attemptFor(p);if(!a||a.submittedAt)return;
  const questions=currentPaperQuestions(p),prog=getProgress(questions,a);const missing=prog.total-prog.answered;
  if(!window.confirm(`Submit Paper ${two(p.number)}?\n\n${prog.answered} of ${questions.length} questions are fully answered.${missing?`\n${missing} question(s) are incomplete or blank.`:''}\n\nYou can no longer edit answers after submission. The answer key will become visible.`))return;
  a.submittedAt=Date.now();save();go(`#/paper/${p.number}/results`);return;
 }
 if(action==='save-mark'){
  const id=button.dataset.id,p=db.papers.find(p=>p.number===Number(button.dataset.paper)),a=attemptFor(p),q=questionMap[id],field=document.querySelector(`[data-mark="${id}"]`);
  if(!a?.submittedAt||q.type==='single_choice')return;
  if(!field.value.trim()||!/^(?:0|[1-9]\d*)$/.test(field.value.trim())){showToast('Enter a whole number from 0 to '+q.marks+'.',true);return;}
  const n=Number(field.value);if(n>q.marks){showToast('The score cannot exceed '+q.marks+'.',true);return;}a.grades[id]=n;save();render();showToast('Self-assessed mark saved');return;
 }
 if(action==='reset'){
  const p=db.papers.find(p=>p.number===Number(button.dataset.paper));if(!window.confirm(`Retake Paper ${two(p.number)}? This permanently clears its saved answers and score on this device. Export your attempt first if needed.`))return;
  delete attempts[p.id];save();go(`#/paper/${p.number}`);return;
 }
 if(action==='export'){const p=db.papers.find(p=>p.number===Number(button.dataset.paper));const a=attemptFor(p);if(a)exportAttempt(p,a);return;}
 if(action==='print'){window.print();return;}
});
document.addEventListener('click',(e)=>{
 const moduleFilter=e.target.closest('[data-module-filter]');
 if(moduleFilter){
  const selected=moduleFilter.dataset.moduleFilter;
  document.querySelectorAll('[data-module-filter]').forEach(el=>{const chosen=el===moduleFilter;el.classList.toggle('selected',chosen);el.setAttribute('aria-pressed',String(chosen));});
  const cards=db.modules.filter(m=>selected==='all'||(selected==='available'&&m.status==='available')||(selected==='soon'&&m.status!=='available'));
  const grid=document.querySelector('#course-grid');if(grid)grid.innerHTML=cards.map(moduleCard).join('');
  return;
 }
 const filter=e.target.closest('[data-filter]');if(!filter)return;
 document.querySelectorAll('[data-filter]').forEach(el=>el.classList.toggle('active',el===filter));
 const state=filter.dataset.filter, grid=document.querySelector('#library-grid');const filtered=state==='all'?db.papers:db.papers.filter(p=>paperStatus(p)===state);grid.innerHTML=collectionSections(filtered) || '<div class="no-results">No papers have this status yet.</div>';
});
window.addEventListener('hashchange',render);
async function load(){
 try{
  const [content, modules] = await Promise.all([
   fetch('./src/data/formal-methods.json').then(async result => {if(!result.ok) throw new Error(`Cannot load formal-methods.json (${result.status})`);return result.json();}),
   fetch('./src/data/modules.json').then(async result => {if(!result.ok) throw new Error(`Cannot load modules.json (${result.status})`);return result.json();}),
  ]);
  const problems=validateFormalMethodsContent(content);
  if(problems.length) throw new Error(`Invalid formal-methods.json: ${problems.slice(0,3).join('; ')}${problems.length>3?' …':''}`);
  db={...content,modules};
  paperMap=Object.fromEntries(db.papers.map(p=>[p.id,p]));
  questionMap=Object.fromEntries(db.questions.map(q=>[q.id,q]));
  answerMap=Object.fromEntries(db.answers.map(k=>[k.questionId,k]));
  render();
 }catch(err){app.innerHTML=`<div class="load-error"><h1>Couldn't load the question bank</h1><p>${html(err.message)}</p><p>Run the project through a local HTTP server and validate your JSON before publishing.</p></div>`;console.error(err);}
}
load();
