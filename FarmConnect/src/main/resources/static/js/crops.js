/* Fresh Crops Logic */

document.addEventListener("DOMContentLoaded", function () {
    const filterForm = document.getElementById("filter-form");
    const priceRange = document.getElementById("price-range");
    const priceValue = document.getElementById("price-value");
    const products = document.querySelectorAll(".product-card");

    // Initialize cart count
    updateCartCount();

    // Update displayed price when range changes
    if (priceRange) {
        priceRange.addEventListener("input", function () {
            if (priceValue) priceValue.textContent = `₹${priceRange.value}`;
            applyFilters();
        });
    }

    // Event listener for all filter checkboxes
    if (filterForm) {
        filterForm.addEventListener("change", function (e) {
            if (e.target.classList.contains("filter-checkbox")) {
                applyFilters();
            }
        });
    }

    // Function to apply filters
    function applyFilters() {
        if (!filterForm) return;

        // Get filter values
        const selectedCategories = getFilterValues('category');
        const selectedLabels = getFilterValues('label');
        const selectedColors = getFilterValues('color');
        const selectedQuantities = getFilterValues('quantity');
        const maxPrice = priceRange ? parseInt(priceRange.value) : Infinity;

        // Iterate over all products
        products.forEach(function (product) {
            const productCategory = product.getAttribute('data-category');
            const productLabel = product.getAttribute('data-label');
            const productColor = product.getAttribute('data-color');
            const productQuantity = parseInt(product.getAttribute('data-quantity'));
            const productPrice = parseInt(product.getAttribute('data-price'));

            // Check if product satisfies all selected filters
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(productCategory);
            const matchesLabel = selectedLabels.length === 0 || selectedLabels.includes(productLabel);
            const matchesColor = selectedColors.length === 0 || selectedColors.includes(productColor);
            const matchesQuantity = selectedQuantities.length === 0 || selectedQuantities.some(qtyThreshold => productQuantity >= parseInt(qtyThreshold));
            const matchesPrice = productPrice <= maxPrice;

            if (matchesCategory && matchesLabel && matchesColor && matchesQuantity && matchesPrice) {
                product.style.display = "flex";
            } else {
                product.style.display = "none";
            }
        });
    }

    // Helper function to get selected values for a filter type
    function getFilterValues(type) {
        return Array.from(filterForm.querySelectorAll(`input[name='${type}']:checked`)).map(el => el.value);
    }

    // Function to reset all filters
    function resetFilters() {
        if (!filterForm) return;

        document.querySelectorAll("#filter-form input[type='checkbox']").forEach(function (checkbox) {
            checkbox.checked = false;
        });

        if (priceRange) {
            priceRange.value = priceRange.max;
            if (priceValue) priceValue.textContent = `₹${priceRange.value}`;
        }

        applyFilters();
    }

    // Expose resetFilters function to global scope
    window.resetFilters = resetFilters;

    // Initial filter application
    applyFilters();
});

// Cart and Storage functions
function updateCartCount() {
    let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
    const cartCountElem = document.querySelector('.cart-count');
    if (cartCountElem) {
        cartCountElem.textContent = cartItems.length;
    }
}

function saveCropToLocalStorage(anchor) {
    const productCard = anchor.closest('.product-card');
    if (!productCard) {
        console.error("Product card not found!");
        return;
    }

    const crop = {
        cropId: productCard.getAttribute('data-cropid'),
        name: productCard.querySelector('.product-info h3').innerText,
        category: productCard.getAttribute('data-category'),
        price: parseFloat(productCard.getAttribute('data-price')),
        label: productCard.getAttribute('data-label'),
        color: productCard.getAttribute('data-color'),
        quantity: parseInt(productCard.getAttribute('data-quantity'), 10),
        description: productCard.querySelector('.product-info p') ? productCard.querySelector('.product-info p').innerText : "",
        image: productCard.querySelector('.product-image img').src,
        farmerId: productCard.getAttribute('data-farmerid')
    };

    localStorage.setItem('selectedCrop', JSON.stringify(crop));
    console.log("Crop saved to localStorage:", crop);
}

function addCropToCart(button) {
    const productCard = button.closest('.product-card');
    if (!productCard) {
        console.error("Product card not found.");
        return;
    }

    const imgElement = productCard.querySelector('.product-image img');
    let cropImageURL = '/img/default-crop.jpg';

    if (imgElement) {
        if (imgElement.src && !imgElement.src.startsWith("blob:") && imgElement.src.trim() !== "") {
            cropImageURL = imgElement.src;
        } else {
            cropImageURL = imgElement.getAttribute("data-src") || '/img/default-crop.jpg';
        }
    }

    const cropNameElem = productCard.querySelector('.product-info h3');
    if (!cropNameElem) return;
    const cropName = cropNameElem.innerText.trim();

    const cropItem = {
        name: cropName,
        price: parseFloat(productCard.getAttribute('data-price')) || 0,
        category: productCard.getAttribute('data-category') || "Uncategorized",
        label: productCard.getAttribute('data-label') || "",
        color: productCard.getAttribute('data-color') || "",
        quantity: 10,
        image: cropImageURL,
        cropId: productCard.getAttribute('data-cropid') || "",
        farmerId: productCard.getAttribute('data-farmerid') || ""
    };

    if (window.Cart && typeof window.Cart.addItem === 'function') {
        window.Cart.addItem(cropItem);
        alert(`${cropName} has been added to your cart.`);
        updateCartCount();
    } else {
        // Fallback if window.Cart is not available yet
        let items = JSON.parse(localStorage.getItem("cartItems") || "[]");
        const idx = items.findIndex(item => item.cropId === cropItem.cropId);
        if (idx !== -1) {
            items[idx].quantity = parseInt(items[idx].quantity, 10) + parseInt(cropItem.quantity, 10);
        } else {
            items.push(cropItem);
        }
        localStorage.setItem("cartItems", JSON.stringify(items));
        alert(`${cropName} has been added to your cart.`);
        updateCartCount();
    }
}

// Global Cart Object
window.Cart = (function () {
    let items = JSON.parse(localStorage.getItem("cartItems") || "[]");

    function saveCart() {
        localStorage.setItem("cartItems", JSON.stringify(items));
    }

    function findItemIndex(cropId) {
        return items.findIndex(item => item.cropId === cropId);
    }

    return {
        addItem: function (item) {
            const idx = findItemIndex(item.cropId);
            if (idx !== -1) {
                items[idx].quantity = parseInt(items[idx].quantity, 10) + parseInt(item.quantity, 10);
            } else {
                items.push(item);
            }
            saveCart();
        },
        getItems: function () { return items; },
        removeItem: function (cropId) {
            const idx = findItemIndex(cropId);
            if (idx !== -1) {
                items.splice(idx, 1);
                saveCart();
            }
        },
        updateItemQuantity: function (cropId, quantity) {
            const idx = findItemIndex(cropId);
            if (idx !== -1) {
                items[idx].quantity = quantity;
                saveCart();
            }
        },
        clearCart: function () {
            items = [];
            saveCart();
        },
        getTotal: function () {
            return items.reduce((total, item) => total + (parseFloat(item.price) * parseInt(item.quantity, 10)), 0);
        },
        getItemCount: function () {
            return items.reduce((total, item) => total + parseInt(item.quantity, 10), 0);
        }
    };
})();
