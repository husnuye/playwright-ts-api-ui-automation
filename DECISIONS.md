# Engineering Decisions (AI-audited)

## Why two isolated projects?
- Avoid dependency/config coupling between API and UI suites.
- Each suite is independently runnable, debuggable, and CI-friendly.

## Why POM / Client objects?
- UI: selectors and actions are centralized; specs stay readable.
- API: request mechanics (token, parsing, headers) are hidden from the test.

## Why schema validation?
- Checks contract (types/structure), not only values.
- Prevents silent breaking changes.

## Why safe JSON parsing?
- Real APIs may return text/html in errors; test should fail gracefully with context.

## Why OS-specific visual baselines?
- Rendering differs across OS. Separate baselines prevent CI flakiness.

## Evidence policy
- Keep reports/trace/video on failure in CI as artifacts.
- Do not commit generated `test-results/` and `playwright-report/` folders.