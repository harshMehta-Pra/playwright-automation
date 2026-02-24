// =====================================================
// LESSON 7: Hooks (beforeEach / afterEach / beforeAll)
// =====================================================
// What you'll learn:
//   - test.beforeEach()  → Runs BEFORE every test
//   - test.afterEach()   → Runs AFTER every test
//   - test.beforeAll()   → Runs ONCE before all tests
//   - test.afterAll()    → Runs ONCE after all tests
//   - test.describe()    → Group related tests together
// =====================================================
// Hooks help you avoid repeating the same setup code in
// every test. Put shared setup in beforeEach!
// =====================================================
// Run: npx playwright test 07-hooks --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Shopping page tests', () => {

  // This runs BEFORE EACH test in this describe block
  test.beforeEach(async ({ page }) => {
    console.log('--- Setting up: navigating to homepage ---');
    await page.goto('/');

    // Handle dialogs for all tests
    page.on('dialog', async (d) => await d.accept());
  });

  // This runs AFTER EACH test
  test.afterEach(async ({ page }) => {
    console.log('--- Cleaning up: clearing localStorage ---');
    await page.evaluate(() => localStorage.clear());
  });

  // Now our tests are cleaner - no need to repeat goto() and dialog handler!

  test('homepage has 3 products', async ({ page }) => {
    // page is already on '/' thanks to beforeEach
    await expect(page.locator('.product-card')).toHaveCount(3);
  });

  test('can add first item to cart', async ({ page }) => {
    // dialog handler is already set up thanks to beforeEach
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();

    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart'))
    );
    expect(cart).toHaveLength(1);
  });

  test('can add all items to cart', async ({ page }) => {
    const buttons = page.getByRole('button', { name: 'Add to Cart' });

    await buttons.nth(0).click();
    await buttons.nth(1).click();
    await buttons.nth(2).click();

    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart'))
    );
    expect(cart).toHaveLength(3);
    // localStorage is cleared after this test by afterEach
  });
});

test.describe('Cart page tests', () => {

  // Different describe block = different beforeEach
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Pre-fill cart with items
    await page.evaluate(() => {
      const cart = [
        { name: 'Headphones', price: 100 },
        { name: 'Smart Watch', price: 200 },
      ];
      localStorage.setItem('cart', JSON.stringify(cart));
    });

    // Navigate to cart
    await page.goto('/Cart.html');
  });

  test('cart shows correct items', async ({ page }) => {
    await expect(page.getByText('Headphones')).toBeVisible();
    await expect(page.getByText('Smart Watch')).toBeVisible();
  });

  test('cart shows correct total', async ({ page }) => {
    await expect(page.getByText('Total: $300')).toBeVisible();
  });

  test('can remove item from cart', async ({ page }) => {
    // Click first "Remove" button
    await page.getByRole('button', { name: 'Remove' }).first().click();

    // Total should update (only Smart Watch remains = $200)
    await expect(page.getByText('Total: $200')).toBeVisible();
  });
});
