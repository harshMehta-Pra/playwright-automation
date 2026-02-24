// =====================================================
// INTEGRATION TESTING - How components work TOGETHER
// =====================================================
// Unlike E2E (full journey) or unit tests (single function),
// integration tests verify that TWO or MORE parts of the
// app communicate correctly with each other.
// =====================================================
// Run: npx playwright test 12-integration --headed
// =====================================================

const { test, expect } = require('@playwright/test');

// Helper: fill all checkout fields with valid data
async function fillCheckoutForm(page, overrides = {}) {
  const defaults = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '5551234567',
    address: '123 Test Street',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    cardName: 'Test User',
    cardNumber: '4111 1111 1111 1111',
    expiry: '12/28',
    cvv: '123',
  };
  const data = { ...defaults, ...overrides };

  await page.locator('#name').fill(data.name);
  await page.locator('#email').fill(data.email);
  await page.locator('#phone').fill(data.phone);
  await page.locator('#address').fill(data.address);
  await page.locator('#city').fill(data.city);
  await page.locator('#state').fill(data.state);
  await page.locator('#zip').fill(data.zip);
  await page.locator('#cardName').fill(data.cardName);
  await page.locator('#cardNumber').fill(data.cardNumber);
  await page.locator('#expiry').fill(data.expiry);
  await page.locator('#cvv').fill(data.cvv);
}

// =====================================================
// 1. CART ↔ LOCALSTORAGE INTEGRATION
// =====================================================
test.describe('Cart ↔ localStorage Integration', () => {

  test('adding product from homepage stores it in localStorage', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async (d) => await d.accept());

    // Add product from UI
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();

    // Verify localStorage was updated correctly
    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart'))
    );

    expect(cart).toHaveLength(1);
    expect(cart[0]).toEqual(expect.objectContaining({
      name: 'Headphones',
      price: 100,
    }));
  });

  test('cart page reads and renders localStorage data correctly', async ({ page }) => {
    // Inject data directly into localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
        { name: 'Smart Watch', price: 200 },
      ]));
    });

    // Navigate to cart - it should read from localStorage and render
    await page.goto('/Cart.html');

    await expect(page.getByText('Headphones')).toBeVisible();
    await expect(page.getByText('Smart Watch')).toBeVisible();
    await expect(page.getByText('Total: $300')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(2);
  });

  test('removing item from cart updates localStorage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
        { name: 'Smart Watch', price: 200 },
      ]));
    });

    await page.goto('/Cart.html');
    await page.getByRole('button', { name: 'Remove' }).first().click();

    // Verify localStorage was updated
    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart'))
    );

    expect(cart).toHaveLength(1);
    expect(cart[0].name).toBe('Smart Watch');
  });

  test('quantity change updates localStorage and total', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100, quantity: 1 },
      ]));
    });

    await page.goto('/Cart.html');

    // Click "+" to increase quantity
    await page.locator('.quantity-controls button:has-text("+")').click();

    // Verify total updated on page
    await expect(page.getByText('Total: $200')).toBeVisible();

    // Verify localStorage updated
    const cart = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('cart'))
    );
    expect(cart[0].quantity).toBe(2);
  });

  test('decreasing quantity to 0 removes item from cart', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100, quantity: 1 },
      ]));
    });

    await page.goto('/Cart.html');

    // Click "-" to decrease quantity to 0
    await page.locator('.quantity-controls button:has-text("-")').click();

    // Item should be removed, cart should be empty
    await expect(page.getByText('Total: $0')).toBeVisible();
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
});

