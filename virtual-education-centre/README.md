# StudyHub — Virtual Education Centre

A shareable, **static HTML + CSS + JavaScript** learning centre for university Software Engineering revision. Students land on a module-selection campus before choosing their subject. The existing complete Formal Methods Exam Studio remains accessible and its **five Lecture 1 & 2 papers, 75 questions and 75 model keys** are preserved.

## Module availability

| Module | Portal display | Usable today? |
| --- | --- | --- |
| Formal Methods | Available | **Yes** — 5 papers, Lectures 1 and 2 |
| Concurrent Programming | Locked | No — content pending |
| Cyber Security | Coming soon | No — content pending |
| Internet of Things (IoT) | Locked | No — content pending |

Locked and coming-soon cards are not clickable links to empty classrooms. No course content has been invented for the other subjects.

## Quick start in VS Code

1. Unzip the project and open the **`virtual-education-centre`** folder in Visual Studio Code.
2. Start the VS Code **Live Server** extension on `index.html`. Alternatively, run `python3 -m http.server 5500` in the terminal and visit `http://localhost:5500`.
3. The homepage (`#/`) shows four modules; choose **Formal Methods** to enter the existing paper dashboard.
4. In the Formal Methods sidebar, choose **All modules** to return to the campus homepage.
5. Study paper routes and locally saved attempts work exactly as before.

The site uses `fetch()` to load local JSON; **don't double-click `index.html` as a `file://` page**. Run a simple HTTP server instead. No dependency installation or build step is required.

## Folder structure

```text
virtual-education-centre/
├── index.html                    # Entrypoint, page metadata and stylesheet links
├── vercel.json                   # Vercel static output configuration
├── assets/
│   └── favicon.svg               # StudyHub icon
├── src/
│   ├── main.js                   # Campus + existing Formal Methods app routing
│   ├── styles.css                # Existing exam interface and shared styles
│   ├── centre.css                # New campus, module cards, mobile design
│   ├── data/
│   │   ├── modules.json          # Four course cards and availability states
│   │   ├── papers.json           # Five Formal Methods papers
│   │   ├── questions.json        # 75 Formal Methods questions
│   │   ├── answers.json          # 75 separate model keys
│   │   └── topics.json           # Verified syllabus taxonomy
│   └── lib/exam.js               # Attempt state, marking and time functions
├── scripts/validate-content.mjs # Marks, keys, module availability checks
├── tests/
│   ├── exam.test.mjs             # Existing question engine tests
│   └── modules.test.mjs          # Campus module catalogue tests
└── docs/
    ├── ADDING_A_MODULE.md       # Future-course content and activation workflow
    ├── VS_CODE_TO_VERCEL.md      # Publish on GitHub and Vercel
    ├── CONTENT_AND_GRADING.md
    └── QA_REPORT.md
```

## Tests

Node 18+ recommended for local validation:

```bash
npm run check
npm test
```

These use built-in Node APIs. **You don't need `npm install`**.

## Deployment

Push the contents of this folder to a GitHub repository. Import it into Vercel using framework **Other**, without a build command, and output directory `.`. Full steps: [`docs/VS_CODE_TO_VERCEL.md`](docs/VS_CODE_TO_VERCEL.md).

## Friends and progress

Share the Vercel site link once you've deployed. Every visitor can access the public Formal Methods paper collection. Work and self-marking progress are saved in **that person's own browser** — no central login, no cloud synchronization, and no shared grades. MCQs are automatically marked after submission; written questions require guided **self-marking**. The question-answer JSON is publicly accessible in a static deployment and should not be treated as a secure exam.

## What comes next?

Read [`docs/ADDING_A_MODULE.md`](docs/ADDING_A_MODULE.md) **before unlocking** another module. Only add content after reviewing that module's actual lecture materials. Changing a status alone does not create an exam engine for that module.
