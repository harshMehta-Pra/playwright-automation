// =====================================================
// LESSON 2: Locators (Finding Elements on the Page)
// =====================================================
// What you'll learn:
//   - page.locator()    → Find element by CSS selector
//   - page.getByRole()  → Find by accessibility role (BEST practice)
//   - page.getByText()  → Find by visible text
//   - .first()          → Get the first match
//   - .nth(n)           → Get the nth match (0-based)
//   - .click()          → Click an element
// =====================================================
// Run: npx playwright test 02-locators --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Different ways to find elements', () => {

  test('find elements by CSS selector', async ({ page }) => {
    await page.goto('/');

    // page.locator('css selector') - just like document.querySelector
    const header = page.locator('h1');
    await expect(header).toBeVisible();

    // Find by class name
    const cartLink = page.locator('.cart-link');
    await expect(cartLink).toBeVisible();

    // Find by tag + class
    const productCards = page.locator('div.product-card');
    // toHaveCount() checks how many elements match
    await expect(productCards).toHaveCount(3);
  });

  test('find elements by role (RECOMMENDED)', async ({ page }) => {
    await page.goto('/');

    // getByRole() is the BEST way to find elements
    // It uses accessibility roles - more resilient to code changes

    // Find heading
    const heading = page.getByRole('heading', { name: 'Dummy Store' });
    await expect(heading).toBeVisible();

    // Find buttons - all "Add to Cart" buttons
    const buttons = page.getByRole('button', { name: 'Add to Cart' });
    await expect(buttons).toHaveCount(3);

    // Find links
    const cartLink = page.getByRole('link', { name: 'View Cart' });
    await expect(cartLink).toBeVisible();
  });

  test('find elements by text', async ({ page }) => {
    await page.goto('/');

    // getByText() finds elements by their visible text content
    const price = page.getByText('$100');
    await expect(price).toBeVisible();

    // You can use exact match or partial match
    const smartWatch = page.getByText('Smart Watch', { exact: false });
    await expect(smartWatch).toBeVisible();
  });

  test('use first() and nth() for multiple matches', async ({ page }) => {
    await page.goto('/');

    const buttons = page.getByRole('button', { name: 'Add to Cart' });

    // .first() = first matching element (index 0)
    await expect(buttons.first()).toBeVisible();

    // .nth(1) = second matching element (0-based index)
    await expect(buttons.nth(1)).toBeVisible();

    // .last() = last matching element
    await expect(buttons.last()).toBeVisible();
  });

  test('click on elements', async ({ page }) => {
    await page.goto('/');

    // Click the "View Cart" link to navigate
    await page.getByRole('link', { name: 'View Cart' }).click();

    // After clicking, we should be on the cart page
    await expect(page).toHaveTitle('Cart');
  });

  test('find element inside another element (chaining)', async ({ page }) => {
    await page.goto('/');

    // Find button INSIDE the first product card
    const firstCard = page.locator('.product-card').first();
    const buttonInCard = firstCard.getByRole('button');

    await expect(buttonInCard).toHaveText('Add to Cart');
  });
});
