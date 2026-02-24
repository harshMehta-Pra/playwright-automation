// ===========================
// CART HELPERS
// ===========================
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// ===========================
// ADD TO CART (called from index.html buttons)
// ===========================
function addToCart(name, price) {
  let cart = getCart();
  cart.push({ name, price });
  saveCart(cart);
  alert("Added to cart!");
}

// ===========================
// LOAD CART PAGE
// ===========================
function loadCart() {
  let cart = getCart();
  let cartDiv = document.getElementById("cartItems");
  let total = 0;

  if (!cartDiv) return;

  cartDiv.innerHTML = "";

  // Show/hide empty cart message and disable checkout button
  const emptyCartDiv = document.getElementById("emptyCart");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (cart.length === 0) {
    if (emptyCartDiv) emptyCartDiv.style.display = "block";
    if (checkoutBtn) checkoutBtn.classList.add("btn-disabled");
    document.getElementById("totalAmount").innerText = "Total: $0";
    return;
  }

  if (emptyCartDiv) emptyCartDiv.style.display = "none";
  if (checkoutBtn) checkoutBtn.classList.remove("btn-disabled");

  cart.forEach((item, index) => {
    const qty = item.quantity || 1;
    const itemTotal = item.price * qty;
    total += itemTotal;

    cartDiv.innerHTML += `
      <div class="cart-item">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">$${item.price} each</span>
        </div>
        <div class="quantity-controls">
          <button onclick="updateQuantity(${index}, -1)">-</button>
          <span class="quantity-value">${qty}</span>
          <button onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
  });

  document.getElementById("totalAmount").innerText = "Total: $" + total;
}

// ===========================
// QUANTITY CONTROLS
// ===========================
function updateQuantity(index, delta) {
  let cart = getCart();
  if (!cart[index]) return;

  const currentQty = cart[index].quantity || 1;
  const newQty = currentQty + delta;

  if (newQty <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index].quantity = newQty;
  }

  saveCart(cart);
  loadCart();
}

// ===========================
// REMOVE ITEM
// ===========================
function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  loadCart();
}

// ===========================
// INIT CART PAGE
// ===========================
if (document.getElementById("cartItems")) {
  loadCart();
}

// ===========================
// CHECKOUT: ORDER SUMMARY SIDEBAR
// ===========================
function loadCheckoutSummary() {
  const summaryItemsDiv = document.getElementById("summaryItems");
  const summaryTotalEl = document.getElementById("summaryTotal");
  if (!summaryItemsDiv) return;

  const cart = getCart();
  let total = 0;

  summaryItemsDiv.innerHTML = "";

  cart.forEach(function(item) {
    const qty = item.quantity || 1;
    const itemTotal = item.price * qty;
    total += itemTotal;

    summaryItemsDiv.innerHTML += `
      <div class="summary-item">
        <span>${item.name} x${qty}</span>
        <span>$${itemTotal}</span>
      </div>
    `;
  });

  summaryTotalEl.innerText = "$" + total;
}

// ===========================
// VALIDATION: LUHN ALGORITHM
// ===========================
function luhnCheck(cardNumber) {
  const digits = cardNumber.replace(/[\s-]/g, '');
  if (!/^\d{13,19}$/.test(digits)) return false;

  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  return sum % 10 === 0;
}

// ===========================
// VALIDATION: EXPIRY DATE
// ===========================
function isValidExpiry(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

  const parts = expiry.split('/');
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10) + 2000;

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

// ===========================
// VALIDATION: SINGLE FIELD
// ===========================
function validateField(fieldId, errorId, validationFn) {
  const input = document.getElementById(fieldId);
  if (!input) return true;

  const value = input.value.trim();
  const isValid = validationFn(value);

  if (isValid) {
    input.classList.remove('error');
  } else {
    input.classList.add('error');
  }

  return isValid;
}

// ===========================
// VALIDATION: ENTIRE FORM
// ===========================
function validateCheckoutForm() {
  let allValid = true;

  const checks = [
    { field: 'name', error: 'nameError', fn: function(v) { return v.length > 0; } },
    { field: 'email', error: 'emailError', fn: function(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
    { field: 'phone', error: 'phoneError', fn: function(v) { return /^[\d\s()+\-]{7,15}$/.test(v); } },
    { field: 'address', error: 'addressError', fn: function(v) { return v.length > 0; } },
    { field: 'city', error: 'cityError', fn: function(v) { return v.length > 0; } },
    { field: 'state', error: 'stateError', fn: function(v) { return v.length > 0; } },
    { field: 'zip', error: 'zipError', fn: function(v) { return /^\d{5}(-\d{4})?$/.test(v); } },
    { field: 'cardName', error: 'cardNameError', fn: function(v) { return v.length > 0; } },
    { field: 'cardNumber', error: 'cardNumberError', fn: function(v) { return luhnCheck(v); } },
    { field: 'expiry', error: 'expiryError', fn: function(v) { return isValidExpiry(v); } },
    { field: 'cvv', error: 'cvvError', fn: function(v) { return /^\d{3}$/.test(v); } },
  ];

  checks.forEach(function(check) {
    var result = validateField(check.field, check.error, check.fn);
    if (!result) allValid = false;
  });

  return allValid;
}

// ===========================
// CARD NUMBER FORMATTING
// ===========================
function formatCardNumber(input) {
  var value = input.value.replace(/\D/g, '');
  var formatted = value.match(/.{1,4}/g);
  input.value = formatted ? formatted.join(' ') : '';
}

// ===========================
// EXPIRY DATE FORMATTING
// ===========================
function formatExpiry(input) {
  var value = input.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2);
  }
  input.value = value;
}

// ===========================
// CHECKOUT FORM INIT
// ===========================
if (document.getElementById("checkoutForm")) {
  loadCheckoutSummary();

  // Card number auto-format
  var cardNumberInput = document.getElementById("cardNumber");
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function() {
      formatCardNumber(this);
    });
  }

  // Expiry auto-format
  var expiryInput = document.getElementById("expiry");
  if (expiryInput) {
    expiryInput.addEventListener("input", function() {
      formatExpiry(this);
    });
  }

  // CVV: digits only
  var cvvInput = document.getElementById("cvv");
  if (cvvInput) {
    cvvInput.addEventListener("input", function() {
      this.value = this.value.replace(/\D/g, '');
    });
  }

  // Clear error state when user starts typing
  document.querySelectorAll('#checkoutForm input').forEach(function(input) {
    input.addEventListener('input', function() {
      this.classList.remove('error');
    });
  });

  // Form submission
  document.getElementById("checkoutForm").addEventListener("submit", function(e) {
    e.preventDefault();

    if (!validateCheckoutForm()) return;

    // Save order details for success page
    var cart = getCart();
    var total = 0;
    cart.forEach(function(item) {
      total += item.price * (item.quantity || 1);
    });

    var orderDetails = {
      orderNumber: 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      items: cart,
      shipping: {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zip: document.getElementById('zip').value,
      },
      payment: {
        cardLast4: document.getElementById('cardNumber').value.replace(/\s/g, '').slice(-4),
      },
      total: total,
    };

    localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
    localStorage.removeItem("cart");
    window.location.href = "success.html";
  });
}

// ===========================
// SUCCESS PAGE: LOAD ORDER DETAILS
// ===========================
function loadOrderDetails() {
  var details = JSON.parse(localStorage.getItem('orderDetails'));
  if (!details) return;

  var orderNumEl = document.getElementById('orderNumber');
  if (orderNumEl) orderNumEl.textContent = details.orderNumber;

  var orderItemsEl = document.getElementById('orderItems');
  if (orderItemsEl && details.items) {
    orderItemsEl.innerHTML = '';
    details.items.forEach(function(item) {
      var qty = item.quantity || 1;
      orderItemsEl.innerHTML += `
        <div class="summary-item">
          <span>${item.name} x${qty}</span>
          <span>$${item.price * qty}</span>
        </div>
      `;
    });
  }

  var orderAddrEl = document.getElementById('orderAddress');
  if (orderAddrEl && details.shipping) {
    var s = details.shipping;
    orderAddrEl.textContent = s.name + ', ' + s.address + ', ' + s.city + ', ' + s.state + ' ' + s.zip;
  }

  var orderPayEl = document.getElementById('orderPayment');
  if (orderPayEl && details.payment) {
    orderPayEl.textContent = 'Card ending in ****' + details.payment.cardLast4;
  }

  var orderTotalEl = document.getElementById('orderTotal');
  if (orderTotalEl) orderTotalEl.textContent = '$' + details.total;
}

if (document.getElementById('orderNumber')) {
  loadOrderDetails();
}
