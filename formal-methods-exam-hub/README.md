# Formal Methods · Exam Studio

A complete, **static HTML + CSS + JavaScript** revision website based on the supplied Lecture 1 and Lecture 2 PDFs. It contains **five independent 100-mark papers, 75 questions, and 75 examiner answer keys**. There is **no database, backend, package installation, or build step** needed to run or deploy the website.

## Quick start in Visual Studio Code

1. Unzip `Formal-Methods-Exam-Studio.zip`.
2. In VS Code, select **File → Open Folder** and select `formal-methods-exam-hub` (the folder containing `index.html`).
3. Install/use the VS Code **Live Server** extension, right-click `index.html` and choose **Open with Live Server**.
4. Alternatively, open the built-in Terminal, run `python3 -m http.server 5500` from this folder, then visit `http://localhost:5500`. On Windows, `py -m http.server 5500` may work.
5. Select **Revision papers → Paper 01 → Start this paper**.

> The site loads four JSON files using `fetch`. Opening `index.html` by double-clicking (`file://`) will usually fail because browsers restrict local JSON requests. Use Live Server or any local HTTP server.

## Project file tree

```text
formal-methods-exam-hub/
├── index.html                  # Entry page
├── vercel.json                 # Serve the repository root as static output
├── .gitignore
├── package.json                # Optional Node-only validation/test scripts
├── README.md
├── assets/
│   └── favicon.svg
├── src/
│   ├── main.js                 # Routing, rendering, paper taking, grading UI
│   ├── styles.css              # Responsive design + dark mode + print styles
│   ├── lib/
│   │   └── exam.js             # Testable pure attempt/score/time functions
│   └── data/
│       ├── papers.json         # Five paper descriptors and sections
│       ├── questions.json      # Seventy-five questions, including all parts
│       ├── answers.json        # Separate marking keys for all questions
│       └── topics.json         # Confirmed Lecture 1/2 topic taxonomy
├── scripts/
│   └── validate-content.mjs    # Cross-check marks, keys, tags, IDs
├── tests/
│   └── exam.test.mjs           # Attempt, progress, score, timer tests
└── docs/
    ├── VS_CODE_TO_VERCEL.md    # Complete walkthrough
    ├── CONTENT_AND_GRADING.md # Data fields and grading boundaries
    └── QA_REPORT.md           # Testing and academic scope notes
```

## Features

- Dashboard with paper statuses, latest progress, and scores
- Five independent 15-question papers with clear section/marks displays
- Untimed practice or 150-minute **advisory** countdown
- MCQ options, separate written subpart answers, flag-for-review, and question navigator
- Auto-save using this browser's `localStorage`, with resume after reopening the page
- Confirm before submitting, with incomplete-question count
- Post-submission model answers and MCQ automatic grading
- Fair self-marking inputs for written questions, 0 to maximum marks
- Progress and final score only when all 100 marks have been evaluated
- Downloadable attempt JSON, retake/reset, print-only questions, light/dark mode
- Responsive layout for phone, tablet, and desktop

## Running checks (optional, Node.js 18+)

```bash
npm run check
npm test
```

These scripts use Node's built-in facilities; **`npm install` is not needed**.

## Publishing to GitHub + Vercel

Read [`docs/VS_CODE_TO_VERCEL.md`](docs/VS_CODE_TO_VERCEL.md) for the exact steps. Import this repository into Vercel with framework preset **Other**, no build command and output directory **`.`**. `vercel.json` already declares the output directory.

## Accuracy and privacy notes

- Topics come strictly from **Lecture 1: Introduction; the B-Method** and **Lecture 2: Sets, Constants and Variables**; later lectures have been excluded.
- The authored papers and their answer keys were verified for question IDs and marks. See `docs/QA_REPORT.md` for validation boundaries.
- Non-MCQ answers are **not automatically graded**: the student chooses their mark after reading the actual marking key. This is intended for revision, not invigilated university assessment.
- Answer keys appear only after submission in the interface. **They are still publicly accessible in `src/data/answers.json`** because any static browser-delivered assets are public. Do not describe this system as secure exam proctoring.
- Browser-local progress can disappear after clearing site data or changing devices. Use **Export attempt** to keep a portable JSON backup (currently export only; importing attempts is not yet supported).
- Original lecturer PDF files are deliberately **not included** in this public website package.
- This static project does not transmit submitted answers to a server.
