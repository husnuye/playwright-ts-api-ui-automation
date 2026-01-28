import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class CheckoutCompletePage {
  constructor(private readonly page: Page) {}

  async assertThankYouMessage() {
    await expect(this.page).toHaveURL(/checkout-complete\.html/);
    await expect(this.page.locator(".complete-header")).toHaveText(
      "Thank you for your order!",
    );
  }
}
