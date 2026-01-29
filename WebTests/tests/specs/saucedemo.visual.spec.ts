import { test, expect } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage";
import { expectInventorySnapshot } from "../../src/utils/visual";

/**
 * Visual regression test (inventory page):
 * - Take a baseline snapshot as `standard_user`
 * - Take a snapshot as `visual_user`
 * - Both snapshots are stored as Playwright baselines and compared on CI runs
 *
 * Why this is useful:
 * - `visual_user` is designed to have UI differences vs `standard_user`.
 * - This test demonstrates a professional visual testing approach with stable,
 *   scoped screenshots and clear session isolation.
 *
 * Notes for juniors:
 * - Playwright snapshot tests fail on CI if the expected baseline image is missing.
 * - That’s normal the first time. You create baselines with:
 *   `npx playwright test --update-snapshots`
 * - Linux CI needs Linux baselines (you already added `*-linux.png`).
 */
test("visual comparison: standard_user vs visual_user (inventory)", async ({
  page,
}) => {
  /**
   * Credentials are env-configurable for CI/local.
   * Defaults match SauceDemo public demo credentials.
   */
  const password = process.env.SAUCE_PASSWORD ?? "secret_sauce";
  const standardUser = process.env.SAUCE_STANDARD_USER ?? "standard_user";
  const visualUser = process.env.SAUCE_VISUAL_USER ?? "visual_user";

  await test.step("Baseline snapshot (standard_user)", async () => {
    const login = new LoginPage(page);

    // 1) Login
    await login.goto();
    await login.login(standardUser, password);
    await login.assertLoggedIn();

    /**
     * Direct assertion in the spec:
     * - Helps readability (the page is in the expected state)
     * - Satisfies `playwright/expect-expect` lint rule
     */
    await expect(page.locator(".inventory_list")).toBeVisible();

    /**
     * Visual baseline snapshot for `standard_user`.
     * We intentionally snapshot a stable container element instead of full page,
     * to reduce noise from headers/footers/browser UI.
     */
    await expectInventorySnapshot(page, "inventory-standard.png");
  });

  await test.step("Reset session (fresh login)", async () => {
    /**
     * Session isolation:
     * - Visual tests should not leak auth state between users.
     * - Clearing cookies makes sure next login starts clean.
     */
    const ctx = page.context();
    await ctx.clearCookies();
    await ctx.clearPermissions();

    // Optional: reset navigation state
    await page.goto("about:blank");
  });

  await test.step(
    "Visual snapshot (visual_user) and compare with expected",
    async () => {
      const login = new LoginPage(page);

      // 2) Login with a different user
      await login.goto();
      await login.login(visualUser, password);
      await login.assertLoggedIn();

      // Direct assertion in the spec again (readability + lint)
      await expect(page.locator(".inventory_list")).toBeVisible();

      /**
       * Snapshot for `visual_user`.
       * This should differ from standard_user if the app intentionally changes visuals.
       */
      await expectInventorySnapshot(page, "inventory-visual.png");
    },
  );
});