function addToCart(name, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.push({ name, price });

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart!");
}

function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let cartDiv = document.getElementById("cartItems");
  let total = 0;

  if (!cartDiv) return;

  cartDiv.innerHTML = "";

  cart.forEach((item, index) => {
    total += item.price;

    cartDiv.innerHTML += `
      <div>
        ${item.name} - $${item.price}
        <button onclick="removeItem(${index})">Remove</button>
      </div>
      <hr/>
    `;
  });

  document.getElementById("totalAmount").innerText =
    "Total: $" + total;
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

if (document.getElementById("cartItems")) {
  loadCart();
}

if (document.getElementById("checkoutForm")) {
  document.getElementById("checkoutForm").addEventListener("submit", function(e) {
    e.preventDefault();
    localStorage.removeItem("cart");
    window.location.href = "success.html";
  });
}