document.getElementById("checkoutForm").addEventListener("submit", function(e) {
  e.preventDefault();
  document.getElementById("successMessage").innerText =
    "Order placed successfully!";
});