// =====================================================
// 2. CART → CHECKOUT ORDER SUMMARY INTEGRATION
// =====================================================
test.describe('Cart → Checkout Order Summary Integration', () => {

  test('checkout page shows correct items from cart', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
        { name: 'Speaker', price: 150 },
      ]));
    });

    await page.goto('/checkout.html');

    // Order summary sidebar should show cart items
    const summary = page.locator('.order-summary');
    await expect(summary.getByText('Headphones')).toBeVisible();
    await expect(summary.getByText('Speaker')).toBeVisible();
    await expect(summary.getByText('$250')).toBeVisible();
  });

  test('checkout summary shows correct quantity and total', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100, quantity: 3 },
      ]));
    });

    await page.goto('/checkout.html');

    // Should show "Headphones x3" and total "$300"
    await expect(page.locator('.order-summary').getByText('x3')).toBeVisible();
    await expect(page.locator('#summaryTotal')).toHaveText('$300');
  });

  test('empty cart shows $0 in checkout summary', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('cart'));

    await page.goto('/checkout.html');

    await expect(page.locator('#summaryTotal')).toHaveText('$0');
  });

  test('cart items match between cart page and checkout summary', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async (d) => await d.accept());

    // Add items via UI
    await page.getByRole('button', { name: 'Add to Cart' }).nth(0).click();
    await page.getByRole('button', { name: 'Add to Cart' }).nth(1).click();

    // Check total on cart page
    await page.goto('/Cart.html');
    const cartTotal = await page.locator('#totalAmount').textContent();

    // Check total on checkout page
    await page.goto('/checkout.html');
    const summaryTotal = await page.locator('#summaryTotal').textContent();

    // Both should show $300
    expect(cartTotal).toContain('300');
    expect(summaryTotal).toContain('300');
  });
});

// =====================================================
// 3. CHECKOUT FORM ↔ VALIDATION INTEGRATION
// =====================================================
test.describe('Checkout Form ↔ Validation Integration', () => {

  test('all error messages appear when submitting empty form', async ({ page }) => {
    await page.goto('/checkout.html');

    await page.getByRole('button', { name: 'Place Order' }).click();

    // All 11 error messages should be visible
    await expect(page.locator('#nameError')).toBeVisible();
    await expect(page.locator('#emailError')).toBeVisible();
    await expect(page.locator('#phoneError')).toBeVisible();
    await expect(page.locator('#addressError')).toBeVisible();
    await expect(page.locator('#cityError')).toBeVisible();
    await expect(page.locator('#stateError')).toBeVisible();
    await expect(page.locator('#zipError')).toBeVisible();
    await expect(page.locator('#cardNameError')).toBeVisible();
    await expect(page.locator('#cardNumberError')).toBeVisible();
    await expect(page.locator('#expiryError')).toBeVisible();
    await expect(page.locator('#cvvError')).toBeVisible();
  });

  test('error clears when user starts typing in field', async ({ page }) => {
    await page.goto('/checkout.html');

    // Submit empty to trigger errors
    await page.getByRole('button', { name: 'Place Order' }).click();
    await expect(page.locator('#name')).toHaveClass(/error/);

    // Start typing in name field
    await page.locator('#name').fill('J');

    // Error class should be removed
    await expect(page.locator('#name')).not.toHaveClass(/error/);
  });

  test('invalid card number shows error, valid card clears it', async ({ page }) => {
    await page.goto('/checkout.html');

    // Fill everything valid except card number
    await fillCheckoutForm(page, { cardNumber: '1234 5678 9012 3456' });

    await page.getByRole('button', { name: 'Place Order' }).click();

    // Card number should have error (fails Luhn)
    await expect(page.locator('#cardNumber')).toHaveClass(/error/);
    await expect(page.locator('#cardNumberError')).toBeVisible();

    // Fix with valid card number
    await page.locator('#cardNumber').fill('4111 1111 1111 1111');
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Should navigate to success (all valid now)
    await expect(page).toHaveURL(/success/);
  });

  test('expired card date is rejected', async ({ page }) => {
    await page.goto('/checkout.html');

    await fillCheckoutForm(page, { expiry: '01/20' }); // expired

    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.locator('#expiry')).toHaveClass(/error/);
    await expect(page.locator('#expiryError')).toBeVisible();
    await expect(page).toHaveURL(/checkout/);
  });

  test('invalid ZIP code format is rejected', async ({ page }) => {
    await page.goto('/checkout.html');

    await fillCheckoutForm(page, { zip: 'ABCDE' }); // invalid

    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.locator('#zip')).toHaveClass(/error/);
    await expect(page).toHaveURL(/checkout/);
  });

  test('CVV with letters is rejected', async ({ page }) => {
    await page.goto('/checkout.html');

    await fillCheckoutForm(page, { cvv: 'abc' });

    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.locator('#cvv')).toHaveClass(/error/);
    await expect(page).toHaveURL(/checkout/);
  });

  test('only invalid fields show error, valid fields stay clean', async ({ page }) => {
    await page.goto('/checkout.html');

    // Fill only shipping fields (valid), leave payment empty
    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('john@test.com');
    await page.locator('#phone').fill('5551234567');
    await page.locator('#address').fill('123 Street');
    await page.locator('#city').fill('New York');
    await page.locator('#state').fill('NY');
    await page.locator('#zip').fill('10001');

    await page.getByRole('button', { name: 'Place Order' }).click();

    // Shipping fields should NOT have error
    await expect(page.locator('#name')).not.toHaveClass(/error/);
    await expect(page.locator('#email')).not.toHaveClass(/error/);
    await expect(page.locator('#address')).not.toHaveClass(/error/);

    // Payment fields SHOULD have error
    await expect(page.locator('#cardName')).toHaveClass(/error/);
    await expect(page.locator('#cardNumber')).toHaveClass(/error/);
    await expect(page.locator('#expiry')).toHaveClass(/error/);
    await expect(page.locator('#cvv')).toHaveClass(/error/);
  });
});

