# Formal Methods Exam Studio — QA report

**Source scope:** `Lecture 1.pdf` (29 pages) and `Lecture 2.pdf` (24 pages) supplied in conversation. Their pages/slides are cited in `src/data/topics.json`. They are deliberately omitted from the public repository.

## Automated checks executed

- Five distinct paper records; 15 question IDs per paper
- 75 question records and 75 corresponding examiner-key records
- Each paper has 100 marks and section totals A=20, B=28, C=32, D=20
- Each paper has five foundational, six intermediate and four challenging questions
- Every question has a valid Lecture 1 or Lecture 2 topic tag
- Four options and a corresponding correct-answer ID for every MCQ
- Written question subpart mark allocations sum to their question mark total
- Built-in Node tests for attempt creation, answering, progress, post-submission grading, partial score accounting and time calculations

## Behavioural limitations and manual checks

**Automated browser screenshot/E2E coverage was unavailable in the execution environment** (the local browser navigation was blocked by administration policy). The app's scripts and JSON were validated statically, and its pure attempt/score functions passed tests. Before wide publication, run the human workflow checklist in `docs/VS_CODE_TO_VERCEL.md` on your local browser and the deployed Vercel URL.

Mathematical worked solutions originate from the examiner answer keys supplied in the preceding content-creation stage and were reviewed there, but this build has not been type-checked or model-checked with Atelier B/ProB. Type-check newly edited B code before treating it as an authoritative machine specification.

## Source-slide corrections already applied in the revision papers

- `NAT` begins at 0, despite a source slide omitting 0 from one comprehension example.
- Fixed inconsistent naming/capitalisation in new machine examples rather than copying slide typos.
- Fixed type-inappropriate singleton/element set union from a lecturer illustration.
- Deferred set constants may denote the same value unless explicitly required to differ.
- Parallel assignments use a single pre-state.

## Privacy and accessibility disclosures

- The app transmits no answers to a backend. Browser `localStorage` is not an account, backup or cross-device sync system.
- The timer is advisory and does not force submission.
- Written answers are self-assessed and clearly distinguished from auto-marked MCQs.
- Static answer keys are publicly inspectable; this is an open revision application only.
- Semantic labels, focus outlines, color-independent choice states, and print/mobile layouts are provided. A complete WCAG audit with assistive-technology users has not been performed.

## StudyHub multi-module update — 13 October 2026

The platform has been repackaged as **StudyHub — Virtual Education Centre** with `src/data/modules.json`. Four records have been checked:

- `formal-methods` — `available`; preserved complete Lecture 1 and 2 revision app.
- `concurrent-programming` — `locked`; no subject content published.
- `cyber-security` — `planned`; no subject content published.
- `iot` — `locked`; no subject content published.

The landing page is `#/` and the Formal Methods dashboard is `#/formal-methods`. Existing paper/exam routes (`#/papers`, `#/paper/…`) and browser attempt storage key remain the same. Other modules do **not** link to paper routes.

**Automated tests:** `npm run check` validates the four module statuses, five papers, 75 answers and marks; `npm test` passes 10 tests covering attempt logic, marking, modules and route-rendered HTML. These tests do not constitute full visual/manual cross-browser QA. Browser-based review on desktop and mobile is recommended before sharing publicly. No new lecture content was invented.
