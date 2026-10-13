# StudyHub — Minimal design update (v2.1)

## What changed

- The homepage is now a quiet introduction and four clear module cards. Removed the oversized gradient banner, orbit illustrations, floating badges, duplicate continuation panel, metric tiles, and category filters.
- The heading, module label, and availability state establish the hierarchy; no course uses a decorative symbol. Only Formal Methods has an **Enter module** action.
- Formal Methods now presents all five paper cards directly. Paper cards have no decorative glyphs or multiple icon statistics.
- Navigation is text-first, with a compact StudyHub wordmark and fewer utility elements.
- Card shadows and unnecessary accent colors are reduced. Mobile cards stack vertically. Dark mode remains supported.

## What stayed the same

- The four module IDs and statuses in `src/data/modules.json`: Formal Methods available; Concurrent Programming and IoT locked; Cyber Security coming soon.
- Five Formal Methods papers, 75 questions, 75 answer keys, original marks and tags.
- All existing hash routes, so linked papers and bookended review routes still work.
- Attempt storage key, answer saving, advisory timer, post-submission marking, score export, printing, and guided self-marking.

## Where to edit

- `src/main.js` — module content, navigation, paper card layout.
- `src/centre.css` — design tokens, spacing, responsive layouts, the minimal override layer.
- `src/data/modules.json` — availability states, which determine clickable modules. Only enable a module after developing and verifying its content.

## Checking before publication

1. Run `npm test` and `npm run check` (Node.js 18+; no install required).
2. Open `index.html` using VS Code Live Server, not `file://`.
3. Check homepage at wide desktop and narrow mobile widths.
4. Enter Formal Methods, start or resume an attempt, submit, review and self-mark.
5. Test dark mode and return-to-modules navigation.
6. Publish by replacing the files in your existing GitHub repository; Vercel can redeploy the static site.

This is a presentation refresh, not a content or storage migration. Existing browser-local progress should continue to load for users on the same site origin. Browser visual tests are still recommended before broad sharing.
