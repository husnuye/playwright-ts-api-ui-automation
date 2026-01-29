

# Playwright (TypeScript) — API + Web UI Test Automation (Isolated Projects)

This repository is prepared for an **AI-augmented QA engineering case** and contains **two isolated Playwright + TypeScript projects** under a single repo:

- `ApiTests/` (API automation)
- `WebTests/` (UI automation)

> **Isolation goal:** each project has its own `package.json`, dependencies, configs and reports (no shared code).

---

## 1) ✅ What is covered (Scope)

### 1.1 ApiTests — Restful Booker API
Implements the full lifecycle:

**Auth → Create (dynamic data) → Get (JSON Schema + type validation) → Update (token) → Delete**

AI tasks covered:
- **Dynamic test data** for Create (no hardcoded payloads)
- **JSON Schema validation** for Get (validates structure + data types)

### 1.2 WebTests — SauceDemo UI (POM + Visual Testing)
- `standard_user`: login → sort by price desc → add most expensive item → checkout → verify **“Thank you for your order”**
- `visual_user`: **visual comparison** of inventory/home screen vs `standard_user` using Playwright snapshot testing

---

## 2) 🧰 Tech Stack
- **TypeScript + Playwright Test Runner**
- **AJV** (JSON Schema validation)
- Dynamic data generation (factory approach; optionally Faker)
- UI: **POM (Page Object Model)** + `toHaveScreenshot()` visual assertions
- **ESLint + Prettier** (WebTests) for clean, consistent code style

---

## 3) 📦 Deliverables (Case Submission)
- `prompts/prompts.md` — AI prompts log (what was asked / generated / refined)
- `reports/Test-Strategy-Analysis.pdf` — Part 3 final report (Test Strategy & Scenario Mining)
- `reports/Part3-Scenario-Mining.md` — markdown working notes
- `reports/demo-videos/standard.mp4`, `reports/demo-videos/visual.mp4` — demo recordings (MP4)

---

## 4) 🎥 Demo Videos (MP4)

## Visual Testing (Snapshots)

This project uses Playwright `toHaveScreenshot()` for visual regression.

**Important note about baselines:**
Playwright snapshots are OS-dependent (fonts/rendering differ on macOS vs Linux).
That’s why you may see separate baseline files such as:
- `*-chromium-darwin.png` (macOS)
- `*-chromium-linux.png` (GitHub Actions / Docker)

✅ This is expected and intentional: it prevents flaky CI failures due to OS rendering differences.

---

## 5) ▶️ Run Locally

### Requirements
- Node.js (20+ recommended)
- npm

### API
```bash
cd ApiTests
cp .env.example .env
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

Visual tests use OS-specific baselines. Linux baselines are included for CI runs.

⸻
## 9) Notes (Principal QA mindset)
		Focuses on high-signal coverage: API lifecycle + UI critical flow + visual regression check.
	•	Uses dynamic test data to reduce brittleness.
	•	Uses schema validation to verify response contracts (structure/types), not just status codes.

    