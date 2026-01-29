import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * InventoryPage (POM)
 *
 * Purpose:
 * - Encapsulates interactions on SauceDemo inventory (product listing) page.
 *
 * Design notes (senior-level intent, junior-friendly):
 * - Tests should not “hunt for selectors” or implement business logic inline.
 * - This class keeps the “how” (locators, parsing) separate from the “what” (test flow).
 */
export class InventoryPage {
  constructor(private readonly page: Page) {}

  /**
   * Guard to ensure we are on the inventory page.
   * This reduces flakiness by failing early if navigation/login didn't complete.
   */
  async assertOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  /**
   * Finds the most expensive inventory item and adds it to the cart.
   *
   * Why we do it this way:
   * - "Most expensive" is business logic derived from the UI, not a hardcoded product name.
   * - Makes the test resilient if the product list changes order or names.
   *
   * Returns:
   * - { name, price } so the test can assert the correct item is in the cart.
   */
  async addMostExpensiveItemToCart(): Promise<{ name: string; price: number }> {
    const items = this.page.locator(".inventory_item");
    const count = await items.count();

    // Sanity check: inventory should not be empty
    expect(count).toBeGreaterThan(0);

    let maxPrice = -1;
    let maxIndex = 0;
    let maxName = "";

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);

      // Read product name
      const name = (await item.locator(".inventory_item_name").innerText()).trim();

      // Read product price (e.g. "$29.99") and parse to number
      const priceText = (await item.locator(".inventory_item_price").innerText()).trim();
      const price = Number(priceText.replace("$", ""));

      // Track the most expensive item found so far
      if (price > maxPrice) {
        maxPrice = price;
        maxIndex = i;
        maxName = name;
      }
    }

    // Click "Add to cart" for the selected item
    await items.nth(maxIndex).locator('button:has-text("Add to cart")').click();

    return { name: maxName, price: maxPrice };
  }

  /**
   * Navigates to the cart page via the cart icon.
   */
  async goToCart(): Promise<void> {
    await this.page.locator(".shopping_cart_link").click();
  }
}