// =====================================================
// 4. CHECKOUT → SUCCESS PAGE DATA FLOW
// =====================================================
test.describe('Checkout → Success Page Data Flow', () => {

  test('order number is generated and displayed on success page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
      ]));
    });

    await page.goto('/checkout.html');
    await fillCheckoutForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Order number should be visible and match ORD-XXXXXX format
    const orderNum = await page.locator('#orderNumber').textContent();
    expect(orderNum).toMatch(/^ORD-[A-Z0-9]+$/);
  });

  test('ordered items appear on success page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
        { name: 'Smart Watch', price: 200 },
      ]));
    });

    await page.goto('/checkout.html');
    await fillCheckoutForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Both items should be listed
    await expect(page.locator('#orderItems')).toContainText('Headphones');
    await expect(page.locator('#orderItems')).toContainText('Smart Watch');
  });

  test('shipping address passes correctly to success page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
      ]));
    });

    await page.goto('/checkout.html');
    await fillCheckoutForm(page, {
      name: 'Jane Smith',
      address: '456 Oak Avenue',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
    });
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Success page should show the shipping address
    const address = await page.locator('#orderAddress').textContent();
    expect(address).toContain('Jane Smith');
    expect(address).toContain('456 Oak Avenue');
    expect(address).toContain('Chicago');
    expect(address).toContain('IL');
    expect(address).toContain('60601');
  });

  test('masked card number passes correctly to success page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
      ]));
    });

    await page.goto('/checkout.html');
    await fillCheckoutForm(page, { cardNumber: '5500 0000 0000 0004' });
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Should show last 4 digits only
    const payment = await page.locator('#orderPayment').textContent();
    expect(payment).toContain('****0004');
    expect(payment).not.toContain('5500');
  });

  test('order total matches cart total on success page', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
        { name: 'Smart Watch', price: 200 },
        { name: 'Speaker', price: 150 },
      ]));
    });

    await page.goto('/checkout.html');
    await fillCheckoutForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page.locator('#orderTotal')).toHaveText('$450');
  });

  test('cart is cleared after successful order', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('cart', JSON.stringify([
        { name: 'Headphones', price: 100 },
      ]));
    });

    await page.goto('/checkout.html');
    await fillCheckoutForm(page);
    await page.getByRole('button', { name: 'Place Order' }).click();

    await expect(page).toHaveURL(/success/);

    // Cart should be empty in localStorage
    const cart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cart).toBeNull();

    // But orderDetails should still exist
    const order = await page.evaluate(() => localStorage.getItem('orderDetails'));
    expect(order).not.toBeNull();
  });
});

