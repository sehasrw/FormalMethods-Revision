# VS Code → GitHub → Vercel: complete beginner walkthrough

## Step 1 — Download and extract the website folder

Download the `Formal-Methods-Exam-Studio.zip` package, extract it, and find the **`formal-methods-exam-hub`** folder. The `index.html` file must be directly inside this folder, alongside `vercel.json` and `README.md`.

## Step 2 — Open the entire folder in VS Code

1. Open Visual Studio Code.
2. Select **File → Open Folder…** (Windows/Linux) or **File → Open…** (macOS) and choose `formal-methods-exam-hub`.
3. Verify the Explorer shows `index.html`, `src`, `assets`, and `docs` at the top level.
4. You can inspect or edit the text in `src/data/*.json` and design in `src/styles.css`.

Do **not** put the `index.html` file inside `src/`; it is the static entry page for the deployment.

## Step 3 — Run the website locally

**Easiest: VS Code Live Server**

1. Open Extensions in VS Code and install the *Live Server* extension.
2. Right-click `index.html` → **Open with Live Server**.
3. A browser should open at a local URL such as `http://127.0.0.1:5500`.
4. Open Paper 01, select **Practice mode**, and choose **Start this paper**.

**Alternative: built-in terminal**

```bash
# Run from the directory containing index.html
python3 -m http.server 5500
```

Then visit `http://localhost:5500`. If using Windows and `python3` is unavailable, use `py -m http.server 5500` if Python is installed.

**Do not double-click `index.html`** because `file://` loading is blocked for the JSON question bank by most browsers.

## Step 4 — Test the important student workflows

1. Browse the papers and confirm there are five.
2. Start Paper 01, select an MCQ answer, type an answer for a written subpart, and leave/reopen the page. Confirm the answers remain.
3. Visit Question 15 and submit the paper (confirm the warning about incomplete questions).
4. Open Q1 to see its MCQ correction; open Q3 to compare written answers with the marking key and award a whole-number self-mark.
5. Return to Results. Notice the score indicates **partial marking** until written questions are all reviewed.
6. Try **Export attempt**, **Print questions**, **Dark mode**, and the mobile browser view.

Your progress is stored in `localStorage` in the browser that performed the work. Live Server's `127.0.0.1:5500` and `localhost:5500` are **different origins** and therefore will not share saved attempts.

## Step 5 — Run the content and functional tests (optional)

If Node.js is installed, open the VS Code integrated terminal and run:

```bash
npm run check
npm test
```

These check the complete 75-question bank and key totals, as well as several score and resume calculation rules. You do not need `npm install`.

## Step 6 — Create a GitHub repository

1. Sign in to [GitHub](https://github.com).
2. Click **New repository** and call it e.g. `formal-methods-exam-studio`.
3. Keep the repository empty initially (do not select automatic README/gitignore creation since these already exist locally).
4. In VS Code Terminal, from the project root, run:

```bash
git init
git add .
git commit -m "Initial Formal Methods exam hub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/formal-methods-exam-studio.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username and authenticate as prompted. Never commit authentication tokens, passwords, student answer exports or private course material. The `.gitignore` already excludes common local/deployment artifacts.

## Step 7 — Deploy with Vercel

1. Sign in to [Vercel](https://vercel.com) with GitHub, and connect your GitHub account if asked.
2. Select **Add New → Project** and **Import** the `formal-methods-exam-studio` repository.
3. Use the project root (the directory containing `index.html`) as the **Root Directory**.
4. Choose **Other** for **Framework Preset**.
5. Leave **Build Command** empty (with override enabled if Vercel shows one); this site requires no build.
6. Ensure **Output Directory** is **`.`** (root). The included `vercel.json` sets this explicitly. **Do not set it to `src` or `assets`.**
7. Click **Deploy**. Vercel will give you a `*.vercel.app` URL.

Vercel documents this static-site configuration here: https://vercel.com/docs/builds/configure-a-build

**Important:** For this app, the `src/data` directory and its four JSON files must be deployed along with `index.html` and `src/main.js`. A successful site will load the paper library with five cards and no “Couldn't load the question bank” warning.

## Step 8 — Publish future updates

Edit project files locally in VS Code. Test with Live Server and the scripts, then run:

```bash
git add .
git commit -m "Improve revision content and interface"
git push
```

Vercel automatically deploys updates from the connected Git branch. Verify the deployed website after each update, especially after changing question IDs or answer keys.

## Step 9 — Share safely

This is an **open revision platform**. The correct answers must be shipped to browsers to support self-review, so motivated users can inspect them via Developer Tools even before submitting. This is normal for a practice site; not appropriate for confidential high-stakes examinations.

For actual invigilated assessments, use server-side grading, authentication and protected data, rather than this static project.

## Common troubleshooting

| Problem | What to check |
| --- | --- |
| Blank screen or question-bank error | Run with HTTP server, not `file://`, and check that all four `src/data/*.json` paths exist. |
| Site shows 404 for `src/main.js` | Confirm `index.html` is in repository root and `src/main.js` exists. |
| Vercel only shows favicon or no page | Set output directory to `.`; do not deploy only `assets`. |
| Answers disappear | Local storage may have been cleared, browser/device changed, or local URL switched between `localhost` and `127.0.0.1`. |
| Scoring only counts MCQs | This is expected until every written answer has been manually self-marked. |
| `git push` fails with remote error | Check the exact repository URL, branch and GitHub authorization. |
| Updates are not visible | Verify the Vercel deployment succeeded, then refresh the page; do not rename immutable question IDs casually. |
