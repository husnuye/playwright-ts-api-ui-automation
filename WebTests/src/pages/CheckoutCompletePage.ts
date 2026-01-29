import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * CheckoutCompletePage (POM)
 *
 * Purpose:
 * - Represents the "order complete" screen in SauceDemo.
 * - Centralizes final-step assertions so tests stay clean and readable.
 *
 * Why we assert URL + text:
 * - URL check confirms navigation reached the correct page.
 * - Header text check confirms the expected success message is visible to the user.
 */
export class CheckoutCompletePage {
  constructor(private readonly page: Page) {}

  /**
   * Verifies the checkout completed successfully.
   * This is the primary "business assertion" for the checkout flow.
   */
  async assertThankYouMessage(): Promise<void> {
    // Guard 1: ensure we are on the correct page
    await expect(this.page).toHaveURL(/checkout-complete\.html/);

    // Guard 2: ensure success message is correct and visible
    await expect(this.page.locator(".complete-header")).toHaveText(
      "Thank you for your order!",
    );
  }
}