// =====================================================
// 5. INPUT FORMATTING INTEGRATION
// =====================================================
test.describe('Input Formatting Integration', () => {

  test('card number auto-formats with spaces', async ({ page }) => {
    await page.goto('/checkout.html');

    // Type without spaces — should auto-format
    await page.locator('#cardNumber').pressSequentially('4111111111111111');

    await expect(page.locator('#cardNumber')).toHaveValue('4111 1111 1111 1111');
  });

  test('expiry auto-formats with slash', async ({ page }) => {
    await page.goto('/checkout.html');

    // Type "1228" — should become "12/28"
    await page.locator('#expiry').pressSequentially('1228');

    await expect(page.locator('#expiry')).toHaveValue('12/28');
  });

  test('CVV only accepts digits', async ({ page }) => {
    await page.goto('/checkout.html');

    await page.locator('#cvv').pressSequentially('ab3c2d1');

    // Only digits should remain
    await expect(page.locator('#cvv')).toHaveValue('321');
  });
});

// =====================================================
// 6. CROSS-PAGE NAVIGATION INTEGRATION
// =====================================================
test.describe('Cross-Page Navigation Integration', () => {

  test('progress bar shows correct active step on each page', async ({ page }) => {
    // Homepage — step 1 active
    await page.goto('/');
    await expect(page.locator('.progress-step.active')).toContainText('Shop');

    // Cart — step 2 active
    await page.goto('/Cart.html');
    await expect(page.locator('.progress-step.active')).toContainText('Cart');

    // Checkout — step 3 active
    await page.goto('/checkout.html');
    await expect(page.locator('.progress-step.active')).toContainText('Checkout');

    // Success — step 4 active
    await page.goto('/success.html');
    await expect(page.locator('.progress-step.active')).toContainText('Confirmation');
  });

  test('completed steps are marked on later pages', async ({ page }) => {
    await page.goto('/checkout.html');

    // On checkout page, Shop and Cart should be "completed"
    const completedSteps = page.locator('.progress-step.completed');
    await expect(completedSteps).toHaveCount(2);
  });

  test('full navigation flow: Shop → Cart → Checkout → Success → Home', async ({ page }) => {
    page.on('dialog', async (d) => await d.accept());

    // Shop page
    await page.goto('/');
    await expect(page).toHaveTitle('Shop - Dummy Store');

    // Add item and go to cart
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await page.getByRole('link', { name: 'View Cart' }).click();
    await expect(page).toHaveTitle('Cart');

    // Go to checkout
    await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
    await expect(page).toHaveTitle('Checkout');

    // Go back to cart using header link
    await page.getByRole('link', { name: 'Back to Cart' }).click();
    await expect(page).toHaveTitle('Cart');

    // Continue shopping
    await page.getByRole('link', { name: 'Continue Shopping' }).click();
    await expect(page).toHaveTitle('Shop - Dummy Store');
  });

  test('cart data persists across page navigations', async ({ page }) => {
    await page.goto('/');
    page.on('dialog', async (d) => await d.accept());

    // Add item
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();

    // Navigate away to checkout and back to cart
    await page.goto('/checkout.html');
    await page.goto('/Cart.html');

    // Item should still be there
    await expect(page.getByText('Headphones')).toBeVisible();
    await expect(page.getByText('Total: $100')).toBeVisible();
  });
});

// =====================================================
// 7. EMPTY STATE INTEGRATION
// =====================================================
test.describe('Empty State Integration', () => {

  test('empty cart shows message and disables checkout button visually', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/Cart.html');

    await expect(page.getByText('Your cart is empty')).toBeVisible();
    await expect(page.getByText('Total: $0')).toBeVisible();
    await expect(page.locator('#checkoutBtn')).toHaveClass(/btn-disabled/);
  });

  test('success page handles missing order details gracefully', async ({ page }) => {
    // Clear everything and go to success page directly
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/success.html');

    // Page should still load without crashing
    await expect(page.getByText('Order Confirmed')).toBeVisible();

    // Order details will be empty but page works
    await expect(page.locator('#orderNumber')).toHaveText('');
  });

  test('checkout summary shows $0 when cart is empty', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/checkout.html');

    await expect(page.locator('#summaryTotal')).toHaveText('$0');
    // No summary items should exist
    await expect(page.locator('.summary-item')).toHaveCount(0);
  });
});
