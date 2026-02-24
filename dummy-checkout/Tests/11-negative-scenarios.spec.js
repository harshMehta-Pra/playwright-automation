// =====================================================
// NEGATIVE SCENARIOS - Testing things that should FAIL
// =====================================================
// Run: npx playwright test 11-negative --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Negative Checkout Scenarios', () => {

  // ---- SCENARIO 1: Submit form with ALL fields empty ----
  test('should NOT submit checkout form with empty fields', async ({ page }) => {
    await page.goto('/checkout.html');

    // Try to click "Place Order" without filling anything
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Form has required fields, so we should STILL be on checkout page (not redirected)
    await expect(page).toHaveURL(/checkout/);
    // Should NOT reach success page
    await expect(page.getByText('Order Confirmed')).not.toBeVisible();
  });

  // ---- SCENARIO 2: Submit form with only name filled ----
  test('should NOT submit with only name filled', async ({ page }) => {
    await page.goto('/checkout.html');

    await page.locator('#name').fill('John Doe');
    // Leave email and address empty

    await page.getByRole('button', { name: 'Place Order' }).click();

    // Should still be on checkout page
    await expect(page).toHaveURL(/checkout/);
    await expect(page.getByText('Order Confirmed')).not.toBeVisible();
  });

  // ---- SCENARIO 3: Submit form with invalid email ----
  test('should NOT submit with invalid email format', async ({ page }) => {
    await page.goto('/checkout.html');

    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('not-an-email');  // invalid email
    await page.locator('#phone').fill('5551234567');
    await page.locator('#address').fill('123 Street');
    await page.locator('#city').fill('New York');
    await page.locator('#state').fill('NY');
    await page.locator('#zip').fill('10001');
    await page.locator('#cardName').fill('John Doe');
    await page.locator('#cardNumber').fill('4111 1111 1111 1111');
    await page.locator('#expiry').fill('12/28');
    await page.locator('#cvv').fill('123');

    await page.getByRole('button', { name: 'Place Order' }).click();

    // Custom JS validation should block submission (invalid email)
    await expect(page).toHaveURL(/checkout/);
    await expect(page.getByText('Order Confirmed')).not.toBeVisible();
  });

  // ---- SCENARIO 4: Submit form with missing email ----
  test('should NOT submit with email missing', async ({ page }) => {
    await page.goto('/checkout.html');

    await page.locator('#name').fill('John Doe');
    // Skip email
    await page.locator('#address').fill('123 Street');

    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page).toHaveURL(/checkout/);
    await expect(page.getByText('Order Confirmed')).not.toBeVisible();
  });

  // ---- SCENARIO 5: Submit form with missing address ----
  test('should NOT submit with address missing', async ({ page }) => {
    await page.goto('/checkout.html');

    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('john@test.com');
    // Skip address

    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page).toHaveURL(/checkout/);
    await expect(page.getByText('Order Confirmed')).not.toBeVisible();
  });

  // ---- SCENARIO 6: Checkout with empty cart ----
  test('should be able to reach checkout even with empty cart', async ({ page }) => {
    await page.goto('/');

    // Clear any existing cart
    await page.evaluate(() => localStorage.clear());

    // Go to cart page
    await page.goto('/Cart.html');

    // Cart should show $0 total
    await expect(page.locator('#totalAmount')).toHaveText('Total: $0');

    // Can still click "Proceed to Checkout" (no guard on the app)
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await expect(page).toHaveURL(/checkout/);
  });

  // ---- SCENARIO 7: Remove all items one by one, verify cart is empty ----
  test('cart should show $0 after removing all items', async ({ page }) => {
    await page.goto('/');

    // Pre-fill cart with 3 items
    await page.evaluate(() => {
      const cart = [
        { name: 'Headphones', price: 100 },
        { name: 'Smart Watch', price: 200 },
        { name: 'Speaker', price: 150 },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    await page.goto('/Cart.html');

    // Verify all 3 items are there
    await expect(page.getByText('Total: $450')).toBeVisible();

    // Remove items one by one (always click first Remove button)
    await page.getByRole('button', { name: 'Remove' }).first().click();
    await expect(page.getByText('Total: $350')).toBeVisible();

    await page.getByRole('button', { name: 'Remove' }).first().click();
    await expect(page.getByText('Total: $150')).toBeVisible();

    await page.getByRole('button', { name: 'Remove' }).first().click();
    await expect(page.getByText('Total: $0')).toBeVisible();

    // No more Remove buttons should exist
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(0);
  });

  // ---- SCENARIO 8: Add same product multiple times ----
  test('adding same product twice should show it twice in cart', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async (d) => await d.accept());

    // Add Headphones TWICE
    await page.locator('.product-card').first().getByRole('button').click();
    await page.locator('.product-card').first().getByRole('button').click();

    // Go to cart
    await page.goto('/Cart.html');

    // Should see total $200 (Headphones $100 x 2)
    await expect(page.getByText('Total: $200')).toBeVisible();

    // Should have 2 Remove buttons (one per item)
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(2);
  });

  // ---- SCENARIO 9: Fill form, clear fields, then try to submit ----
  test('should NOT submit after filling and then clearing all fields', async ({ page }) => {
    await page.goto('/checkout.html');

    // Fill all fields
    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('john@test.com');
    await page.locator('#address').fill('123 Street');

    // Now clear all fields
    await page.locator('#name').clear();
    await page.locator('#email').clear();
    await page.locator('#address').clear();

    // Try to submit
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Should NOT go to success page
    await expect(page).toHaveURL(/checkout/);
    await expect(page.getByText('Order Confirmed')).not.toBeVisible();
  });

  // ---- SCENARIO 10: Navigate directly to success page (skip checkout) ----
  test('success page is accessible directly without checkout', async ({ page }) => {
    // Go directly to success page (no actual order placed)
    await page.goto('/success.html');

    // Page loads — this is a potential issue (no order guard)
    await expect(page.getByText('Order Confirmed')).toBeVisible();

    // NOTE: This is a real bug/gap in the app — success page has no
    // protection to check if an order was actually placed!
  });
});
