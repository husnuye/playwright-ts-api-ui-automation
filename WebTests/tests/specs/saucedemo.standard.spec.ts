import { test, expect } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage";
import { InventoryPage } from "../../src/pages/InventoryPage";
import { CartPage } from "../../src/pages/CartPage";
import { CheckoutPage } from "../../src/pages/CheckoutPage";
import { CheckoutCompletePage } from "../../src/pages/CheckoutCompletePage";

test("standard_user checkout flow (most expensive item)", async ({ page }) => {
  // Credentials are configurable via env; defaults match SauceDemo docs.
  const username = process.env.SAUCE_STANDARD_USER ?? "standard_user";
  const password = process.env.SAUCE_PASSWORD ?? "secret_sauce";

  // Test data (keep simple; could be generated if needed)
  const customer = { firstName: "Test", lastName: "User", zip: "34000" };

  // Page Objects (POM): keeps selectors and UI actions out of the test.
  const login = new LoginPage(page);
  const inventory = new InventoryPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);
  const complete = new CheckoutCompletePage(page);

  await test.step("Login as standard_user", async () => {
    await login.goto();
    await login.login(username, password);
    await login.assertLoggedIn();
  });

  let chosen: { name: string; price?: number };

  await test.step("Sort by price desc and add the most expensive item", async () => {
    await inventory.assertOnPage();
    chosen = await inventory.addMostExpensiveItemToCart();
    await inventory.goToCart();
  });

  await test.step("Verify item is in cart and proceed to checkout", async () => {
    await cart.assertItemInCart(chosen.name);
    await cart.checkout();
  });

  await test.step("Fill customer info and finish checkout", async () => {
    await checkout.fillCustomerInfo(
      customer.firstName,
      customer.lastName,
      customer.zip,
    );
    await checkout.finish();
  });

  await test.step("Assert order completed successfully", async () => {
    // POM assertion (keeps UI details inside the page class)
    await complete.assertThankYouMessage();

    // Direct expect in test file: satisfies eslint (playwright/expect-expect)
    await expect(
      page.getByRole("heading", { name: /thank you for your order/i }),
    ).toBeVisible();
  });
});
