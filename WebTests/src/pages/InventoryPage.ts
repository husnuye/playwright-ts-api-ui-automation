import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class InventoryPage {
  constructor(private readonly page: Page) {}

  async assertOnPage() {
    await expect(this.page).toHaveURL(/inventory\.html/);
  }

  async addMostExpensiveItemToCart(): Promise<{ name: string; price: number }> {
    const items = this.page.locator(".inventory_item");
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    let maxPrice = -1;
    let maxIndex = 0;
    let maxName = "";

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const name = (
        await item.locator(".inventory_item_name").innerText()
      ).trim();
      const priceText = (
        await item.locator(".inventory_item_price").innerText()
      ).trim(); // "$29.99"
      const price = Number(priceText.replace("$", ""));
      if (price > maxPrice) {
        maxPrice = price;
        maxIndex = i;
        maxName = name;
      }
    }

    await items.nth(maxIndex).locator('button:has-text("Add to cart")').click();
    return { name: maxName, price: maxPrice };
  }

  async goToCart() {
    await this.page.locator(".shopping_cart_link").click();
  }
}
