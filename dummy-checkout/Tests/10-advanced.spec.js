// =====================================================
// LESSON 10: Advanced - Waits, Retries & Tags
// =====================================================
// What you'll learn:
//   - page.waitForURL()      → Wait for navigation
//   - page.waitForSelector() → Wait for element to appear
//   - page.waitForTimeout()  → Hard wait (use sparingly!)
//   - test.slow()            → Mark test as needing more time
//   - test.skip()            → Skip a test
//   - test.fixme()           → Mark test as known broken
//   - test annotations       → Tag tests with @smoke, @regression
// =====================================================
// Run: npx playwright test 10-advanced --headed
// Run only @smoke: npx playwright test --grep @smoke
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Waiting strategies', () => {

  test('waitForURL - wait for page navigation', async ({ page }) => {
    await page.goto('/');

    // Click cart link
    await page.getByRole('link', { name: 'View Cart' }).click();

    // Explicitly wait for the URL to change
    await page.waitForURL('**/cart.html');

    // Now we're sure we're on the cart page
    await expect(page).toHaveTitle('Cart');
  });

  test('waitForSelector - wait for element to appear', async ({ page }) => {
    await page.goto('/');

    // Pre-fill cart
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Test Item', price: 50 },
      ]));
    });

    await page.goto('/Cart.html');

    // Wait for the cart items to render
    await page.waitForSelector('#totalAmount');

    const total = await page.locator('#totalAmount').textContent();
    expect(total).toContain('$50');
  });

  test('waitForTimeout - hard wait (AVOID in real tests)', async ({ page }) => {
    await page.goto('/');

    // This pauses for 1 second - NOT recommended!
    // Only use for debugging. In real tests, use waitForSelector/waitForURL
    await page.waitForTimeout(1000);

    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Test control', () => {

  test('test.slow() - gives 3x more time', async ({ page }) => {
    test.slow(); // Triples the timeout (30s → 90s)

    await page.goto('/');
    await expect(page.locator('.product-card')).toHaveCount(3);
  });

  test.skip('this test is skipped', async ({ page }) => {
    // test.skip() means this test won't run at all
    // Useful when a feature isn't ready yet
    await page.goto('/');
  });

  test.fixme('this test is known to be broken', async ({ page }) => {
    // test.fixme() is like skip but signals "needs fixing"
    // Shows as "fixme" in the report
    await page.goto('/nonexistent-page');
    await expect(page.locator('h1')).toHaveText('This will fail');
  });
});

test.describe('Test tags (annotations)', () => {

  // Use @tags in test names to categorize tests
  // Run only smoke tests: npx playwright test --grep @smoke
  // Run only regression:  npx playwright test --grep @regression
  // Skip smoke tests:     npx playwright test --grep-invert @smoke

  test('@smoke homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('@smoke cart page loads', async ({ page }) => {
    await page.goto('/Cart.html');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('@regression all products have correct prices', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('$100')).toBeVisible();
    await expect(page.getByText('$200')).toBeVisible();
    await expect(page.getByText('$150')).toBeVisible();
  });

  test('@regression all add-to-cart buttons work', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async (d) => await d.accept());

    const buttons = page.getByRole('button', { name: 'Add to Cart' });
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click();
    }

    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart'))
    );
    expect(cart).toHaveLength(3);
  });
});
