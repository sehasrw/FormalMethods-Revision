/** Content-driven paper collections and import checks (shared by browser and Node). */
export const canonicalScope = (scope) => [...new Set(scope)].sort((a, b) => a - b);

export function scopeTitle(scope) {
  const sorted = canonicalScope(scope);
  if (!sorted.length) return 'Unassigned lectures';
  if (sorted.length === 1) return `Lecture ${sorted[0]}`;
  const consecutive = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
  if (consecutive && sorted.length > 2) return `Lectures ${sorted[0]}–${sorted.at(-1)}`;
  return `Lectures ${sorted.join(' & ')}`;
}

export function paperCollections(papers) {
  const groups = new Map();
  for (const paper of papers) {
    const scope = canonicalScope(paper.scope);
    const key = scope.join(',');
    if (!groups.has(key)) groups.set(key, { id: key, scope, title: scopeTitle(scope), papers: [] });
    groups.get(key).papers.push(paper);
  }
  return [...groups.values()].sort((a, b) => {
    const aMax = Math.max(...a.scope), bMax = Math.max(...b.scope);
    return aMax - bMax || a.scope.length - b.scope.length || a.id.localeCompare(b.id);
  });
}

export function contentTotals(data) {
  return {
    papers: data.papers.length,
    questions: data.questions.length,
    marks: data.papers.reduce((sum, paper) => sum + paper.totalMarks, 0),
    lectures: data.lectures.length,
    topics: data.topics.length,
  };
}

