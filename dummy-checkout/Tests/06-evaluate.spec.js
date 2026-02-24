// =====================================================
// LESSON 6: page.evaluate() & localStorage
// =====================================================
// What you'll learn:
//   - page.evaluate()      → Run JavaScript INSIDE the browser
//   - Access localStorage  → Read/write browser storage
//   - Pass data to evaluate → Send values into the browser
//   - Return data          → Get values back from the browser
// =====================================================
// page.evaluate() is your bridge between Node.js (test code)
// and the browser (page code). The function runs INSIDE the
// browser, not in your test.
// =====================================================
// Run: npx playwright test 06-evaluate --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('page.evaluate and localStorage', () => {

  test('run JavaScript inside the browser', async ({ page }) => {
    await page.goto('/');

    // page.evaluate() executes code in the BROWSER context
    const pageTitle = await page.evaluate(() => {
      return document.title; // This runs inside the browser!
    });

    console.log('Page title from browser:', pageTitle);
    expect(pageTitle).toBe('Shop - Dummy Store');
  });

  test('read localStorage', async ({ page }) => {
    await page.goto('/');

    // Handle alert
    page.on('dialog', async (d) => await d.accept());

    // Add item to cart (this saves to localStorage)
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();

    // Now read localStorage from inside the browser
    const cart = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart'));
    });

    console.log('Cart contents:', cart);
    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Headphones');
    expect(cart[0].price).toBe(100);
  });

  test('write to localStorage directly', async ({ page }) => {
    await page.goto('/');

    // Pre-fill the cart by writing to localStorage directly
    // This is useful to skip UI steps and set up test data
    await page.evaluate(() => {
      const fakeCart = [
        { name: 'Test Item 1', price: 50 },
        { name: 'Test Item 2', price: 75 },
      ];
      localStorage.setItem('cart', JSON.stringify(fakeCart));
    });

    // Navigate to cart page to see the items
    await page.goto('/Cart.html');

    // The cart should show our pre-filled items
    await expect(page.getByText('Test Item 1')).toBeVisible();
    await expect(page.getByText('Test Item 2')).toBeVisible();
    await expect(page.getByText('Total: $125')).toBeVisible();
  });

  test('pass data INTO page.evaluate()', async ({ page }) => {
    await page.goto('/');

    // You can pass variables from your test into the browser
    const itemName = 'Custom Product';
    const itemPrice = 999;

    await page.evaluate(({ name, price }) => {
      // name and price are available inside the browser now
      const cart = [{ name, price }];
      localStorage.setItem('cart', JSON.stringify(cart));
    }, { name: itemName, price: itemPrice }); // <-- pass data as second arg

    // Verify it was saved
    const cart = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('cart'));
    });

    expect(cart[0].name).toBe('Custom Product');
    expect(cart[0].price).toBe(999);
  });

  test('clear localStorage between tests', async ({ page }) => {
    await page.goto('/');

    // Clear all localStorage
    await page.evaluate(() => localStorage.clear());

    // Verify it's empty
    const cart = await page.evaluate(() => {
      return localStorage.getItem('cart');
    });

    expect(cart).toBeNull();
  });

  test('count elements using evaluate', async ({ page }) => {
    await page.goto('/');

    // You can run any DOM query inside evaluate
    const buttonCount = await page.evaluate(() => {
      return document.querySelectorAll('button').length;
    });

    console.log('Number of buttons:', buttonCount);
    expect(buttonCount).toBe(3);
  });
});
