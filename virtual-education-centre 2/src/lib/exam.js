export const STORAGE_KEY = 'fm-exam-studio:attempts:v1';
export const THEME_KEY = 'fm-exam-studio:theme:v1';

export function createAttempt(paper, mode = 'practice', now = Date.now()) {
  if (!['practice', 'timed'].includes(mode)) throw new Error('Unsupported mode');
  return {
    paperId: paper.id,
    edition: paper.edition,
    mode,
    startedAt: now,
    submittedAt: null,
    answers: {},
    flags: {},
    grades: {},
    lastQuestion: 1,
  };
}

export function isAnswered(question, attempt) {
  if (!attempt) return false;
  if (question.type === 'single_choice') return question.options.some((option) => option.id === attempt.answers[question.id]);
  if (question.parts.length) return question.parts.every((part) => String(attempt.answers[`${question.id}:${part.id}`] ?? '').trim() !== '');
  return String(attempt.answers[question.id] ?? '').trim() !== '';
}

export function hasAnyResponse(question, attempt) {
  if (!attempt) return false;
  if (question.type === 'single_choice') return !!attempt.answers[question.id];
  if (question.parts.length) return question.parts.some((part) => String(attempt.answers[`${question.id}:${part.id}`] ?? '').trim() !== '');
  return !!String(attempt.answers[question.id] ?? '').trim();
}

export function getProgress(questions, attempt) {
  return {
    answered: questions.filter((q) => isAnswered(q, attempt)).length,
    started: questions.filter((q) => hasAnyResponse(q, attempt)).length,
    flagged: questions.filter((q) => !!attempt?.flags[q.id]).length,
    total: questions.length,
  };
}

export function gradeQuestion(question, key, attempt) {
  if (!attempt?.submittedAt) return null;
  if (question.type === 'single_choice') {
    return attempt.answers[question.id] === key.correctOptionId ? question.marks : 0;
  }
  const grade = attempt.grades[question.id];
  return Number.isInteger(grade) && grade >= 0 && grade <= question.marks ? grade : null;
}

export function getScores(questions, keysById, attempt) {
  const graded = questions.map((q) => ({ question: q, mark: gradeQuestion(q, keysById[q.id], attempt) }));
  const awarded = graded.reduce((n, e) => n + (e.mark ?? 0), 0);
  const gradedOutOf = graded.reduce((n, e) => n + (e.mark == null ? 0 : e.question.marks), 0);
  const possible = questions.reduce((n, q) => n + q.marks, 0);
  return {
    awarded,
    gradedOutOf,
    possible,
    remaining: possible - gradedOutOf,
    fullyGraded: gradedOutOf === possible,
    writtenRemaining: graded.filter((x) => x.question.type !== 'single_choice' && x.mark === null).length,
  };
}

export function getTimeRemaining(attempt, paper, now = Date.now()) {
  const end = attempt?.submittedAt ?? now;
  return paper.suggestedMinutes * 60000 - Math.max(0, end - attempt.startedAt);
}

export function formatTime(milliseconds) {
  const abs = Math.max(0, Math.ceil(Math.abs(milliseconds) / 1000));
  const hr = Math.floor(abs / 3600);
  const min = Math.floor((abs % 3600) / 60);
  const sec = abs % 60;
  return [hr, min, sec].map((n) => String(n).padStart(2, '0')).join(':');
}

export function readAttempts(storage) {
  try {
    const decoded = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}');
    return decoded && typeof decoded === 'object' && !Array.isArray(decoded) ? decoded : {};
  } catch { return {}; }
}

export function saveAttempts(storage, attempts) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(attempts)); return true; }
  catch { return false; }
}
