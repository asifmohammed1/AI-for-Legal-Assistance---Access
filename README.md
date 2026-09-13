# AI for Legal Assistance & Access

> GenAI-powered legal document intelligence platform — powered by **Google Gemini 2.0 Flash**

**🌍 Live Demo:** [https://ai-for-legal-assistance-access-dusky.vercel.app/](https://ai-for-legal-assistance-access-dusky.vercel.app/)
**💻 GitHub Repo:** [https://github.com/asifmohammed1/AI-for-Legal-Assistance---Access](https://github.com/asifmohammed1/AI-for-Legal-Assistance---Access)

[![CI](https://github.com/asifmohammed1/AI-for-Legal-Assistance---Access/actions/workflows/ci.yml/badge.svg)](https://github.com/asifmohammed1/AI-for-Legal-Assistance---Access/actions)

## ⚠️ Disclaimer

This platform provides **informational assistance only**. It does not constitute legal advice and should not be relied upon as a substitute for guidance from a qualified, licensed legal professional. Always consult a solicitor or lawyer for advice specific to your situation.

---

## Overview

**AI for Legal Assistance & Access** makes legal information more accessible by helping users understand, compare, and navigate legal documents through seven AI-powered features — all without replacing professional legal advice.

```text
┌─────────────────────────────────────────────────────────────────┐
│                 User (Browser)                                  │
│  index.html → js/app.js → GeminiClient.query()                  │
│                    ↓                                            │
│          Google Gemini 2.0 Flash API                            │
│                    ↓                                            │
│   UIHelpers.renderMarkdown() → Output Panel                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 📄 **Document Simplifier** | Plain-English summary of any legal document |
| 2 | ⚠️ **Risk Highlighter** | HIGH/MEDIUM/LOW risk clause detection |
| 3 | ⚖️ **Contract Comparator** | Side-by-side comparison with recommendation |
| 4 | 💬 **Document Q&A** | Context-grounded question answering |
| 5 | ✅ **Action Checklist** | Before/after signing task lists |
| 6 | 🤝 **Lawyer Prep** | Questions to ask your legal professional |
| 7 | 📖 **Legal Dictionary** | Plain-English legal term definitions |

---

## Architecture

```text
AI for Legal Assistance & Access/
├── index.html              → Semantic HTML5, zero inline JS/CSS
├── sw.js                   → Service Worker (Cache-First)
├── manifest.json           → PWA manifest
├── css/
│   └── styles.css          → Dark theme, glassmorphism, CSS variables
├── js/
│   ├── config.js           → Frozen constants (CONFIG, TIME_MS, AI_ERROR, DEMO)
│   ├── ui.js               → UIHelpers: toast, loading, markdown renderer
│   ├── gemini.js           → GeminiClient: LRU cache, rate limiter, AbortController
│   ├── document.js         → DocProcessor: upload, sanitise, validate, stats
│   ├── analysis.js         → Analyser: all 7 system prompt builders
│   ├── checklist.js        → ChecklistGen: checklist + prep orchestration
│   └── app.js              → Bootstrap, handler map, SW registration
├── tests/
│   └── legal.test.js       → 20+ suites, 90+ assertions, zero dependencies
├── Dockerfile              → nginx:alpine, port 8080
├── nginx.conf              → Security headers, gzip, /healthz
└── .github/workflows/ci.yml → Lint + HTML validate + Test + Docker
```

---

## Problem Statement Compliance Matrix

| Requirement | Implementation |
|-------------|---------------|
| Simplifying complex legal documents | `Analyser.simplifyPrompt()` → `section-simplify` |
| Comparing contracts / policies | `Analyser.comparePrompt()` → `section-compare` |
| Highlighting clauses, risks, obligations | `Analyser.riskPrompt()` → `section-risks` |
| Answering questions on provided documents | `Analyser.qaPrompt()` → `section-qa` |
| Options and potential next steps | `ChecklistGen.runChecklist()` → `section-checklist` |
| Generating summaries / checklists | Both simplify and checklist features |
| Preparing questions for legal professional | `ChecklistGen.runPrepQuestions()` → `section-prep` |
| NOT replacing professional advice | Disclaimer on every AI output + footer banner |

---

## Quick Start

**Demo mode (no API key required):**
```bash
npm run serve
```
Open `http://localhost:3000` — all features work with built-in demo responses.

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
# http://localhost:8080/healthz → "ok"
```

---

## Code Quality

- ESLint: 0 errors, 0 warnings (`--max-warnings 0`)
- All functions <= 50 lines (enforced by `max-lines-per-function`)
- JSDoc on every exported function
- All constants frozen with `Object.freeze()`
- `no-var`, `prefer-const`, `eqeqeq`, `no-eval` rules enforced

---

## License

MIT © 2026 Asif | AntiGravity
