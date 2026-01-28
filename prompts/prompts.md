# AI Prompts Log (Case Audit)

> Purpose: Show how AI was used as an accelerator while keeping engineering ownership via review, refactor and validation.

---

## 1) API Lifecycle (Restful Booker) — Playwright TS
**Prompt**
- "Generate a Playwright TypeScript API test for Restful Booker to cover Auth → Create → Get → Update → Delete. Use good practices and cleanup."

**AI Output Summary**
- Proposed an end-to-end lifecycle flow, token handling, and basic assertions.

**My Audit / Improvements**
- Separated responsibilities: `BookerClient` (HTTP client) vs `*.spec.ts` (test intent).
- Added `finally` cleanup (best-effort delete) to avoid leaving data behind.
- Added schema validation for GET response (contract check).
- Avoided hardcoded create data; generated dynamic payload via factory.
- Added trace/report artifacts for faster debugging.

---

## 2) JSON Schema Validation (AJV)
**Prompt**
- "Create a JSON schema for the booking GET response and validate it in tests using AJV."

**AI Output Summary**
- Drafted a schema with required fields and types.

**My Audit / Improvements**
- Ensured required fields: `firstname`, `lastname`, `totalprice`, `depositpaid`, `bookingdates.checkin`, `bookingdates.checkout`.
- Kept schema strict on types/required but flexible enough to avoid brittle failures if extra fields appear.

---

## 3) UI Automation (Sauce Demo) — POM + Critical Path
**Prompt**
- "Build Playwright TS UI automation for SauceDemo using POM. Cover login and checkout flow."

**AI Output Summary**
- Suggested Page Object Model separation and a checkout flow.

**My Audit / Improvements**
- Implemented deterministic selection: programmatically choose the *most expensive item*.
- Used stable selectors (prefer `data-test` where available).
- Added strong assertions at key steps (URL checks + success message).
- Kept test specs short and intention-revealing by pushing details into POM.

---

## 4) Visual Comparison — standard_user vs visual_user
**Prompt**
- "Add visual comparison test in Playwright using toHaveScreenshot."

**AI Output Summary**
- Proposed screenshot baseline/compare workflow.

**My Audit / Improvements**
- Adopted explicit baseline update step: `--update-snapshots`.
- Ensured inventory is loaded before screenshot to reduce noise.
- Produced clear artifacts on failure (diff image, trace, video) to support fast root cause.