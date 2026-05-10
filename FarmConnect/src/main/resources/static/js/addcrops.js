/* Add Crops Logic */

document.addEventListener("DOMContentLoaded", () => {
    // Check if token exists
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // No token found, redirect to login
        window.location.href = '/farmerlogin';
        return;
    }

    const addCropForm = document.querySelector(".add-crop-form form");
    if (addCropForm) {
        addCropForm.addEventListener("submit", handleAddCrop);
    }
});

async function handleAddCrop(event) {
    event.preventDefault();
    
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        window.location.href = '/farmerlogin';
        return;
    }

    const name = document.getElementById("name").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const quantity = document.getElementById("quantity").value;
    const category = document.getElementById("category").value;
    
    const labels = Array.from(document.querySelectorAll(".checkbox-group input:checked"))
                        .map(cb => cb.value);

    const cropData = {
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        category,
        labels
    };

    try {
        const response = await fetch('/api/crops/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(cropData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to add crop');
        }

        alert("Crop added successfully!");
        window.location.href = '/profile';
    } catch (err) {
        console.error("Error adding crop:", err);
        alert("Error: " + (err.message || "Failed to add crop"));
    }
}
