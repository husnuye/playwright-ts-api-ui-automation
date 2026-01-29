import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * CartPage (POM)
 *
 * Purpose:
 * - Encapsulates Cart screen interactions and assertions.
 * - Keeps selectors + UI mechanics out of test files.
 *
 * Junior tip:
 * - Tests should read like a user journey.
 * - Page Objects hide the “how” (selectors/clicks) and expose the “what” (actions).
 */
export class CartPage {
  constructor(private readonly page: Page) {}

  /**
   * Asserts that the given item name appears in the cart.
   * We use `toContainText` (not strict equals) to avoid flaky failures due to minor UI formatting.
   */
  async assertItemInCart(itemName: string): Promise<void> {
    const itemNames = this.page.locator(".inventory_item_name");

    // If the UI renders multiple items, this still passes as long as one matches.
    await expect(itemNames).toContainText(itemName);
  }

  /**
   * Proceeds to checkout.
   * Using data-test selectors is a best practice: stable and not tied to CSS/layout.
   */
  async checkout(): Promise<void> {
    await this.page.locator('[data-test="checkout"]').click();
  }
}