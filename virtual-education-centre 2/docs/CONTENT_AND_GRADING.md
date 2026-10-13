# Question bank and grading — data format v2.0

The complete, replaceable Formal Methods question bank is in **`src/data/formal-methods.json`**. It is an object containing `schemaVersion`, `moduleId`, `title`, `description`, `lectures`, `topics`, `papers`, `questions` and `answers`.

A `paper` has a permanent `id`, unique URL `number`, `edition`, `scope` as lecture numbers, `suggestedMinutes`, `totalMarks`, `questionCount`, `questionIds` in order, and `sections[]` with their own `id`, `title`, `marks`, and ordered `questionIds`. The engine derives paper groups from `scope` and does not require a separate collection configuration.

A `question` has `id`, `paperId`, sequential `number`, `section`, `type` (`single_choice` or `written`), `difficulty`, `marks`, `tags` (IDs from `topics`), `promptMarkdown`, `parts` and `options`. Each `answer` has the corresponding `questionId`, `modelAnswerMarkdown`, `maxMarks`, `gradingMode`, and `correctOptionId` (`A`/`B`/`C`/`D` for MCQs, `null` for written).

An abbreviated example (not a complete paper):

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

For multipart written questions, the `parts` array contains `{ "id": "a", "promptMarkdown": "...", "marks": 2 }` records whose marks sum to the question's `marks`. Their responses are stored as individual fields in the browser.

### Marking

- MCQs are single-choice and automatically receive full credit or 0 after submission.
- Written responses require **guided self-marking** using the model answer. The user assigns a whole-number mark from 0 through the question maximum.
- A score is **partial** until all written questions receive a self-assessed grade. The display distinguishes earned and pending marks.
- Answers are included in client-side JSON and can be inspected publicly. They are hidden in the examination interface until submission, not secured on a server.
- Questions are rendered using an escaped, limited subset of Markdown; they are data, not JavaScript code. In JSON, backslashes for B notation require escaping, e.g. `\\/` for the `\\/` operator.

### Maintaining academic integrity

A new lecture's exact topics and notation must be verified from supplied slides/tutorials. The validator checks field integrity, IDs, types, references and totals, but cannot prove mathematical accuracy. Use `npm run check` and `npm test`, then manually inspect the new paper and solutions. Keep existing paper IDs and `edition` values stable for saved progress; increment `edition` intentionally when an existing paper changes meaningfully.

For one-file updating instructions, see [UPDATING_FORMAL_METHODS.md](UPDATING_FORMAL_METHODS.md).
