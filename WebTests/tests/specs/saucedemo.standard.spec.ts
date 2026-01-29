import { test, expect } from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage";
import { InventoryPage } from "../../src/pages/InventoryPage";
import { CartPage } from "../../src/pages/CartPage";
import { CheckoutPage } from "../../src/pages/CheckoutPage";
import { CheckoutCompletePage } from "../../src/pages/CheckoutCompletePage";

/**
 * UI E2E (high-signal) test for SauceDemo:
 * - Login with `standard_user`
 * - Add the most expensive item (dynamic selection to avoid brittle selectors/order)
 * - Complete checkout
 * - Verify the “Thank you for your order!” success state
 *
 * Why this test is valuable:
 * - Covers a real user purchase journey end-to-end.
 * - Uses POM so selectors/actions stay maintainable.
 * - Includes at least one direct `expect` in the spec to satisfy lint rule:
 *   `playwright/expect-expect` (even though POM already asserts internally).
 */
test("standard_user checkout flow (most expensive item)", async ({ page }) => {
  /**
   * Credentials are env-configurable for CI/local.
   * Defaults match SauceDemo public demo credentials.
   */
  const username = process.env.SAUCE_STANDARD_USER ?? "standard_user";
  const password = process.env.SAUCE_PASSWORD ?? "secret_sauce";

  /**
   * Minimal test data:
   * - Keep deterministic values for readability
   * - Could be randomized if the app required uniqueness
   */
  const customer = { firstName: "Test", lastName: "User", zip: "34000" };

  /**
   * Page Objects (POM):
   * - Each class owns its selectors + actions for a single screen
   * - Test reads like a business flow
   */
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

  // We keep chosen item info for later assertions in cart.
  let chosen: { name: string; price: number };

  await test.step("Add the most expensive item to cart", async () => {
    await inventory.assertOnPage();

    /**
     * We pick the most expensive item by reading UI prices at runtime.
     * This makes the test robust against:
     * - product order changes
     * - new products being added
     */
    chosen = await inventory.addMostExpensiveItemToCart();

    // Navigate to cart icon (top right)
    await inventory.goToCart();
  });

  await test.step("Verify cart and start checkout", async () => {
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
    /**
     * POM assertion:
     * - Keeps URL + selector details in the page layer
     * - Makes the test intent clearer
     */
    await complete.assertThankYouMessage();

    /**
     * Direct assertion in the spec:
     * - Satisfies `playwright/expect-expect` lint rule
     * - Also provides a strong, user-visible confirmation
     */
    await expect(
      page.getByRole("heading", { name: /thank you for your order/i }),
    ).toBeVisible();
  });
});