# ApiTests — Playwright API Automation (TypeScript)

API test automation project built with **Playwright Test + TypeScript**.  
Scope covers the full Restful Booker booking lifecycle:

**Auth → Create (dynamic data) → Get (JSON Schema + type validation) → Update (token) → Delete**

---

## 1) 📖 What is covered

### ✅ Lifecycle test (happy path + cleanup)
- Auth: generate token
- Create: **dynamic payload** (no hardcoded names/dates/prices)
- Get: validate response using:
  - HTTP status assertions
  - **JSON Schema validation (AJV)** including **data types**
- Update: requires token
- Delete: cleanup (best-effort in `finally`)

---

## 2) 🧰 Tech Stack
- TypeScript + Playwright Test Runner
- AJV (JSON Schema validation)
- Factory-based dynamic test data generation

---

## 3) 📂 Project Structure
```text
ApiTests/
├─ src/
│  ├─ client/        # BookerClient (API wrapper)
│  ├─ config/        # env/config helpers
│  ├─ factories/     # dynamic payload builders
│  └─ utils/         # schema validation helpers
├─ tests/
│  ├─ specs/         # test specs (Playwright)
│  └─ schemas/       # JSON schemas used in validations
├─ playwright.config.ts
├─ tsconfig.json
└─ package.json

## 4) 🔧 Setup

Requirements
	•	Node.js (20+ recommended)
	•	npm

Install

cd ApiTests
npm ci
npx playwright install

## 5) ▶️ Run

Run all tests
npm test

List tests
npx playwright test --list

Open HTML report
npm run report

## 6) ⚙️ Configuration (Environment Variables)

Defaults are set inside the test, but you can override via env vars:
	•	BOOKER_BASE_URL (default: https://restful-booker.herokuapp.com)
	•	BOOKER_USERNAME (default: admin)
	•	BOOKER_PASSWORD (default: password123)

Example:

BOOKER_BASE_URL="https://restful-booker.herokuapp.com" npm test

## 7) 🧪 Evidence & Debugging

Configured in playwright.config.ts:
	•	trace: retain-on-failure
	•	screenshot: only-on-failure
	•	video: retain-on-failure

Artifacts:
	•	test-results/ (traces, screenshots, videos on failures)
	•	playwright-report/ (HTML report)

⸻

## 8) Notes (Principal QA mindset)
	•	Keep tests data-independent: generate payloads dynamically, avoid brittle hardcoding.
	•	Validate contract not only values: schema + type validation prevents silent breaking changes.
	•	Ensure cleanup in finally to reduce test pollution and flakiness.