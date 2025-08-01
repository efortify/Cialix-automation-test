document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSummaryContainer = document.getElementById('cart-summary');
  const cartTotalSpan = document.getElementById('cart-total');
  const clearCartButton = document.getElementById('clear-cart');
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let total = 0;

  function renderCart() {
    console.log('Rendering cart with items:', cart);
    cartItemsContainer.innerHTML = '';
    cartSummaryContainer.innerHTML = '';
    total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML =
        '<p class="text-white">Your cart is empty.</p>';
      cartSummaryContainer.innerHTML = '<p>No items in cart.</p>';
      cartTotalSpan.textContent = '$0.00';
      clearCartButton.style.display = 'none';
      return;
    }

    clearCartButton.style.display = 'inline-block';

    cart.forEach((item, index) => {
      const itemPrice = parseFloat(item.price.replace('$', ''));
      const itemQuantity = parseInt(item.quantity);
      const itemTotal = itemPrice * itemQuantity;
      total += itemTotal;

      // Render cart items (cards)
      const cartItemCard = document.createElement('div');
      cartItemCard.classList.add('col');
      cartItemCard.innerHTML = `
        <div class="card bg-dark text-white">
          <img src="${item.image}" class="card-img-top" alt="${
        item.name
      }" style="height: 200px; object-fit: contain; padding: 10px;">
          <div class="card-body">
            <h5 class="card-title">${item.name}</h5>
            <p class="card-text">Price: ${item.price}</p>
            ${
              item.isSubscription
                ? `<p class="card-text"><small class="text-success">✓ Subscription - ${
                    item.subscriptionDetails?.description ||
                    'Subscribe and Save'
                  }</small></p>`
                : ''
            }
            <div class="d-flex align-items-center mb-3">
              <label class="me-2">Quantity:</label>
              <select class="form-select form-select-sm me-2" style="width: auto;" data-index="${index}">
                <option value="1" ${
                  item.quantity === 1 ? 'selected' : ''
                }>1</option>
                <option value="2" ${
                  item.quantity === 2 ? 'selected' : ''
                }>2</option>
                <option value="3" ${
                  item.quantity === 3 ? 'selected' : ''
                }>3</option>
                <option value="4" ${
                  item.quantity === 4 ? 'selected' : ''
                }>4</option>
                <option value="5" ${
                  item.quantity === 5 ? 'selected' : ''
                }>5</option>
              </select>
              <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">Remove</button>
            </div>
            <p class="card-text"><strong>Total: $${itemTotal.toFixed(
              2
            )}</strong></p>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(cartItemCard);

      // Render cart summary line item
      const summaryItem = document.createElement('div');
      summaryItem.classList.add('d-flex', 'justify-content-between', 'mb-2');
      summaryItem.innerHTML = `
        <span>${item.name} (x${item.quantity})</span>
        <span>$${itemTotal.toFixed(2)}</span>
      `;
      cartSummaryContainer.appendChild(summaryItem);
    });

    cartTotalSpan.textContent = `$${total.toFixed(2)}`;
    window.dispatchEvent(new Event('cartUpdated'));

    // Add event listeners for quantity changes
    const quantitySelects = document.querySelectorAll('select[data-index]');
    quantitySelects.forEach((select) => {
      select.addEventListener('change', (e) => {
        const index = parseInt(e.target.dataset.index);
        const newQuantity = parseInt(e.target.value);
        updateItemQuantity(index, newQuantity);
      });
    });
  }

  function updateItemQuantity(index, newQuantity) {
    if (index >= 0 && index < cart.length) {
      cart[index].quantity = newQuantity;
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }
  }

  function removeItem(index) {
    if (index >= 0 && index < cart.length) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      renderCart();
    }
  }

  // Make removeItem function globally available
  window.removeItem = removeItem;

  // Initial render
  renderCart();

  // Clear cart functionality
  clearCartButton.addEventListener('click', () => {
    localStorage.removeItem('cart');
    cart = []; // Clear the local cart array
    renderCart(); // Re-render the cart
  });
});
