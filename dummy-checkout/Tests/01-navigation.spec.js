// =====================================================
// LESSON 1: Navigation & Page Title
// =====================================================
// What you'll learn:
//   - page.goto()      → Navigate to a URL
//   - toHaveTitle()    → Check the page title (<title> tag)
//   - toHaveURL()      → Check the current URL
// =====================================================
// Run this test:  npx playwright test 01-navigation --headed
// =====================================================

const { test, expect } = require('@playwright/test');

// test() creates a single test case
// First argument  = test name (describe what it does)
// Second argument = async function with { page } (the browser tab)

test('should open the homepage', async ({ page }) => {
  // goto() navigates the browser to a URL
  // Since we set baseURL in config, we can use relative paths
  await page.goto('/');

  // Check: does the page title match?
  // toHaveTitle() checks the <title> tag in the HTML
  await expect(page).toHaveTitle('Shop - Dummy Store');
});

test('should have correct URL after navigation', async ({ page }) => {
  await page.goto('/');

  // toHaveURL() checks the browser's address bar
  // You can use a string or a regex pattern
  await expect(page).toHaveURL(/127\.0\.0\.1/);
});

test('should navigate to cart page', async ({ page }) => {
  // Navigate to cart page directly
  await page.goto('/Cart.html');

  // Verify we are on the cart page
  await expect(page).toHaveTitle('Cart');
});

test('should navigate to checkout page', async ({ page }) => {
  await page.goto('/checkout.html');

  await expect(page).toHaveTitle('Checkout');
  // You can also check the full URL
  await expect(page).toHaveURL(/checkout/);
});
