// =====================================================
// LESSON 9: Full End-to-End (E2E) Checkout Flow
// =====================================================
// What you'll learn:
//   - Combining ALL previous concepts into real scenarios
//   - Testing a complete user journey
//   - test.step() → Organize test into labeled steps
//   - Testing edge cases (empty cart, etc.)
// =====================================================
// Run: npx playwright test 09-e2e --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Complete E2E Checkout Scenarios', () => {

  test('Scenario 1: Buy a single product', async ({ page }) => {
    page.on('dialog', async (d) => await d.accept());

    await test.step('Step 1: Open homepage', async () => {
      await page.goto('/');
      await expect(page).toHaveTitle('Shop - Dummy Store');
    });

    await test.step('Step 2: Add Headphones to cart', async () => {
      await page.locator('.product-card').first()
        .getByRole('button').click();
    });

    await test.step('Step 3: Go to cart', async () => {
      await page.getByRole('link', { name: 'View Cart' }).click();
      await expect(page).toHaveTitle('Cart');
      await expect(page.getByText('Headphones')).toBeVisible();
      await expect(page.getByText('Total: $100')).toBeVisible();
    });

    await test.step('Step 4: Proceed to checkout', async () => {
      await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
      await expect(page).toHaveURL(/checkout/);
    });

    await test.step('Step 5: Fill checkout form', async () => {
      await page.locator('#name').fill('Alice Johnson');
      await page.locator('#email').fill('alice@test.com');
      await page.locator('#address').fill('789 E2E Boulevard');
    });

    await test.step('Step 6: Place order', async () => {
      await page.getByRole('button', { name: 'Place Order' }).click();
      await expect(page.getByText('Order Confirmed')).toBeVisible();
    });

    await test.step('Step 7: Verify cart is cleared', async () => {
      const cart = await page.evaluate(() =>
        localStorage.getItem('cart')
      );
      expect(cart).toBeNull();
    });
  });

  test('Scenario 2: Buy multiple products', async ({ page }) => {
    page.on('dialog', async (d) => await d.accept());

    await page.goto('/');

    // Add all 3 products
    const addButtons = page.getByRole('button', { name: 'Add to Cart' });
    await addButtons.nth(0).click(); // Headphones $100
    await addButtons.nth(1).click(); // Smart Watch $200
    await addButtons.nth(2).click(); // Speaker $150

    // Go to cart and verify total
    await page.getByRole('link', { name: 'View Cart' }).click();
    await expect(page.getByText('Total: $450')).toBeVisible();

    // Checkout
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.locator('#name').fill('Bob Smith');
    await page.locator('#email').fill('bob@test.com');
    await page.locator('#address').fill('321 Multi Cart Lane');
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });

  test('Scenario 3: Remove item then checkout', async ({ page }) => {
    // Pre-fill cart to save time
    await page.goto('/');
    await page.evaluate(() => {
      const cart = [
        { name: 'Headphones', price: 100 },
        { name: 'Smart Watch', price: 200 },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    await page.goto('/Cart.html');

    // Remove the first item (Headphones)
    await page.getByRole('button', { name: 'Remove' }).first().click();

    // Only Smart Watch should remain
    await expect(page.getByText('Total: $200')).toBeVisible();

    // Complete checkout
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await page.locator('#name').fill('Carol Lee');
    await page.locator('#email').fill('carol@test.com');
    await page.locator('#address').fill('555 Remove Street');
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });

  test('Scenario 4: Navigate back to shop from success page', async ({ page }) => {
    await page.goto('/success.html');

    await expect(page.getByText('Order Confirmed')).toBeVisible();

    // Click "Back to Home"
    await page.getByRole('link', { name: 'Back to Home' }).click();

    // Should be back on homepage
    await expect(page).toHaveTitle('Shop - Dummy Store');
    await expect(page.locator('.product-card')).toHaveCount(3);
  });
});
