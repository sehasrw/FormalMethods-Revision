# StudyHub — Content-Driven Minimal Edition

StudyHub is a minimal, static HTML/CSS/JavaScript revision centre for university Software Engineering students. **Formal Methods is available; Concurrent Programming and IoT are locked; Cyber Security is coming soon.** No database, account or build tool is needed.

## What changed (v3.0)

**Formal Methods content lives in one file: `src/data/formal-methods.json`.** It contains lecture metadata, topics, paper definitions, 75 questions and all 75 model answers. The application reads this file at startup and builds its paper collections, syllabus view, question counts, time limits and marking interface from the data. Original five papers, question IDs, paper IDs and editions were preserved.

When Lecture 3 materials are ready, **replace only `src/data/formal-methods.json`** with the newly validated full JSON file. Do not edit the HTML, CSS, JavaScript or `modules.json` for a routine Formal Methods lecture addition. Existing papers remain intact, and the new papers appear automatically under an appropriate lecture-coverage heading.

**Important:** The currently deployed, pre-v3 StudyHub needs this **one-time project upgrade** first. Simply uploading `formal-methods.json` into the old live website will not work.

## Open in VS Code

1. Extract this ZIP and open the **`virtual-education-centre`** folder.
2. Run it with VS Code **Live Server** or `python3 -m http.server 5500` and open `http://localhost:5500`.
3. Select **Formal Methods** on the four-module homepage. You will see the original five papers under **Lectures 1 & 2**.
4. To test the question bank (Node.js 18+ recommended):

```bash
npm run check
npm test
```

No `npm install` is needed: tests use only Node's built-in APIs.

## Main files

```text
virtual-education-centre/
├── index.html
├── vercel.json
├── src/
│   ├── main.js                  # Generic UI: reads content and renders the site
│   ├── styles.css               # Examination styling
│   ├── centre.css               # Minimal university-centre styling
│   ├── data/
│   │   ├── formal-methods.json  # REPLACE THIS ONE FILE for new FM lectures
│   │   └── modules.json         # Static course availability; other courses locked
│   └── lib/
│       ├── content.js           # JSON verification, derived collections and totals
│       └── exam.js              # Attempt saving, timing, marking
├── scripts/
│   └── validate-content.mjs     # Run npm run check before publishing
├── tests/
│   ├── content.test.mjs         # New lecture import and integrity tests
│   ├── routes.test.mjs
│   ├── modules.test.mjs
│   └── exam.test.mjs
├── docs/
│   ├── UPDATING_FORMAL_METHODS.md  # Simple future lecture workflow
│   ├── CONTENT_AND_GRADING.md
│   ├── ADDING_A_MODULE.md
│   └── VS_CODE_TO_VERCEL.md
└── README.md
```

## Replace content later

1. Send the next lecture PDFs, tutorials and other course examples for syllabus checking.
2. Receive a **complete replacement `formal-methods.json`** containing the previous papers **plus** the newly written, verified questions/keys.
3. In GitHub open `src/data/formal-methods.json`, click **Edit** (pencil), replace its full text with the updated JSON and **Commit changes**. Alternatively replace the file in VS Code and push with Git.
4. Vercel will redeploy automatically from the connected GitHub branch. Refresh the website; the new collection and totals will appear.

**Progress rule:** Never rename an existing `paper.id`, `paper.number`, `question.id` or `paper.edition` unless deliberately making a breaking change. Original attempts use `fm-exam-studio:attempts:v1` in `localStorage`; they remain usable at the **same Vercel website origin** when IDs and editions are unchanged. For substantial edits to an existing paper, deliberately increment that paper's `edition` so users do not accidentally resume the wrong version.

Read [the step-by-step JSON update instructions](docs/UPDATING_FORMAL_METHODS.md) before a content update.

## Publish the upgrade to existing Vercel project

Replace the old website source files in the **same GitHub repository and same folder** (do not create a second Vercel project). Based on the repository layout previously shown, your Vercel Root Directory is **`virtual-education-centre`** if that folder sits at the repository root. Use Framework **Other**, Build Command **empty**, Output Directory **`.`**. Keep your original Vercel domain.

After deployment, test a previously started paper on the same browser and Vercel URL, then test a new visitor's paper start and submission. See [VS Code → Vercel guide](docs/VS_CODE_TO_VERCEL.md).

## Privacy and limits

Everyone has their **own browser-local progress**. There is no server database, sync or shared gradebook. Written solutions are self-assessed; MCQs are automatically marked. On a static site, the JSON file contains the publicly accessible answer keys even though the interface hides them until submission. This is a **practice platform, not a secure university examination**.

Academic verification and reviewing mathematical correctness are still necessary for every new lecture; the automated validator tests structure and references, not the correctness of a proof or model solution.
