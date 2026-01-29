import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * CheckoutPage (POM)
 *
 * Purpose:
 * - Encapsulates interactions for SauceDemo checkout steps:
 *   - Step 1: customer information form
 *   - Step 2: overview + finish
 *
 * Why this exists:
 * - Tests should read like a business flow.
 * - Locators and page-specific guards (URL checks) live here, not in the test.
 */
export class CheckoutPage {
  constructor(private readonly page: Page) {}

  /**
   * Fills out checkout customer info and proceeds to step 2.
   *
   * Guards:
   * - URL assertion ensures we're on step-one before interacting with inputs.
   */
  async fillCustomerInfo(first: string, last: string, zip: string): Promise<void> {
    // Ensure we are on checkout step 1 (prevents "wrong page" flaky failures)
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);

    // Fill form fields (data-test selectors are stable and preferred)
    await this.page.locator('[data-test="firstName"]').fill(first);
    await this.page.locator('[data-test="lastName"]').fill(last);
    await this.page.locator('[data-test="postalCode"]').fill(zip);

    // Continue to step two
    await this.page.locator('[data-test="continue"]').click();
  }

  /**
   * Completes checkout from the overview page.
   *
   * Guards:
   * - URL assertion ensures we're on step-two before clicking Finish.
   */
  async finish(): Promise<void> {
    // Ensure we are on checkout step 2 (overview)
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);

    // Finish the purchase
    await this.page.locator('[data-test="finish"]').click();
  }
}