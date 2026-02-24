// =====================================================
// LESSON 5: Handling Dialogs (Alerts, Confirms, Prompts)
// =====================================================
// What you'll learn:
//   - page.on('dialog')    → Listen for alert/confirm/prompt
//   - dialog.accept()      → Click "OK"
//   - dialog.dismiss()     → Click "Cancel"
//   - dialog.message()     → Get the text of the dialog
//   - dialog.type()        → Get dialog type (alert/confirm/prompt)
// =====================================================
// IMPORTANT: You MUST set up the dialog listener BEFORE the
// action that triggers it. Playwright auto-dismisses dialogs
// if no listener is set.
// =====================================================
// Run: npx playwright test 05-dialogs --headed
// =====================================================

const { test, expect } = require('@playwright/test');

test.describe('Handling browser dialogs', () => {

  test('handle alert when adding to cart', async ({ page }) => {
    await page.goto('/');

    // STEP 1: Set up dialog listener BEFORE clicking
    // This runs when any dialog appears
    page.on('dialog', async (dialog) => {
      console.log('Dialog message:', dialog.message());
      console.log('Dialog type:', dialog.type()); // "alert"
      await dialog.accept(); // Click OK
    });

    // STEP 2: Now click the button that triggers the alert
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();

    // The alert "Added to cart!" was handled automatically
  });

  test('capture alert message text', async ({ page }) => {
    await page.goto('/');

    // We can capture the message in a variable
    let alertMessage = '';

    page.on('dialog', async (dialog) => {
      alertMessage = dialog.message(); // Save the message
      await dialog.accept();
    });

    // Click "Add to Cart" for Headphones
    await page.locator('.product-card').first()
      .getByRole('button').click();

    // Verify the alert said the right thing
    expect(alertMessage).toBe('Added to cart!');
  });

  test('handle multiple alerts in sequence', async ({ page }) => {
    await page.goto('/');

    const messages = []; // Collect all alert messages

    page.on('dialog', async (dialog) => {
      messages.push(dialog.message());
      await dialog.accept();
    });

    // Add multiple products - each triggers an alert
    await page.getByRole('button', { name: 'Add to Cart' }).nth(0).click();
    await page.getByRole('button', { name: 'Add to Cart' }).nth(1).click();
    await page.getByRole('button', { name: 'Add to Cart' }).nth(2).click();

    // All three alerts should have been captured
    expect(messages).toHaveLength(3);
    expect(messages[0]).toBe('Added to cart!');
    expect(messages[1]).toBe('Added to cart!');
    expect(messages[2]).toBe('Added to cart!');
  });

  test('use page.once for a single dialog', async ({ page }) => {
    await page.goto('/');

    // page.once() only handles the FIRST dialog, then removes itself
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
  });
});
