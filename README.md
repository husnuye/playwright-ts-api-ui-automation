# Playwright (TypeScript) — API + Web UI Test Automation (Isolated Projects)

This repository is prepared for an **AI-augmented QA engineering case** and contains **two isolated Playwright + TypeScript projects** under a single repo:
- `ApiTests/` (API automation)
- `WebTests/` (UI automation)

> Isolation goal: each project has its own `package.json`, dependencies, configs and reports (no shared code).

---

## 1) ✅ What is covered (Scope)

### 1.1 ApiTests — Restful Booker API
Implements the full lifecycle:
**Auth → Create (dynamic data) → Get (JSON Schema + type validation) → Update (token) → Delete**

AI tasks covered:
- **Dynamic test data** for Create (no hardcoded data)
- **JSON Schema validation** for Get (validates values + data types)

### 1.2 WebTests — SauceDemo UI (POM + Visual Testing)
- `standard_user`: login → sort by price desc → add most expensive item → checkout → verify **“Thank you for your order”**
- `visual_user`: perform **visual comparison** of inventory/home screen vs `standard_user` using Playwright snapshot testing

---

## 2) 🧰 Tech Stack
- **TypeScript + Playwright Test Runner**
- **AJV** (JSON Schema validation)
- Dynamic data generation (factory approach; optionally Faker)
- UI: **POM (Page Object Model)** + `toHaveScreenshot()` visual assertions

---

## 3) 📦 Deliverables (Case Submission)
- `prompts/prompts.md` — AI prompts log (what was asked / generated / refined)
- `reports/Test-Strategy-Analysis.pdf` — Part 3 final report (Test Strategy & Scenario Mining)
- `reports/Part3-Scenario-Mining.md` — (optional) markdown working notes
- `reports/demo-videos/standard.mp4`, `reports/demo-videos/visual.mp4` — demo recordings (optional but helpful)

---

## 4) 🎥 Demo Videos (MP4)
Local, macOS-friendly:
- `reports/demo-videos/standard.mp4`
- `reports/demo-videos/visual.mp4`

> Note: Playwright records `.webm` by default. MP4 versions are included for easier playback.

---

## 5) ▶️ Run Locally

### Requirements
- Node.js (20+ recommended)
- npm

### API
```bash
cd ApiTests
npm ci
npx playwright install
npm test
npm run report

### UI

cd WebTests
npm ci
npx playwright install
npm test
npm run report

## 6) 🧪 Evidence & Debugging (Reports / Trace / Video / Screenshots)

Both projects are configured to keep test evidence:
	•	trace: retain-on-failure
	•	screenshot: only-on-failure
	•	video: retain-on-failure

Artifacts are generated under:
	•	*/playwright-report/ (HTML report)
	•	*/test-results/ (trace/video/screenshots on failure; snapshot diffs for visual tests)

⸻

## 7) 🗂 Repository Structure

.
├─ ApiTests/
│  ├─ src/
│  ├─ tests/
│  ├─ playwright.config.ts
│  └─ package.json
├─ WebTests/
│  ├─ src/
│  ├─ tests/
│  ├─ playwright.config.ts
│  └─ package.json
├─ prompts/
│  └─ prompts.md
└─ reports/
   ├─ Test-Strategy-Analysis.pdf
   ├─ Part3-Scenario-Mining.md
   └─ demo-videos/


##8) 🚀 CI/CD (GitHub Actions)

Two separate workflows are provided:
	•	.github/workflows/api-tests.yml → runs ApiTests only
	•	.github/workflows/web-tests.yml → runs WebTests only

Each workflow:
	•	installs dependencies
	•	installs Playwright browsers
	•	runs tests
	•	uploads artifacts (playwright-report/, test-results/) for debugging

⸻
## 9) Notes (Principal QA mindset)
	•	This suite focuses on high-signal coverage: critical lifecycle flows + visual regression for UI.
	•	Test data is generated dynamically to avoid brittle hardcoded payloads.