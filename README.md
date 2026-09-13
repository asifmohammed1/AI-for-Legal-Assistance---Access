# AI for Legal Assistance & Access

> GenAI-powered legal document intelligence platform â€” powered by **Google Gemini 2.0 Flash**

[![CI](https://github.com/your-org/ai-legal-assistance/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/ai-legal-assistance/actions)

## âš ï¸ Disclaimer

This platform provides **informational assistance only**. It does not constitute legal advice and should not be relied upon as a substitute for guidance from a qualified, licensed legal professional. Always consult a solicitor or lawyer for advice specific to your situation.

---

## Overview

**AI for Legal Assistance & Access** makes legal information more accessible by helping users understand, compare, and navigate legal documents through seven AI-powered features â€” all without replacing professional legal advice.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 User (Browser)                       â”‚
â”‚  index.html â†’ js/app.js â†’ GeminiClient.query()      â”‚
â”‚                    â†“                                 â”‚
â”‚          Google Gemini 2.0 Flash API                 â”‚
â”‚                    â†“                                 â”‚
â”‚   UIHelpers.renderMarkdown() â†’ Output Panel          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | ðŸ“„ **Document Simplifier** | Plain-English summary of any legal document |
| 2 | âš ï¸ **Risk Highlighter** | HIGH/MEDIUM/LOW risk clause detection |
| 3 | âš–ï¸ **Contract Comparator** | Side-by-side comparison with recommendation |
| 4 | ðŸ’¬ **Document Q&A** | Context-grounded question answering |
| 5 | âœ… **Action Checklist** | Before/after signing task lists |
| 6 | ðŸ¤ **Lawyer Prep** | Questions to ask your legal professional |
| 7 | ðŸ“– **Legal Dictionary** | Plain-English legal term definitions |

---

## Architecture

```
AI for Legal Assistance & Access/
â”œâ”€â”€ index.html              â† Semantic HTML5, zero inline JS/CSS
â”œâ”€â”€ sw.js                   â† Service Worker (Cache-First)
â”œâ”€â”€ manifest.json           â† PWA manifest
â”œâ”€â”€ css/
â”‚   â””â”€â”€ styles.css          â† Dark theme, glassmorphism, CSS variables
â”œâ”€â”€ js/
â”‚   â”œâ”€â”€ config.js           â† Frozen constants (CONFIG, TIME_MS, AI_ERROR, DEMO)
â”‚   â”œâ”€â”€ ui.js               â† UIHelpers: toast, loading, markdown renderer
â”‚   â”œâ”€â”€ gemini.js           â† GeminiClient: LRU cache, rate limiter, AbortController
â”‚   â”œâ”€â”€ document.js         â† DocProcessor: upload, sanitise, validate, stats
â”‚   â”œâ”€â”€ analysis.js         â† Analyser: all 7 system prompt builders
â”‚   â”œâ”€â”€ checklist.js        â† ChecklistGen: checklist + prep orchestration
â”‚   â””â”€â”€ app.js              â† Bootstrap, handler map, SW registration
â”œâ”€â”€ tests/
â”‚   â””â”€â”€ legal.test.js       â† 20+ suites, 90+ assertions, zero dependencies
â”œâ”€â”€ Dockerfile              â† nginx:alpine, port 8080
â”œâ”€â”€ nginx.conf              â† Security headers, gzip, /healthz
â””â”€â”€ .github/workflows/ci.yml â† Lint + HTML validate + Test + Docker
```

---

## Problem Statement Compliance Matrix

| Requirement | Implementation |
|-------------|---------------|
| Simplifying complex legal documents | `Analyser.simplifyPrompt()` â†’ `section-simplify` |
| Comparing contracts / policies | `Analyser.comparePrompt()` â†’ `section-compare` |
| Highlighting clauses, risks, obligations | `Analyser.riskPrompt()` â†’ `section-risks` |
| Answering questions on provided documents | `Analyser.qaPrompt()` â†’ `section-qa` |
| Options and potential next steps | `ChecklistGen.runChecklist()` â†’ `section-checklist` |
| Generating summaries / checklists | Both simplify and checklist features |
| Preparing questions for legal professional | `ChecklistGen.runPrepQuestions()` â†’ `section-prep` |
| NOT replacing professional advice | Disclaimer on every AI output + footer banner |

---

## Quick Start

**Demo mode (no API key required):**
```bash
npx --yes serve . -l 3000
```
Open `http://localhost:3000` â€” all features work with built-in demo responses.

**With Gemini API key:**
Enter your key in the header input field. Get a key at [aistudio.google.com](https://aistudio.google.com).

---

## Development

```bash
# Install dev dependencies
npm install

# Lint JavaScript
npm run lint

# Validate HTML
npm run validate

# Run tests
npm test

# Serve locally
npm run serve
```

---

## Security

- **XSS prevention**: 5-step sanitisation on all user-provided text (`DocProcessor.sanitise()`)
- **No `eval` / `innerHTML`**: All user content rendered via `textContent` or a safe markdown renderer
- **File upload**: MIME type + 500 KB size validation before reading
- **API safety**: 4 harm categories at `BLOCK_MEDIUM_AND_ABOVE`
- **Fetch timeout**: 15-second `AbortController` on all Gemini requests
- **Rate limiting**: 1.5-second minimum gap between API calls
- **nginx headers**: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

---

## Docker

```bash
docker build -t ai-legal-assistance .
docker run -p 8080:8080 ai-legal-assistance
# http://localhost:8080/healthz â†’ "ok"
```

---

## Code Quality

- ESLint: 0 errors, 0 warnings (`--max-warnings 0`)
- All functions â‰¤ 50 lines (enforced by `max-lines-per-function`)
- JSDoc on every exported function
- All constants frozen with `Object.freeze()`
- `no-var`, `prefer-const`, `eqeqeq`, `no-eval` rules enforced

---

## License

MIT Â© 2026 Asif | AntiGravity
