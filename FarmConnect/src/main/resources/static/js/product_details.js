/* Product Details Page Logic */

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the crop data saved in localStorage
    const storedCrop = localStorage.getItem('selectedCrop');
    if (!storedCrop) {
        console.error("No crop data found in localStorage.");
        document.getElementById('productDetails').innerHTML = '<div class="error-message">Product not found. Please go back to the catalog.</div>';
        return;
    }

    // Convert the JSON string back into a JavaScript object
    const crop = JSON.parse(storedCrop);
    console.log("Loaded crop data:", crop);

    // Find the container where you want to render the crop details
    const container = document.getElementById('productDetails');
    if (!container) {
        console.error("Container with id 'productDetails' not found.");
        return;
    }

    // Ensure we have a description, even if it's a default one
    const description = crop.description || "No description available for this product. Our organic produce is harvested with care to ensure the highest quality for your kitchen.";

    // Use the Cloudinary URL from the stored crop data
    const imgSrc = crop.image || '/img/default-crop.jpg';

    // Construct the HTML for displaying the crop details
    container.innerHTML = `
        <div class="product-detail-container animate-fade-in">
            <div class="product-detail-card" data-name="${crop.name}">
                <div class="product-image-container">
                    <img src="${imgSrc}" alt="${crop.name}" class="product-detail-image" 
                         onerror="this.onerror=null; this.src='/img/default-crop.jpg';">
                </div>
                <div class="product-detail-info">
                    <h2 class="product-title">${crop.name}</h2>
                    <p class="product-category">${crop.category || 'Organic Produce'}</p>
                    
                    <div class="price-container">
                        <h3 class="product-price">₹${parseFloat(crop.price || 0).toFixed(2)}</h3>
                        ${crop.label ? `<span class="product-label" style="background-color: ${crop.color || 'var(--primary-color)'}">${crop.label}</span>` : ''}
                    </div>
                    
                    <div class="product-description">
                        <h4>Description:</h4>
                        <p>${description}</p>
                    </div>
                    
                    <div class="product-actions">
                        <div class="quantity-selector">
                            <label for="quantity">Quantity:</label>
                            <select id="quantity" onchange="updateTotal()">
                                ${Array.from({ length: Math.min(crop.quantity || 10, 10) }, (_, i) =>
                                    `<option value="${i + 1}">${i + 1}</option>`
                                ).join('')}
                            </select>
                            <p class="stock-info">Only ${crop.quantity || 'a few'} units left!</p>
                        </div>

                        <div class="total-price">
                            <label for="total">Total:</label>
                            <span id="total">₹${parseFloat(crop.price || 0).toFixed(2)}</span>
                        </div>

                        <div class="button-group">
                            <button class="add-to-cart-btn" onclick="addToCart()">
                                <i class="fas fa-shopping-cart"></i> Add to Cart
                            </button>
                            <button class="buy-now-btn" onclick="buyNow()">
                                <i class="fas fa-bolt"></i> Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Initialize global functions
    window.updateTotal = function () {
        const cropData = JSON.parse(localStorage.getItem('selectedCrop'));
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const totalElement = document.getElementById('total');

        if (cropData && totalElement) {
            const total = parseFloat(cropData.price || 0) * quantity;
            totalElement.textContent = `₹${total.toFixed(2)}`;
        }
    };

    window.addToCart = function () {
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const cropData = JSON.parse(localStorage.getItem('selectedCrop'));

        // Get existing cart items or initialize empty array
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(item => item.cropId === cropData.cropId);

        if (existingItemIndex !== -1) {
            // Update existing item quantity
            cartItems[existingItemIndex].quantity += quantity;
        } else {
            const imgElement = document.querySelector('.product-detail-image');
            const actualImgSrc = imgElement ? imgElement.src : (cropData.image || '/img/default-crop.jpg');

            // Add new item to cart
            cartItems.push({
                cropId: cropData.cropId,
                name: cropData.name,
                price: parseFloat(cropData.price || 0),
                quantity: quantity,
                image: actualImgSrc,
                category: cropData.category || 'General'
            });
        }

        // Save updated cart
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
        // Custom animation or notification could go here
        alert(`Added ${quantity} units of ${cropData.name} to your cart`);
    };

    window.buyNow = function () {
        window.addToCart();
        window.location.href = '/addcart'; // Assuming this is the cart page
    };
});
