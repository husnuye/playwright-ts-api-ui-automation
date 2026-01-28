import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class CartPage {
  constructor(private readonly page: Page) {}

  async assertItemInCart(itemName: string) {
    await expect(this.page.locator(".inventory_item_name")).toContainText(
      itemName,
    );
  }

  async checkout() {
    await this.page.locator('[data-test="checkout"]').click();
  }
}
