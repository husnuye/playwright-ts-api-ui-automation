import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class CheckoutPage {
  constructor(private readonly page: Page) {}

  async fillCustomerInfo(first: string, last: string, zip: string) {
    await expect(this.page).toHaveURL(/checkout-step-one\.html/);
    await this.page.locator('[data-test="firstName"]').fill(first);
    await this.page.locator('[data-test="lastName"]').fill(last);
    await this.page.locator('[data-test="postalCode"]').fill(zip);
    await this.page.locator('[data-test="continue"]').click();
  }

  async finish() {
    await expect(this.page).toHaveURL(/checkout-step-two\.html/);
    await this.page.locator('[data-test="finish"]').click();
  }
}
