# Adding a new module to StudyHub

Current state (2026 edition): **Formal Methods** is live; **Concurrent Programming** and **Internet of Things (IoT)** are locked; **Cyber Security** is listed as coming soon (also not accessible). No new coursework was invented for those modules.

## Module catalogue

All module cards are driven by `src/data/modules.json`. Each record has:

| Field | Example | Meaning |
| --- | --- | --- |
| `id` | `concurrent-programming` | Permanent URL-safe identifier |
| `number` | `02` | Display order |
| `title` | `Concurrent Programming` | Student-facing module name |
| `status` | `locked` | `available`, `locked`, or `planned` |
| `description` | Text | Course-card summary |

**Important:** Changing a module from `locked` or `planned` to `available` is **not enough** to launch a new course. `src/main.js` currently links available module cards to the Formal Methods classroom; you must add the new module's own route and content loading first, otherwise a second available card would open the wrong subject. The validator intentionally forbids this situation.

## Workflow for unlocking another course

1. **Obtain its lecture notes and slides.** Establish verified scope and correct notation, as we did for Formal Methods.
2. Create a unique data directory, recommended: `src/modules/<module-id>/data/`.
3. Publish verified papers, questions, answer keys, topic taxonomy and instructions for that module. Model answers may be stored in the same module-specific JSON document as questions, as for Formal Methods; this is still publicly readable in a static deployment.
4. Add a route for the new module to `src/main.js`, plus a route-prefix-aware paper engine, so attempts from different subjects cannot share a question/paper ID accidentally.
5. Update `moduleCard()` to obtain the open URL from the validated module's route, not the current Formal Methods default.
6. When the module is fully functional and tested, change its `status` to `available` in `src/data/modules.json` and update the QA checks.
7. Run `npm run check` and `npm test`, then verify navigation, grading, answer keys and mobile usability in a normal browser.

## Current Formal Methods preservation

The original 5 papers are preserved inside `src/data/formal-methods.json` and **the existing browser storage key has not been changed**. All existing routes (`#/papers`, `#/paper/1`, `#/paper/1/q/1`, etc.) remain operational. The Formal Methods module home is now `#/formal-methods`, while `#/` is the new StudyHub campus homepage.

## User data, friends, and privacy

- Students use their **own browsers**; progress is saved on each device's `localStorage`. There is no central account or cross-device sync.
- Friends do not see each other's answers or results.
- The site is static and has no server-side authentication or private exam security. Answer keys are fetched by students' browsers, though hidden in the interface until submission.
- For a true multi-user learning-management system, authentication, database-backed accounts and server-side access controls would need to be designed separately.
