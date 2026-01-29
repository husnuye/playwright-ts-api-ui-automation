# AI Prompts Log (Case Audit)

> Purpose: Show how AI was used as an accelerator while keeping engineering ownership via review, refactor, and validation.
> Output expectation: I did not copy/paste blindly — I ran, broke, fixed, stabilized, and documented trade-offs.

---

## 1) API Lifecycle (Restful Booker) — Playwright TS
**Prompt**
- "Generate a Playwright TypeScript API test for Restful Booker to cover Auth → Create → Get → Update → Delete. Use good practices and cleanup."

**AI Output Summary**
- Proposed an end-to-end lifecycle flow, token handling, and basic assertions.

**My Audit / Improvements (Engineering Ownership)**
- **Separated responsibilities**:
  - `BookerClient` = request mechanics (baseURL, headers, token cookie)
  - `*.spec.ts` = business flow + assertions
- **Added best-effort cleanup** in `finally`:
  - Ensures we don't leave test data behind if the test fails mid-way.
- **Upgraded assertions**:
  - HTTP-level checks (status)
  - Contract checks (schema validation)
  - Data integrity checks (created vs retrieved fields match)
- **Validated by execution**:
  - `npm test` locally to confirm lifecycle works end-to-end
  - `npm run report` for evidence when needed

---

## 2) Reliability Fix — Safe response parsing (JSON vs plain text)
**Prompt**
- "Sometimes the test crashes with `Unexpected token 'N' (Not Found)`. Fix BookerClient parsing safely."

**AI Output Summary**
- Suggested guarding `res.json()` calls.

**My Audit / Improvements**
- Implemented `readJsonOrText()`:
  - Checks `content-type` header
  - Parses JSON only when appropriate
  - Falls back to `.text()` for non-JSON (prevents flaky crashes)
- **Why this is important**:
  - Converts "random infra response" into a deterministic failure with readable debug info.
- **Validation**:
  - Re-ran API test after adding guard; failure disappeared and error messaging became clearer.

---

## 3) JSON Schema Validation (AJV)
**Prompt**
- "Create a JSON schema for the booking GET response and validate it in tests using AJV."

**AI Output Summary**
- Drafted a schema with required fields and types.

**My Audit / Improvements**
- Ensured required fields exist:
  - `firstname`, `lastname`, `totalprice`, `depositpaid`
  - `bookingdates.checkin`, `bookingdates.checkout`
- Kept schema **strict on types** but not brittle on extra fields:
  - Prevents breaking if API adds new fields.
- Added readable assertion messages:
  - On schema failure, prints AJV errors (makes failures actionable).

---

## 4) UI Automation (Sauce Demo) — POM + Critical Path
**Prompt**
- "Build Playwright TS UI automation for SauceDemo using POM. Cover login and checkout flow."

**AI Output Summary**
- Suggested Page Object Model separation and a checkout flow.

**My Audit / Improvements**
- Implemented **deterministic selection**:
  - Programmatically chooses the *most expensive item* (no fragile hardcoded product).
- Used **stable selectors**:
  - Prefer `[data-test="..."]` where available.
- Added **robust assertions**:
  - URL assertions at key steps
  - “Thank you for your order!” verification
  - Also added a direct `expect(...)` in spec to satisfy `playwright/expect-expect` lint rule.
- Improved readability using `test.step(...)`:
  - Specs read like a business flow; details live in Page Objects.

---

## 5) Visual Regression — standard_user vs visual_user (Snapshots)
**Prompt**
- "Add visual comparison test in Playwright using toHaveScreenshot."

**AI Output Summary**
- Proposed screenshot baseline/compare workflow.

**My Audit / Improvements**
- Stabilized visuals:
  - Snapshot only `.inventory_list` (reduce noise)
  - Disable animations
  - `scrollIntoViewIfNeeded()` before screenshot
- **CI reality**: OS differences matter
  - macOS baselines: `*-chromium-darwin.png`
  - Linux CI baselines: `*-chromium-linux.png`
- Generated Linux baselines using Playwright Docker image:
  - `mcr.microsoft.com/playwright:v1.58.0-jammy`
- Result: CI no longer fails due to missing Linux snapshots.

---

## 6) Tooling & CI hardening (ESLint v9 + Workflows)
**Prompt**
- "Lint fails because ESLint v9 expects eslint.config.js. Fix lint/format setup."

**AI Output Summary**
- Suggested migrating to `eslint.config.*`.

**My Audit / Improvements**
- Added `eslint.config.cjs` (ESLint v9 flat config)
- Added npm scripts:
  - `lint`, `format`, `format:check`, `report`
- Moved workflows into standard path:
  - `.github/workflows/api-tests.yml`
  - `.github/workflows/web-tests.yml`
- Validation:
  - `npm run lint` / `npm run format`
  - GitHub Actions runs tests and uploads artifacts.

---

## 7) Evidence & Debugging (Engineer-friendly defaults)
**Prompt**
- "Make failures debuggable with trace/video/screenshots."

**AI Output Summary**
- Suggested enabling trace/video/screenshots.

**My Audit / Improvements**
- Kept evidence on failure to support fast triage:
  - trace: `retain-on-failure`
  - screenshot: `only-on-failure`
  - video: `retain-on-failure`
- Ensured CI uploads artifacts (HTML report + test-results).

---

## 8) Summary (Why this demonstrates engineering ownership)
- AI was used to accelerate scaffolding, but I:
  - fixed real runtime failures (JSON parse)
  - resolved CI-specific issues (Linux baselines)
  - migrated tooling to modern ESLint v9 config
  - verified everything by running locally + in CI
  - documented trade-offs (OS dependent snapshots)