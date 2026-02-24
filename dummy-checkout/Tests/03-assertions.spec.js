// =====================================================
// LESSON 3: Assertions (Checking / Verifying Things)
// =====================================================
// What you'll learn:
//   - toBeVisible()     → Element is visible on screen
//   - toBeHidden()      → Element is NOT visible
//   - toHaveText()      → Element has exact text
//   - toContainText()   → Element contains some text
//   - toHaveCount()     → Number of matching elements
//   - toHaveAttribute() → Element has a specific attribute
//   - toBeEnabled()     → Button/input is enabled
//   - not               → Negate any assertion
// =====================================================
// Run: npx playwright test 03-assertions --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('All types of assertions', () => {

  test('toBeVisible - check element is on screen', async ({ page }) => {
    await page.goto('/');

    // This PASSES if the element exists AND is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.cart-link')).toBeVisible();
  });

  test('toBeHidden - check element is NOT visible', async ({ page }) => {
    await page.goto('/');

    // This PASSES if the element does NOT exist or is hidden
    await expect(page.locator('#nonExistent')).toBeHidden();
  });

  test('toHaveText - check exact text content', async ({ page }) => {
    await page.goto('/Cart.html');

    const heading = page.locator('h1');
    // toHaveText checks the FULL text of the element
    await expect(heading).toHaveText('Your Cart');
  });

  test('toContainText - check partial text', async ({ page }) => {
    await page.goto('/');

    const heading = page.locator('h1');
    // toContainText checks if text INCLUDES the given string
    await expect(heading).toContainText('Dummy');
    await expect(heading).toContainText('Store');
  });

  test('toHaveCount - check number of elements', async ({ page }) => {
    await page.goto('/');

    // There should be 3 product cards
    await expect(page.locator('.product-card')).toHaveCount(3);

    // There should be 3 "Add to Cart" buttons
    await expect(page.getByRole('button', { name: 'Add to Cart' })).toHaveCount(3);
  });

  test('toHaveAttribute - check HTML attributes', async ({ page }) => {
    await page.goto('/');

    // Check that the cart link has the correct href
    const cartLink = page.locator('.cart-link');
    await expect(cartLink).toHaveAttribute('href', 'cart.html');
  });

  test('toBeEnabled - check button is clickable', async ({ page }) => {
    await page.goto('/checkout.html');

    // The submit button should be enabled
    const submitBtn = page.getByRole('button', { name: 'Place Order' });
    await expect(submitBtn).toBeEnabled();
  });

  test('NOT assertions - negate any check', async ({ page }) => {
    await page.goto('/');

    // Use .not to flip any assertion
    // "heading should NOT contain text 'Hello'"
    await expect(page.locator('h1')).not.toHaveText('Hello');

    // "there should NOT be 5 product cards"
    await expect(page.locator('.product-card')).not.toHaveCount(5);
  });

  test('multiple assertions in one test', async ({ page }) => {
    await page.goto('/');

    // You can (and should) have multiple assertions per test
    // This verifies the entire homepage structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.product-card')).toHaveCount(3);
    await expect(page.getByText('$100')).toBeVisible();
    await expect(page.getByText('$200')).toBeVisible();
    await expect(page.getByText('$150')).toBeVisible();
    await expect(page.locator('.cart-link')).toBeVisible();
  });
});
