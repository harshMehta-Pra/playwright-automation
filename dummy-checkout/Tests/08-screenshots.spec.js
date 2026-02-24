// =====================================================
// LESSON 8: Screenshots & Visual Debugging
// =====================================================
// What you'll learn:
//   - page.screenshot()       → Take full page screenshot
//   - locator.screenshot()    → Screenshot of one element
//   - page.screenshot({path}) → Save to a file
//   - page.screenshot({fullPage}) → Capture entire scrollable page
//   - test.info()             → Attach data to test report
// =====================================================
// Run: npx playwright test 08-screenshots --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Screenshots and visual debugging', () => {

  test('take a full page screenshot', async ({ page }) => {
    await page.goto('/');

    // Save screenshot to a file
    await page.screenshot({ path: 'test-results/homepage.png' });
    console.log('Screenshot saved to test-results/homepage.png');
  });

  test('take a screenshot of a specific element', async ({ page }) => {
    await page.goto('/');

    // Screenshot just the first product card
    const firstCard = page.locator('.product-card').first();
    await firstCard.screenshot({ path: 'test-results/first-product.png' });
    console.log('Element screenshot saved!');
  });

  test('full page screenshot (including scroll)', async ({ page }) => {
    await page.goto('/');

    // fullPage: true captures the ENTIRE page, even parts you'd need to scroll to
    await page.screenshot({
      path: 'test-results/full-page.png',
      fullPage: true,
    });
  });

  test('attach screenshot to test report', async ({ page }) => {
    await page.goto('/');

    // Take screenshot as buffer (not saved to file)
    const screenshot = await page.screenshot();

    // Attach it to the HTML test report
    // You'll see it when you run: npx playwright show-report
    await test.info().attach('homepage-screenshot', {
      body: screenshot,
      contentType: 'image/png',
    });
  });

  test('screenshot on specific state', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async (d) => await d.accept());

    // Screenshot BEFORE action
    await page.screenshot({ path: 'test-results/before-add.png' });

    // Add items to cart
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();

    // Go to cart
    await page.goto('/Cart.html');

    // Pre-fill cart for the screenshot
    await page.evaluate(() => {
      const cart = [{ name: 'Headphones', price: 100 }];
      localStorage.setItem('cart', JSON.stringify(cart));
    });
    await page.reload();

    // Screenshot AFTER action
    await page.screenshot({ path: 'test-results/after-add-cart.png' });
    console.log('Before/After screenshots saved!');
  });
});
