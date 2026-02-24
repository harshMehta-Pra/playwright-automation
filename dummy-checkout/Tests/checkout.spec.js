const { test, expect } = require('@playwright/test');

test.describe('Dummy Store Checkout Flow', () => {

  test('User should complete checkout successfully', async ({ page }) => {

    // Open app
    await page.goto('http://127.0.0.1:8080');

    // Add first product
    await page.locator('button:has-text("Add to Cart")').first().click();

    // Go to cart
    await page.locator('a.cart-link').click();

    // Proceed to checkout
    await page.locator('text=Proceed to Checkout').first().click();

    // Fill checkout form - Shipping
    await page.fill('#name', 'John Tester');
    await page.fill('#email', 'john@test.com');
    await page.fill('#phone', '5551234567');
    await page.fill('#address', 'Automation City');
    await page.fill('#city', 'New York');
    await page.fill('#state', 'NY');
    await page.fill('#zip', '10001');

    // Fill checkout form - Payment
    await page.fill('#cardName', 'John Tester');
    await page.fill('#cardNumber', '4111 1111 1111 1111');
    await page.fill('#expiry', '12/28');
    await page.fill('#cvv', '123');

    // Place order
    await page.locator('text=Place Order').click();

    // Validate success page
    await expect(page.locator('text=Order Confirmed!')).toBeVisible();

  });

});