/** Return descriptive errors; never publish partially invalid content. */
export function validateFormalMethodsContent(data) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  if (!data || typeof data !== 'object' || Array.isArray(data)) return ['Content must be a JSON object.'];
  check(data.schemaVersion === '2.0', 'schemaVersion must be "2.0"');
  check(data.moduleId === 'formal-methods', 'moduleId must remain "formal-methods"');
  check(typeof data.title === 'string' && !!data.title.trim(), 'Module title is required');
  for (const prop of ['lectures', 'papers', 'questions', 'answers', 'topics']) check(Array.isArray(data[prop]), `${prop} must be an array`);
  if (errors.length) return errors;

  const unique = (values, label) => {
    check(values.every(value => value !== null && value !== undefined && value !== ''), `${label} contains empty identifiers`);
    check(new Set(values).size === values.length, `${label} contains duplicate identifiers`);
  };
  unique(data.lectures.map(l => l.number), 'Lecture numbers');
  unique(data.papers.map(p => p.id), 'Paper IDs');
  unique(data.papers.map(p => p.number), 'Paper numbers (used in URLs)');
  unique(data.questions.map(q => q.id), 'Question IDs');
  unique(data.answers.map(a => a.questionId), 'Answer question IDs');
  unique(data.topics.map(t => t.id), 'Topic IDs');

  const lectureNumbers = new Set(data.lectures.map(l => l.number));
  const topics = new Map(data.topics.map(t => [t.id, t]));
  const questions = new Map(data.questions.map(q => [q.id, q]));
  const answers = new Map(data.answers.map(a => [a.questionId, a]));
  const papers = new Map(data.papers.map(p => [p.id, p]));
  check(data.papers.length > 0, 'At least one paper is needed');
  for (const l of data.lectures) check(Number.isInteger(l.number) && l.number >= 1 && typeof l.title === 'string' && !!l.title.trim(), `Invalid lecture ${l.number}`);
  for (const t of data.topics) check(lectureNumbers.has(t.lecture) && typeof t.title === 'string' && !!t.title.trim(), `Invalid lecture or title for topic ${t.id}`);

  for (const p of data.papers) {
    const label = `Paper ${p.id}`;
    check(Number.isInteger(p.number) && p.number >= 1, `${label}: number must be a positive integer`);
    check(typeof p.edition === 'string' && !!p.edition, `${label}: edition is required for progress compatibility`);
    check(typeof p.title === 'string' && !!p.title.trim(), `${label}: missing title`);
    check(Number.isInteger(p.suggestedMinutes) && p.suggestedMinutes > 0, `${label}: invalid duration`);
    check(Number.isInteger(p.totalMarks) && p.totalMarks > 0, `${label}: totalMarks must be positive`);
    check(Array.isArray(p.scope) && p.scope.length > 0 && p.scope.every(l => lectureNumbers.has(l)), `${label}: undefined lecture in scope`);
    if (!Array.isArray(p.questionIds) || !Array.isArray(p.sections)) {errors.push(`${label}: questionIds and sections must be arrays`);continue;}
    unique(p.questionIds, `${label} question IDs`);
    check(p.questionIds.length === p.questionCount, `${label}: questionCount does not match questionIds`);
    let paperSum = 0;
    for (const id of p.questionIds) {
      const q = questions.get(id);
      if (!q) {errors.push(`${label}: missing question ${id}`);continue;}
      check(q.paperId === p.id, `${label}: wrong paperId on ${id}`);
      paperSum += q.marks;
    }
    check(paperSum === p.totalMarks, `${label}: question marks ${paperSum} differ from totalMarks ${p.totalMarks}`);
    const sectionQuestionIds = p.sections.flatMap(s => Array.isArray(s.questionIds) ? s.questionIds : []);
    check(sectionQuestionIds.length === p.questionIds.length && p.questionIds.every(id => sectionQuestionIds.includes(id)), `${label}: sections must list the paper's questions exactly once`);
    unique(sectionQuestionIds, `${label} section question IDs`);
    let sectionSum = 0;
    for (const section of p.sections) {
      if (!Array.isArray(section.questionIds)) continue;
      const sum = section.questionIds.reduce((acc, id) => acc + (questions.get(id)?.marks ?? 0), 0);
      check(sum === section.marks, `${label}: section ${section.id} marks mismatch (${sum} vs ${section.marks})`);
      for (const id of section.questionIds) check(questions.get(id)?.section === section.id, `${label}: question ${id} section mismatch`);
      sectionSum += section.marks;
    }
    check(sectionSum === p.totalMarks, `${label}: sections total ${sectionSum} not ${p.totalMarks}`);
    for (let i = 0; i < p.questionIds.length; i++) check(questions.get(p.questionIds[i])?.number === i + 1, `${label}: question numbering/order mismatch at ${i + 1}`);
  }
  for (const q of data.questions) {
    const label = `Question ${q.id}`;
    check(papers.has(q.paperId), `${label}: unknown paper ${q.paperId}`);
    check(papers.get(q.paperId)?.questionIds?.includes(q.id), `${label}: paper does not include this question`);
    check(Number.isInteger(q.marks) && q.marks > 0, `${label}: invalid marks`);
    check(['foundational','intermediate','challenging'].includes(q.difficulty), `${label}: unknown difficulty`);
    check(typeof q.promptMarkdown === 'string' && (!!q.promptMarkdown.trim() || (Array.isArray(q.parts) && q.parts.length > 0)), `${label}: missing prompt and parts`);
    check(Array.isArray(q.tags) && q.tags.length > 0 && q.tags.every(tag => topics.has(tag)), `${label}: unknown topic tag`);
    const paper = papers.get(q.paperId);
    if (paper && Array.isArray(q.tags)) for (const tag of q.tags) {
      const topic = topics.get(tag);
      if (topic) check(paper.scope.includes(topic.lecture), `${label}: tag ${tag} lies outside paper scope`);
    }
    if (!Array.isArray(q.options) || !Array.isArray(q.parts)) {errors.push(`${label}: options and parts must be arrays`);continue;}
    check(['single_choice','written'].includes(q.type), `${label}: invalid question type`);
    if (q.type === 'single_choice') {
      check(q.options.length === 4 && q.parts.length === 0, `${label}: MCQ requires four options and no written parts`);
      unique(q.options.map(o => o.id), `${label} option IDs`);
      check(q.options.every(o => typeof o.text === 'string' && !!o.text.trim()), `${label}: empty MCQ option`);
    } else {
      check(q.options.length === 0, `${label}: written question must have no options`);
      if (q.parts.length) {
        check(q.parts.reduce((sum,part)=>sum+part.marks,0)===q.marks, `${label}: subquestion marks mismatch`);
        unique(q.parts.map(part=>part.id), `${label} part IDs`);
      }
    }
    const k = answers.get(q.id);
    if (!k) {errors.push(`${label}: missing answer key`);continue;}
    check(k.maxMarks === q.marks, `${label}: answer key marks mismatch`);
    check(typeof k.modelAnswerMarkdown === 'string' && !!k.modelAnswerMarkdown.trim(), `${label}: missing explanation`);
    if (q.type === 'single_choice') {
      check(k.gradingMode === 'auto_single_choice', `${label}: incorrect marking mode`);
      check(q.options.filter(o => o.id === k.correctOptionId).length === 1, `${label}: exactly one correct option ID required`);
    } else {
      check(k.correctOptionId === null && k.gradingMode !== 'auto_single_choice', `${label}: invalid written answer key`);
    }
  }
  for (const key of data.answers) check(questions.has(key.questionId), `Orphan answer key ${key.questionId}`);
  return errors;
}
