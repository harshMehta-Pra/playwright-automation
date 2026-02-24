// =====================================================
// LESSON 4: Form Filling
// =====================================================
// What you'll learn:
//   - .fill()           → Set input value instantly
//   - .clear()          → Clear an input field
//   - .pressSequentially() → Type one key at a time (like a human)
//   - .inputValue()     → Read current value of an input
//   - toHaveValue()     → Assert input has specific value
//   - .press()          → Press a keyboard key
// =====================================================
// Run: npx playwright test 04-forms --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Working with forms', () => {

  test('fill() - set input value instantly', async ({ page }) => {
    await page.goto('/checkout.html');

    // fill() clears the field and sets the value in one step
    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('john@example.com');
    await page.locator('#address').fill('123 Test Street');

    // Verify the values were set correctly
    await expect(page.locator('#name')).toHaveValue('John Doe');
    await expect(page.locator('#email')).toHaveValue('john@example.com');
    await expect(page.locator('#address')).toHaveValue('123 Test Street');
  });

  test('clear() - empty an input field', async ({ page }) => {
    await page.goto('/checkout.html');

    // Fill first
    await page.locator('#name').fill('John Doe');
    await expect(page.locator('#name')).toHaveValue('John Doe');

    // Now clear it
    await page.locator('#name').clear();
    await expect(page.locator('#name')).toHaveValue('');
  });

  test('pressSequentially() - type like a real person', async ({ page }) => {
    await page.goto('/checkout.html');

    // pressSequentially() types each character one at a time
    // Good for testing inputs that react to each keystroke
    await page.locator('#name').pressSequentially('Hello', { delay: 100 });

    await expect(page.locator('#name')).toHaveValue('Hello');
  });

  test('inputValue() - read the current value', async ({ page }) => {
    await page.goto('/checkout.html');

    await page.locator('#name').fill('Test User');

    // inputValue() returns the current value as a string
    const currentValue = await page.locator('#name').inputValue();
    console.log('Current value:', currentValue); // "Test User"

    // You can use it in regular JavaScript comparisons
    expect(currentValue).toBe('Test User');
  });

  test('press() - simulate keyboard keys', async ({ page }) => {
    await page.goto('/checkout.html');

    // Focus on name field and type
    await page.locator('#name').fill('Hello World');

    // press() can simulate special keys
    // Select all text and delete it
    await page.locator('#name').press('Control+A');
    await page.locator('#name').press('Backspace');

    await expect(page.locator('#name')).toHaveValue('');
  });

  test('Tab between fields using keyboard', async ({ page }) => {
    await page.goto('/checkout.html');

    // Click on name field to focus it
    await page.locator('#name').click();
    await page.locator('#name').fill('John');

    // Press Tab to move to next field
    await page.keyboard.press('Tab');

    // Now email field should be focused - type in it
    await page.locator('#email').fill('john@test.com');

    await expect(page.locator('#name')).toHaveValue('John');
    await expect(page.locator('#email')).toHaveValue('john@test.com');
  });

  test('fill and submit the entire form', async ({ page }) => {
    await page.goto('/checkout.html');

    // Fill shipping fields
    await page.locator('#name').fill('Jane Tester');
    await page.locator('#email').fill('jane@test.com');
    await page.locator('#phone').fill('5551234567');
    await page.locator('#address').fill('456 Automation Ave');
    await page.locator('#city').fill('New York');
    await page.locator('#state').fill('NY');
    await page.locator('#zip').fill('10001');

    // Fill payment fields
    await page.locator('#cardName').fill('Jane Tester');
    await page.locator('#cardNumber').fill('4111 1111 1111 1111');
    await page.locator('#expiry').fill('12/28');
    await page.locator('#cvv').fill('123');

    // Submit by clicking the button
    await page.getByRole('button', { name: 'Place Order' }).click();

    // After form submit, we should land on success page
    await expect(page).toHaveURL(/success/);
    await expect(page.getByText('Order Confirmed')).toBeVisible();
  });
});
