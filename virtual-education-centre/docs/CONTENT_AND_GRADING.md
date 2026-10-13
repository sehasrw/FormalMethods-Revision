# Question bank and marking model

## Files and relationships

- `src/data/papers.json` holds five paper headers, title, 150-minute suggested duration, 100 marks, ordered question IDs and section totals.
- `src/data/questions.json` holds 75 question records. An individual question has `id`, `paperId`, `number`, `section`, `type`, `difficulty`, `marks`, `tags`, `promptMarkdown`, optional `parts[]`, and optional `options[]`.
- `src/data/answers.json` contains 75 records keyed by `questionId`, with `correctOptionId` for MCQs, `modelAnswerMarkdown`, `maxMarks`, and `gradingMode`.
- `src/data/topics.json` maps each topic code (e.g. `L2.4`) to its lecture title, description and slide range.

Example question shape (abbreviated):

```json
{
  "id": "FM-L12-P01-Q01",
  "paperId": "FM-L12-P01",
  "number": 1,
  "section": "A",
  "type": "single_choice",
  "difficulty": "foundational",
  "marks": 4,
  "tags": ["L1.3"],
  "promptMarkdown": "Which best describes a formal specification?",
  "parts": [],
  "options": [
    { "id": "A", "text": "..." },
    { "id": "B", "text": "..." },
    { "id": "C", "text": "..." },
    { "id": "D", "text": "..." }
  ]
}
```

For a multi-part written question, `parts` has entries like `{ "id": "a", "promptMarkdown": "...", "marks": 2 }`. The app displays a separate textarea for every part, and a question counts as fully answered only when every part has a nonblank response.

Mathematical ASCII notation such as `A \\/ B` must be escaped correctly in JSON. JSON text is loaded as data, never run as JavaScript. The app uses a deliberately limited escape-first Markdown renderer for bold, italic, code spans, plain paragraphs, and fenced code.

## Grading boundary

- On starting a paper, answer keys are not displayed in the examination interface.
- On submission, each selected MCQ automatically receives either its full mark allocation or zero.
- Written answers cannot be reliably checked by comparing text strings. The app instead shows the original examiner explanation, lets the student award an integer 0–maximum, and records that self-mark.
- “Score X / 100” must not be described as complete until all written questions have a chosen self-mark. Before that, the UI shows **X currently earned from Y evaluated marks, with 100−Y marks pending**.
- Re-attempting clears one paper's answers and marks. **Export** saves a JSON snapshot for the user; there is no import feature yet.
- Exam mode is a revision workflow, not a secure or invigilated university exam. Static JSON answer keys are always fetchable directly.

## Content maintenance

If editing content, update its question and answer key together, keep immutable question IDs when possible, and increment `edition` in `papers.json` for substantive changes so old saved attempts do not silently map to changed wording. Validate with:

```bash
npm run check
npm test
```

The test suite checks 15 questions per paper, 100 marks per paper, four section totals, one key per question, question part marks, MCQ options, and difficulty counts. It cannot guarantee the mathematical truth of arbitrary future questions. Have a lecturer review any new academic material.

## Source conventions

- `INTEGER` includes all integers; `NAT` begins at 0; `NAT1` begins at 1.
- B operators include `\\/` for union, `/\\` for intersection, `-` for difference, `<:` for subset, `<<:` for strict subset, `:` and `/:` for membership and nonmembership.
- Parallel assignment `||` uses pre-state right-hand-side values.
- All exercises are restricted to lecture-supported content; later relations, functions, advanced sequences, temporal logic formulae and formal proofs are not introduced.
