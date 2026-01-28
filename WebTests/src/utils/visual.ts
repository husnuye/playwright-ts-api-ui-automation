import { expect, type Page } from "@playwright/test";

export async function expectInventorySnapshot(
  page: Page,
  snapshotName: string,
): Promise<void> {
  const inventoryList = page.locator(".inventory_list");

  await expect(inventoryList).toBeVisible({ timeout: 15_000 });

  // Reduce small jitter/paint differences before taking snapshot
  await inventoryList.scrollIntoViewIfNeeded();

  await expect(inventoryList).toHaveScreenshot(snapshotName, {
    animations: "disabled",
    maxDiffPixelRatio: 0.02,
    timeout: 15_000,
  });
}
