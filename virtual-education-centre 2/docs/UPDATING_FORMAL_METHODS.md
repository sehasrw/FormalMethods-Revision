# Future Lecture Updates — one JSON file

After this one-time v3 upgrade is live, you will never need a full source-code ZIP for an ordinary Formal Methods lecture addition.

## What to send

Supply the original **Lecture 3 PDF**, and ideally its tutorial/exercise sheets. We will verify the syllabus first, develop and review new questions, and prepare **one full replacement file** named `formal-methods.json` containing all previous content plus the new lectures, paper records, questions, answers and tags. We should **not** invent lecture coverage or publish test fixtures as real questions.

## What the JSON contains

`src/data/formal-methods.json` is one JSON object with:

| Top-level field | Purpose |
|---|---|
| `schemaVersion` | Must remain `"2.0"` for this engine |
| `moduleId` | Must remain `"formal-methods"` |
| `title`, `description` | Student-facing module information |
| `lectures[]` | Lecture numbers, exact names and source references |
| `topics[]` | Topic IDs, lecture associations, titles and slide references |
| `papers[]` | Exam metadata, number, edition, scope, time, marks, sections, ordered IDs |
| `questions[]` | Prompts, subparts, options, topic tags, marks and difficulty |
| `answers[]` | Correct MCQ option or written marking guide, linked by question ID |

The dashboard **automatically** groups papers using `paper.scope`: `[1,2]` → **Lectures 1 & 2**, `[3]` → **Lecture 3**, `[1,2,3]` → **Lectures 1–3**. There is no extra manifest to edit. Paper and question counts, collection headings, lecture syllabus sections, question navigation and durations also come from JSON.

## How to replace one file in GitHub

1. Wait until your content has been reviewed and supplied as **the complete replacement**, not a fragment containing only new questions.
2. Open the GitHub repository connected to your live StudyHub.
3. Find `virtual-education-centre/src/data/formal-methods.json` (or `src/data/formal-methods.json` if the repository root is already the website root).
4. Open the file, select **Edit this file** (pencil), select all its contents and paste the **entire** replacement JSON.
5. Commit the change. Vercel will publish it to your existing website as a new deployment.
6. Refresh StudyHub and check the new lecture collection and a sample of questions/solutions.

If you prefer VS Code, place the new JSON at the same path and use Git to commit/push it. **Do not create another file named `lecture-3.json`** because this version reads the consolidated file, not unknown new files.

## Validation before deployment (recommended)

When Node.js is installed and VS Code is open at the directory containing `package.json`, run:

```bash
npm run check
npm test
```

The first command checks unique IDs, available lecture tags, MCQ key IDs, matching section/total marks, paper scope, question ordering and more. Tests also simulate adding a new lecture purely through JSON. These do **not** verify that new Formal Methods solutions are mathematically correct; that requires academic review.

## Very important compatibility rules

- Keep the five original paper IDs (`FM-L12-P01` to `FM-L12-P05`), URLs (paper numbers 1–5), question IDs, and `edition` values unchanged.
- New papers need new `id` values, unused positive integer `number` values (e.g. 6, 7...), and unique question IDs.
- Every question must have one matching answer-key record, valid topic tags, and marks that sum to the declared paper and section totals.
- If revising the wording or grading of an **existing** paper substantially, increment its `edition` intentionally. Saved attempts tied to a different edition will no longer resume. Export important attempt results first.
- Don't publish a new topic as Lecture 3 unless verified against supplied Lecture 3 material.
- The locked modules remain unchanged by editing this Formal Methods content file.
- The same-domain, same-browser localStorage is preserved when a user revisits the site. Moving to a new domain or clearing site data won't preserve it.

## Public answer keys

The complete JSON includes model solutions in an open URL, even before submission. The UI hides them from normal viewing until submission; this is a revision platform, **not protected assessment software**.
