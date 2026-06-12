# Claude Certified Architect — Foundations Prep

A single-page study app for the **Claude Certified Architect (Foundations)** exam. It
combines domain-by-domain practice questions, a timed mock exam, and a printable quick-
reference cheat sheet. All progress is stored locally in the browser — there is no
backend.

## Features

- **Five study domains** (Agentic Architecture, Tool Design & MCP, Claude Code
  Configuration, Prompt Engineering, Context Management) with practice questions mapped
  to the official exam-guide skills. Answers are scored instantly with explanations.
- **Mock exam** — all 60 official questions across four scenario pipelines (Research
  Pipeline, Code Exploration, Customer Support, Extraction Pipeline), timed to 90
  minutes with a 70% pass threshold, per-scenario score breakdown, and answer review.
  In-progress exams are saved and can be resumed after a refresh.
- **Cheat sheet** — condensed decision rules per domain, printable to PDF.
- **Hash-based routing** — every view is deep-linkable (e.g. `#domain-2`, `#mock`) and
  survives a page refresh.
- **Local progress tracking** — your answers persist in `localStorage`. Progress keys
  are derived from question content, so editing/reordering the question bank never
  silently corrupts saved progress.

## Getting started

```bash
npm install
npm run dev      # start the Vite dev server
```

Then open the printed local URL (default http://localhost:5173).

## Scripts

| Script             | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `npm run dev`      | Start the development server             |
| `npm run build`    | Production build into `dist/`            |
| `npm run preview`  | Preview the production build             |
| `npm run lint`     | Run ESLint                               |
| `npm test`         | Run the Vitest unit tests once           |
| `npm run test:watch` | Run Vitest in watch mode               |

## Project structure

```
src/
  App.jsx               App shell, hash routing, error boundary
  main.jsx              React entry point
  index.css             All styles (CSS-variable theme)
  components/           UI components (Home, Sidebar, DomainView, MockExam, …)
  data/
    domains.js          Practice questions, grouped by domain → task → skill
    mockExamQuestions.js The 60 mock-exam questions
    cheatSheet.js        Quick-reference rules
  hooks/
    useProgress.js      React hook wrapping progress state + localStorage
  lib/
    scoring.js          Pure scoring/key logic (unit-tested)
    scoring.test.js     Vitest tests for the scoring logic
  utils/
    RichText.jsx        Renders `inline code` spans safely (no innerHTML)
```

## Tech stack

React 18 + Vite 5. No runtime dependencies beyond React. Styling is plain CSS driven by
custom properties defined in `:root` (see `src/index.css`).

## Notes

- Progress and mock-exam state live in `localStorage` under the `cca-` key prefix.
  Use the **Reset progress** button on the home screen to clear practice progress.
