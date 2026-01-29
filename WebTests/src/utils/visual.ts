import { expect, type Page } from "@playwright/test";

/**
 * Takes a stable screenshot of the inventory list.
 *
 * Why this helper exists:
 * - Visual tests can be flaky if we screenshot too early (before layout/fonts settle).
 * - We centralize the "stabilization" logic here so tests stay clean and readable.
 */
export async function expectInventorySnapshot(
  page: Page,
  snapshotName: string,
): Promise<void> {
  // 1) Make sure the page has at least loaded the DOM.
  // This reduces "half-rendered" screenshots.
  await page.waitForLoadState("domcontentloaded");

  const inventoryList = page.locator(".inventory_list");

  // 2) Ensure the main container is visible (core UI is rendered).
  await expect(inventoryList).toBeVisible({ timeout: 15_000 });

  // 3) Optional but useful: make sure at least one item exists.
  // Prevents capturing an empty state due to timing.
  await expect(page.locator(".inventory_item").first()).toBeVisible();

  // 4) Reduce minor paint/scroll differences before taking snapshot.
  await inventoryList.scrollIntoViewIfNeeded();

  // 5) Snapshot assertion: stores/compares baseline images under *-snapshots folder.
  await expect(inventoryList).toHaveScreenshot(snapshotName, {
    animations: "disabled",
    maxDiffPixelRatio: 0.02,
    timeout: 15_000,
  });
}