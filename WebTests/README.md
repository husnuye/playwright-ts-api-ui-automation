# WebTests — Playwright UI Automation (TypeScript)

UI test automation project built with **Playwright Test + TypeScript** using **POM (Page Object Model)**.  
It covers:

- **E2E checkout flow** with `standard_user`
- **Visual comparison** between `standard_user` and `visual_user` using Playwright snapshot testing

---

## 1) ✅ What is covered (Scope)

### 1.1) Standard E2E — Checkout (most expensive item)

Flow:

1. Login as `standard_user`
2. Sort products by **Price (high → low)**
3. Add the most expensive product to cart
4. Checkout
5. Verify **“Thank you for your order”**

### 1.2) Visual Testing — standard_user vs visual_user

Flow:

1. Login as `standard_user` → capture inventory snapshot (baseline)
2. Login as `visual_user` → capture inventory snapshot
3. Compare snapshots with `toHaveScreenshot()`

---

## 2) 🎥 Demo Videos (MP4)

Mac-friendly demo recordings are located under:

- `../reports/demo-videos/standard.mp4`
- `../reports/demo-videos/visual.mp4`

> Playwright records `.webm` by default (under `test-results/`). MP4 copies are included for easier playback.

---

## 3) 🧰 Tech Stack

- TypeScript + Playwright Test Runner
- POM (Page Object Model)
- Visual assertions: `expect(page|locator).toHaveScreenshot()`

---

## 4) 📂 Project Structure

```text
WebTests/
├─ src/
│  ├─ pages/         # POM pages (Login, Inventory, Cart, Checkout...)
│  └─ utils/         # helpers (e.g., visual snapshot helper)
├─ tests/
│  └─ specs/
│     ├─ saucedemo.standard.spec.ts
│     └─ saucedemo.visual.spec.ts
├─ playwright.config.ts
├─ tsconfig.json
└─ package.json

## 5) 🔧 Setup

Requirements
	•	Node.js (20+ recommended)
	•	npm

Install

cd WebTests
npm ci
npx playwright install

## 6) ▶️ Run

Run all tests

npm test

Run headed (useful for demos / debugging)

npx playwright test --headed

Open HTML report

npm run report

## 7) 🖼️ Visual Testing (Snapshots)

Snapshot tests may fail if:
	•	browser window size changes
	•	fonts/rendering differs
	•	snapshots are outdated after UI changes

Update snapshots (only when expected)

npx playwright test tests/specs/saucedemo.visual.spec.ts --update-snapshots

## 8) ⚙️ Configuration (Environment Variables)

Defaults exist in config/tests, but can be overridden:
	•	SAUCE_BASE_URL (default: https://www.saucedemo.com)
	•	SAUCE_STANDARD_USER (default: standard_user)
	•	SAUCE_VISUAL_USER (default: visual_user)
	•	SAUCE_PASSWORD (default: secret_sauce)

Example:

SAUCE_BASE_URL="https://www.saucedemo.com" npm test

## 9) 🧪 Evidence & Debugging

Configured in playwright.config.ts:
	•	trace: retain-on-failure
	•	screenshot: only-on-failure
	•	video: retain-on-failure

Artifacts:
	•	test-results/ (videos, traces, screenshots on failure; diff images for visual tests)
	•	playwright-report/ (HTML report)

## 10) Troubleshooting

Visual test fails with small pixel diff
	•	Run headed once to stabilize rendering:

    npx playwright test --headed

    •	If UI is expected to change, update snapshots intentionally:
    npx playwright test tests/specs/saucedemo.visual.spec.ts --update-snapshots


Want demo recordings
	•	Run headed:
    npx playwright test --headed

    	•	Copy the generated .webm videos from test-results/ and convert to .mp4 (optional).

⸻

## 11) Notes (Principal QA mindset)
	•	Keep E2E flow high-signal and stable (minimal assertions, maximum confidence).
	•	Visual testing is useful for detecting unintended UI regressions, but needs controlled baselines.
	•	Always keep trace/video on failures for fast triage.
```
