/* Shopping Cart Logic */

document.addEventListener('DOMContentLoaded', function () {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const cartContainer = document.getElementById('cart');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const confirmOrderButton = document.getElementById('confirmOrder');

    function saveCartItems() {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }

    function renderCartItems() {
        if (!cartContainer) return;
        cartContainer.innerHTML = '';

        if (!cartItems.length) {
            if (emptyCartMessage) emptyCartMessage.classList.remove('hidden');
            if (confirmOrderButton) confirmOrderButton.classList.add('hidden');
            return;
        }

        if (emptyCartMessage) emptyCartMessage.classList.add('hidden');
        if (confirmOrderButton) confirmOrderButton.classList.remove('hidden');

        cartItems.forEach((item, index) => {
            let imgSrc = item.image || '/img/default-crop.jpg';
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-image">
                    <img src="${imgSrc}" alt="${item.name}" 
                         onerror="this.onerror=null;this.src='/img/default-crop.jpg';">
                </div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>Price: ₹${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                    </div>
                    <button class="delete-btn" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartContainer.appendChild(itemEl);
        });

        const total = cartItems.reduce((sum, item) =>
            sum + ((parseFloat(item.price) || 0) * item.quantity), 0);
        
        const totalEl = document.createElement('div');
        totalEl.className = 'cart-total-container';
        totalEl.innerHTML = `
            <div class="cart-total">
                <span>Total Amount:</span>
                <span>₹${total.toFixed(2)}</span>
            </div>
        `;
        cartContainer.appendChild(totalEl);

        // Re-attach event listeners
        document.querySelectorAll('.decrease-btn').forEach(btn => btn.addEventListener('click', decreaseQuantity));
        document.querySelectorAll('.increase-btn').forEach(btn => btn.addEventListener('click', increaseQuantity));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', deleteItem));
    }

    function decreaseQuantity(e) {
        const index = +e.currentTarget.dataset.index;
        if (cartItems[index].quantity > 1) {
            cartItems[index].quantity--;
            saveCartItems();
            renderCartItems();
        }
    }

    function increaseQuantity(e) {
        const index = +e.currentTarget.dataset.index;
        cartItems[index].quantity++;
        saveCartItems();
        renderCartItems();
    }

    function deleteItem(e) {
        const index = +e.currentTarget.dataset.index;
        if (confirm(`Are you sure you want to remove ${cartItems[index].name} from your cart?`)) {
            cartItems.splice(index, 1);
            saveCartItems();
            renderCartItems();
        }
    }

    function redirectOrder() {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            window.location.href = '/wholesalerlogin';
            return;
        }

        // Show loading state
        if (confirmOrderButton) {
            confirmOrderButton.disabled = true;
            confirmOrderButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        fetch('/checkout', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(res => {
            if (res.status === 401) {
                localStorage.removeItem('jwtToken');
                window.location.href = '/wholesalerlogin';
                return null;
            }
            return res.text();
        })
        .then(html => {
            if (html) {
                document.open();
                document.write(html);
                document.close();
                window.history.pushState({}, '', '/checkout');
            }
        })
        .catch(err => {
            console.error('Checkout redirect error:', err);
            alert('Something went wrong. Please try again.');
            if (confirmOrderButton) {
                confirmOrderButton.disabled = false;
                confirmOrderButton.innerHTML = 'Confirm Order';
            }
        });
    }

    if (confirmOrderButton) {
        confirmOrderButton.addEventListener('click', function () {
            if (!cartItems.length) {
                alert("Your cart is empty.");
                return;
            }

            const token = localStorage.getItem('jwtToken');
            if (!token) {
                window.location.href = '/wholesalerlogin';
            } else {
                redirectOrder();
            }
        });
    }

    renderCartItems();
});
