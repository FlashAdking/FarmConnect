/* Checkout Logic */

document.addEventListener("DOMContentLoaded", () => {
    // Load cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartContainer = document.querySelector(".cart-items");

    if (!cartContainer) return;

    // Clear existing items
    cartContainer.innerHTML = '';

    // Render cart items
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `
          <div class="p-4 text-center text-gray-500">
            Your cart is empty. Please add some items.
          </div>
        `;
    } else {
        cartItems.forEach(item => {
            // Determine the correct image path
            let imgSrc = '/img/default-crop.jpg';

            // Check if imageName exists (from older cart format)
            if (item.imageName) {
                imgSrc = `/api/crops/image/${item.imageName}`;
            }
            // Check if we have a direct image path
            else if (item.image && item.image.trim() !== "" && !item.image.includes('default-crop')) {
                imgSrc = item.image;
            }
            // Fallback to cropId-based image path
            else if (item.cropId) {
                imgSrc = `/crops/${item.cropId}/image`;
            }

            const div = document.createElement("div");
            div.className = "cart-item animate-fade-in";
            div.innerHTML = `
            <img src="${imgSrc}" alt="${item.name}" 
                 onerror="this.onerror=null;this.src='/img/default-crop.jpg';" />
            <div class="item-details">
              <h3>${item.name}</h3>
              <p>${item.description || 'No description available'}</p>
              <p>Quantity: ${item.quantity || 1}</p>
              <span class="price">₹${item.price}</span>
            </div>
            <button class="remove-item" data-cropid="${item.cropId}">
              <i class="fa fa-trash"></i>
            </button>
          `;
            cartContainer.appendChild(div);
        });

        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', () => {
                const cropId = button.getAttribute('data-cropid');
                removeFromCart(cropId);
            });
        });
    }

    // Update order summary
    updateOrderSummary(cartItems);

    // Set up place order button
    const placeOrderBtn = document.querySelector(".place-order-btn");
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener("click", handlePlaceOrder);
    }
});

// Function to remove item from cart
function removeFromCart(cropId) {
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    cartItems = cartItems.filter(item => item.cropId !== cropId);
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    // Reload the page to reflect changes
    location.reload();
}

// Function to update order summary
function updateOrderSummary(cartItems) {
    // Calculate total by considering quantity
    const subtotal = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
    }, 0);

    const shipping = subtotal > 0 ? 30 : 0;
    const total = subtotal + shipping;

    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (shippingEl) shippingEl.textContent = `₹${shipping}`;
    if (totalEl) totalEl.textContent = `₹${total}`;
}

// Function to handle order placement
async function handlePlaceOrder() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/wholesalerlogin';
        return;
    }

    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

    // Temporary fix for cropId
    const selectedCrop = JSON.parse(localStorage.getItem('selectedCrop'));
    if (selectedCrop) {
        cartItems.forEach(item => {
            if (!item.cropId && item.name === selectedCrop.name) {
                item.cropId = selectedCrop.cropId;
            }
        });
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }

    if (!cartItems.length) {
        alert("Cart is empty");
        return;
    }

    // Get shipping details
    const nameInput = document.querySelector("input[placeholder='Enter your name']");
    const phoneInput = document.querySelector("input[placeholder='Enter mobile number']");
    const addressInput = document.querySelector("input[placeholder='Address']");
    const cityInput = document.querySelector("input[placeholder='City']");

    const name = nameInput ? nameInput.value : '';
    const phone = phoneInput ? phoneInput.value : '';
    const address = addressInput ? addressInput.value : '';
    const city = cityInput ? cityInput.value : '';

    // Validate form fields
    if (!name || !phone || !address || !city) {
        alert("Please fill in all shipping details");
        return;
    }

    const paymentMethodChecked = document.querySelector("input[name='payment']:checked");
    const paymentMethod = paymentMethodChecked ? paymentMethodChecked.id : 'cod';
    
    const deliveryLocation = `${address}, ${city}`;
    const pickupLocation = "Warehouse"; // Default pickup location

    // Calculate total price with quantities
    const totalPrice = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
    }, 0);

    try {
        // Ensure all items have necessary fields
        const processedCartItems = cartItems.map(item => {
            if (!item.cropId) {
                throw new Error(`Cart item ${item.name} has no cropId`);
            }
            return {
                cropId: item.cropId,
                name: item.name,
                price: parseFloat(item.price) || 0,
                farmerId: item.farmerId,
                quantity: item.quantity || 1,
                description: item.description || ''
            };
        });

        const confirmedDeal = {
            pickupLocation,
            deliveryLocation,
            crops: processedCartItems,
            totalPrice,
            orderDate: new Date(),
            cashOnDelivery: paymentMethod === 'cod',
            upi: paymentMethod === 'upi'
        };

        const response = await fetch('/Deals/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify([confirmedDeal])
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Order placement failed');
        }

        alert("Order placed successfully!");
        localStorage.removeItem('cartItems');
        window.location.href = '/order-success'; 
    } catch (err) {
        console.error("Error placing order:", err);
        alert("Error: " + (err.message || "Something went wrong. Please try again."));
    }
}
