import { test, expect } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage";
import { expectInventorySnapshot } from "../../src/utils/visual";

test("visual comparison: standard_user vs visual_user (inventory)", async ({
  page,
}) => {
  const password = process.env.SAUCE_PASSWORD ?? "secret_sauce";
  const standardUser = process.env.SAUCE_STANDARD_USER ?? "standard_user";
  const visualUser = process.env.SAUCE_VISUAL_USER ?? "visual_user";

  await test.step("Baseline snapshot (standard_user)", async () => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login(standardUser, password);
    await login.assertLoggedIn();

    // Direct assertion in the test file (keeps eslint happy + clarity for readers)
    await expect(page.locator(".inventory_list")).toBeVisible();

    // Visual baseline snapshot for standard_user inventory screen
    await expectInventorySnapshot(page, "inventory-standard.png");
  });

  await test.step("Reset session (fresh login)", async () => {
    // Ensure next login starts clean (no auth/session leftovers)
    await page.context().clearCookies();
    await page.context().clearPermissions();
    await page.goto("about:blank");
  });

  await test.step("Visual snapshot (visual_user) and compare with expected", async () => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login(visualUser, password);
    await login.assertLoggedIn();

    // Direct assertion in the test file
    await expect(page.locator(".inventory_list")).toBeVisible();

    // Snapshot for visual_user inventory screen
    await expectInventorySnapshot(page, "inventory-visual.png");
  });
});
