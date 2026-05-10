// Global variables
let currentFarmer = null;
let currentFarmerId = null;

// Function to get the JWT token from localStorage
function getToken() {
    return localStorage.getItem('jwtToken');
}

// Function to handle API errors consistently 
function handleApiError(error, message) {
    console.error(`${message}:`, error);
    alert(`${message}. Please try again later.`);
}

// Function to load farmer data
function loadFarmerData() {
    const token = getToken();

    fetch('/api/farmer/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load farmer profile');
            }
            return response.json();
        })
        .then(data => {
            // Store farmer data globally
            currentFarmer = data;
            currentFarmerId = data.uniqueId;

            // Update profile information
            document.getElementById('farmerName').textContent = data.fullName;
            document.getElementById('farmerAddress').textContent = data.address || 'N/A';
            document.getElementById('farmerState').textContent = data.state || 'N/A';
            document.getElementById('farmerContact').textContent = data.emailOrPhone || 'N/A';
            document.getElementById('farmerEmail').textContent = data.emailOrPhone || 'N/A';
            document.getElementById('farmerLand').textContent = data.landInAcre || 'N/A';

            // Load farmer image with cache-busting - fixed path
            if (data.uniqueId) {
                document.getElementById('farmerImage').src = `/farmers/${data.uniqueId}/image?${new Date().getTime()}`;
            }

            // Pre-fill edit profile form
            document.getElementById('fullname').value = data.fullName || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('state').value = data.state || '';
            document.getElementById('landInAcre').value = data.landInAcre || '';
            document.getElementById('emailOrPhone').value = data.emailOrPhone || '';
        })
        .catch(error => handleApiError(error, 'Failed to load profile information'));
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // Try to parse DD-MM-YYYY format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            // Convert DD-MM-YYYY to MM-DD-YYYY for parsing
            const newDate = new Date(`${parts[1]}-${parts[0]}-${parts[2]}`);
            if (!isNaN(newDate.getTime())) {
                return newDate.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }
        }
        return dateString; // Return original if parsing fails
    }

    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Function to load farmer crops
function loadFarmerCrops() {
    const token = getToken();

    fetch('/api/farmer/crops', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load crops');
            }
            return response.json();
        })
        .then(crops => {
            const cropListElement = document.getElementById('cropList');

            if (crops.length === 0) {
                cropListElement.innerHTML = '<p class="text-center">No crops added yet.</p>';
                return;
            }

            let cropListHtml = '';
            crops.forEach(crop => {
                const imageUrl = `/crops/${crop.cropId}/image?${new Date().getTime()}`;
                console.log("Crop ID for Edit button:", crop.cropId);

                cropListHtml += `
                <div class="crop-item">
                    <div class="crop-image">
                        <img src="${imageUrl}" alt="${crop.name}">
                    </div>
                    <div class="crop-info">
                        <h3>${crop.name}</h3>
                        <p>${crop.description}</p>
                        <p><strong>Category:</strong> ${crop.category}</p>
                        <p><strong>Price:</strong> ₹${crop.price}</p>
                        <p><strong>Quantity:</strong> ${crop.quantity}</p>
                        <p><strong>Available:</strong> ${crop.productAvailable ? 'Yes' : 'No'}</p>
                        <p><strong>Release Date:</strong> ${formatDate(crop.releaseDate)}</p>
                    </div>
                    <div class="crop-actions">
                        <button class="btn edit-btn" onclick="showEditCropModal('${crop.cropId}')">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="btn delete-btn" onclick="showDeleteCropModal('${crop.cropId}')">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            });

            cropListElement.innerHTML = cropListHtml;
        })
        .catch(error => {
            console.error('Error loading crops:', error);
            document.getElementById('cropList').innerHTML = '<p class="text-center">Failed to load crops.</p>';
        });
}

// Function to load confirmed deals
function loadConfirmedDeals() {
    const token = getToken();

    fetch('/api/farmer/deals', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load deals');
            }
            return response.json();
        })
        .then(deals => {
            const dealsListElement = document.getElementById('dealsList');
            let totalSalesAmount = 0;

            if (!deals || deals.length === 0) {
                dealsListElement.innerHTML = '<p class="text-center">No deals confirmed yet.</p>';
                document.getElementById('totalSales').textContent = '₹0';
                return;
            }

            let dealsListHtml = '';
            deals.forEach(deal => {
                if (!deal.dealId) return;

                const orderDate = deal.orderDate ? new Date(deal.orderDate) : null;
                const formattedDate = orderDate && !isNaN(orderDate.getTime())
                    ? orderDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'N/A';

                let cropsHtml = '';
                if (deal.crops && Array.isArray(deal.crops)) {
                    deal.crops.forEach(crop => {
                        const cropName = crop.name || 'N/A';
                        const cropPrice = parseFloat(crop.price) || 0;
                        const cropQuantity = parseInt(crop.quantity) || 0;
                        const cropTotal = cropPrice * cropQuantity;
                        cropsHtml += `<div class="crop-item">
                              <p><strong>Crop:</strong> ${cropName}</p>
                              <p><strong>Price:</strong> ₹${cropPrice}</p>
                              <p><strong>Quantity:</strong> ${cropQuantity}</p>
                              <p><strong>Total:</strong> ₹${cropTotal}</p>
                            </div>`;
                    });
                }

                totalSalesAmount += parseFloat(deal.totalPrice) || 0;

                let paymentMethod = '';
                if (deal.cashOnDelivery && deal.upi) {
                    paymentMethod = 'Cash on Delivery / UPI';
                } else if (deal.cashOnDelivery) {
                    paymentMethod = 'Cash on Delivery';
                } else if (deal.upi) {
                    paymentMethod = 'UPI';
                } else {
                    paymentMethod = 'N/A';
                }

                dealsListHtml += `
            <div class="deal-item">
              <div class="deal-header">
                <h3>Deal #${deal.dealId}</h3>
                <p>${formattedDate}</p>
              </div>
              <div class="deal-crops">
                ${cropsHtml || `<p><strong>Crops:</strong> N/A</p>`}
              </div>
              <p><strong>Total Amount:</strong> ₹${deal.totalPrice || 'N/A'}</p>
              <p><strong>Payment Method:</strong> ${paymentMethod}</p>
              ${deal.user ? `<p><strong>Buyer:</strong> ${deal.user.fullName || 'N/A'}</p>` : '<p><strong>Buyer:</strong> N/A</p>'}
              ${deal.transporter ? `<p><strong>Transporter:</strong> ${deal.transporter.fullName || 'N/A'}</p>` : ''}
              ${deal.pickupLocation ? `<p><strong>Pickup:</strong> ${deal.pickupLocation}</p>` : ''}
              ${deal.deliveryLocation ? `<p><strong>Delivery:</strong> ${deal.deliveryLocation}</p>` : ''}
            </div>
          `;
            });

            dealsListElement.innerHTML = dealsListHtml;
            document.getElementById('totalSales').textContent = `₹${totalSalesAmount}`;
        })
        .catch(error => {
            console.error('Error loading deals:', error);
            document.getElementById('dealsList').innerHTML = '<p class="text-center">Failed to load deals.</p>';
        });
}


// Function to update farmer profile
function updateFarmerProfile(formData) {
    const token = getToken();

    fetch('/api/farmer/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            return response.json();
        })
        .then(data => {
            alert('Profile updated successfully!');
            loadFarmerData();
            document.getElementById('editProfileModal').style.display = 'none';
        })
        .catch(error => handleApiError(error, 'Failed to update profile'));
}

// Function to add a new crop
function addCrop(formData) {
    const token = getToken();
    formData.append('farmerId', currentFarmerId);

    fetch('/api/crops/add', {
        method: 'POST',
        headers: {
            'Authorization': token
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to add crop');
            }
            return response.json();
        })
        .then(data => {
            alert('Crop added successfully!');
            loadFarmerCrops();
            document.getElementById('addCropModal').style.display = 'none';
            document.getElementById('addCropForm').reset();
        })
        .catch(error => handleApiError(error, 'Failed to add crop'));
}

// Fixed function to update a crop
function updateCrop(cropId, formData) {
    const token = getToken();

    // Ensure farmerId is included
    formData.append('farmerId', currentFarmerId);

    fetch(`/api/crops/${cropId}/update`, {
        method: 'PUT',
        headers: {
            'Authorization': token
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Failed to update crop: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Crop updated successfully!');
            loadFarmerCrops();
            document.getElementById('editCropModal').style.display = 'none';
            // Reset the form
            document.getElementById('editCropForm').reset();
        })
        .catch(error => handleApiError(error, 'Failed to update crop'));
}

// Function to delete a crop
// Function to delete a crop
function deleteCrop(cropId) {
    const token = getToken();

    fetch(`/api/crops/${cropId}/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(message => {
                    throw new Error(message || 'Failed to delete crop');
                });
            }
            return response.text(); // Parse as plain text
        })
        .then(message => {
            alert(message); // Will show "Crop deleted successfully"
            loadFarmerCrops(); // Refresh crops
            document.getElementById('deleteCropModal').style.display = 'none';
        })
        .catch(error => handleApiError(error, 'Failed to delete crop'));
}


// Function to upload farmer profile image
function uploadProfileImage(formData) {
    const token = getToken();
    console.log("Uploading image for farmer ID:", currentFarmerId);

    fetch(`/farmers/${currentFarmerId}/uploadImage`, {
        method: 'PUT',
        headers: {
            'Authorization': token
        },
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Failed to upload image: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Profile image updated successfully!');
            document.getElementById('farmerImage').src = `/farmers/${currentFarmerId}/image?${new Date().getTime()}`;
            document.getElementById('uploadImageForm').style.display = 'none';
        })
        .catch(error => handleApiError(error, 'Failed to upload image'));
}

// Function to load crop details for editing
function getCropDetails(cropId) {
    const token = getToken();
    console.log("Getting crop details for ID:", cropId);

    return fetch(`/api/crops/${cropId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Failed to load crop details: ${text}`);
                });
            }
            return response.json();
        });
}

// Function to show edit crop modal
function showEditCropModal(cropId) {
    getCropDetails(cropId)
        .then(crop => {
            document.getElementById('editCropId').value = crop.cropId;
            document.getElementById('editName').value = crop.name;
            document.getElementById('editDescription').value = crop.description;
            document.getElementById('editPrice').value = crop.price;
            document.getElementById('editCategory').value = crop.category;
            document.getElementById('editQuantity').value = crop.quantity;
            if (crop.releaseDate) {
                let formattedDate = formatDateForInput(crop.releaseDate);
                document.getElementById('editReleaseDate').value = formattedDate;
            }
            document.getElementById('editProductAvailable').value = crop.productAvailable.toString();
            document.getElementById('editCropModal').style.display = 'block';
        })
        .catch(error => handleApiError(error, 'Failed to load crop details'));
}

// Helper function to format date for input field
function formatDateForInput(dateString) {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
        if (parts[0].length === 4) {
            // Convert YYYY-MM-DD to DD-MM-YYYY
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        // Already in DD-MM-YYYY format
        return dateString;
    }

    // Try parsing as date object
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    }

    return dateString;
}

// Function to show delete crop modal
function showDeleteCropModal(cropId) {
    document.getElementById('deleteCropId').value = cropId;
    document.getElementById('deleteCropModal').style.display = 'block';
}

// Function to check authorization and redirect if not logged in
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/farmerlogin';
        return false;
    }
    return true;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    // Load initial data
    loadFarmerData();
    loadFarmerCrops();
    loadConfirmedDeals();

    // Set up event listeners for modals
    setupModalEventListeners();

    // Set up form submissions
    setupFormEventListeners();
});

// Setup modal event listeners
function setupModalEventListeners() {
    // Edit Profile Modal
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditProfile = document.getElementById('closeEditProfile');
    const cancelEditProfile = document.getElementById('cancelEditProfile');

    if (editProfileBtn) editProfileBtn.onclick = () => editProfileModal.style.display = 'block';
    if (closeEditProfile) closeEditProfile.onclick = () => editProfileModal.style.display = 'none';
    if (cancelEditProfile) cancelEditProfile.onclick = () => editProfileModal.style.display = 'none';

    // Add Crop Modal
    const showAddCropBtn = document.getElementById('showAddCropForm');
    const addCropModal = document.getElementById('addCropModal');
    const closeAddCrop = document.getElementById('closeAddCrop');
    const cancelAddCrop = document.getElementById('cancelAddCrop');

    if (showAddCropBtn) {
        showAddCropBtn.onclick = () => {
            addCropModal.style.display = 'block';
            document.getElementById('releaseDate').value = new Date().toISOString().split('T')[0];
        };
    }
    if (closeAddCrop) closeAddCrop.onclick = () => addCropModal.style.display = 'none';
    if (cancelAddCrop) cancelAddCrop.onclick = () => addCropModal.style.display = 'none';

    // Edit Crop Modal
    const closeEditCrop = document.getElementById('closeEditCrop');
    const cancelEditCrop = document.getElementById('cancelEditCrop');

    if (closeEditCrop) closeEditCrop.onclick = () => document.getElementById('editCropModal').style.display = 'none';
    if (cancelEditCrop) cancelEditCrop.onclick = () => document.getElementById('editCropModal').style.display = 'none';

    // Delete Crop Modal
    const closeDeleteCrop = document.getElementById('closeDeleteCrop');
    const cancelDeleteCrop = document.getElementById('cancelDeleteCrop');
    const confirmDeleteCrop = document.getElementById('confirmDeleteCrop');

    if (closeDeleteCrop) closeDeleteCrop.onclick = () => document.getElementById('deleteCropModal').style.display = 'none';
    if (cancelDeleteCrop) cancelDeleteCrop.onclick = () => document.getElementById('deleteCropModal').style.display = 'none';
    if (confirmDeleteCrop) {
        confirmDeleteCrop.onclick = () => {
            const cropId = document.getElementById('deleteCropId').value;
            deleteCrop(cropId);
        };
    }

    // Close modals when clicking outside
    window.onclick = (event) => {
        if (event.target === editProfileModal) editProfileModal.style.display = 'none';
        if (event.target === addCropModal) addCropModal.style.display = 'none';
        if (event.target === document.getElementById('editCropModal')) document.getElementById('editCropModal').style.display = 'none';
        if (event.target === document.getElementById('deleteCropModal')) document.getElementById('deleteCropModal').style.display = 'none';
    };
}

// Setup form event listeners
function setupFormEventListeners() {
    // Edit Profile Form
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        // Remove any existing listeners by cloning and replacing
        const newEditProfileForm = editProfileForm.cloneNode(true);
        editProfileForm.parentNode.replaceChild(newEditProfileForm, editProfileForm);

        newEditProfileForm.onsubmit = (event) => {
            event.preventDefault();
            const formData = {
                fullName: document.getElementById('fullname').value,
                address: document.getElementById('address').value,
                state: document.getElementById('state').value,
                landInAcre: parseFloat(document.getElementById('landInAcre').value),
                emailOrPhone: document.getElementById('emailOrPhone').value,
                uniqueId: currentFarmerId
            };
            updateFarmerProfile(formData);
        };
    }

    // Add Crop Form
    const addCropForm = document.getElementById('addCropForm');

    addCropForm.addEventListener('submit', function (event) {
        event.preventDefault();

        // Collect all field values
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const price = parseFloat(document.getElementById('price').value);
        const category = document.getElementById('category').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const releaseDateRaw = document.getElementById('releaseDate').value;
        const productAvailable = document.getElementById('productAvailable').value === 'true';
        const image = document.getElementById('cropImage').files[0];

        // Format release date (DD-MM-YYYY)
        let releaseDate = releaseDateRaw;
        if (releaseDateRaw) {
            const date = new Date(releaseDateRaw);
            releaseDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
        }

        // Create crop JSON
        const crop = {
            name,
            description,
            price,
            category,
            quantity,
            releaseDate,
            productAvailable,
            farmerId: currentFarmerId
        };

        // Construct final payload
        const payload = new FormData();
        payload.append("crop", JSON.stringify(crop));
        if (image) {
            payload.append("image", image);
        }

        addCrop(payload);
    });

    // Edit Crop Form
    const editCropForm = document.getElementById('editCropForm');
    if (editCropForm) {
        // Remove any existing listeners
        const newEditCropForm = editCropForm.cloneNode(true);
        editCropForm.parentNode.replaceChild(newEditCropForm, editCropForm);

        newEditCropForm.onsubmit = (event) => {
            event.preventDefault();
            const cropId = document.getElementById('editCropId').value;
            const formData = new FormData(newEditCropForm);

            // Format the release date correctly
            const releaseDate = document.getElementById('editReleaseDate').value;
            if (releaseDate) {
                const parts = releaseDate.split('-');
                if (parts.length === 3) {
                    // Ensure date is in DD-MM-YYYY format
                    const formattedDate = `${parts[0]}-${parts[1]}-${parts[2]}`;
                    formData.set('releaseDate', formattedDate);
                }
            }

            updateCrop(cropId, formData);
        };
    }

    // Profile Image Upload
    const uploadInput = document.getElementById('upload-photo');
    const uploadImageForm = document.getElementById('uploadImageForm');
    if (uploadInput) {
        // Remove any existing listeners
        const newUploadInput = uploadInput.cloneNode(true);
        uploadInput.parentNode.replaceChild(newUploadInput, uploadInput);

        newUploadInput.onchange = () => {
            if (newUploadInput.files.length > 0) {
                const formData = new FormData(uploadImageForm);
                uploadProfileImage(formData);
            }
        };
    }

    // Logout
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
        // Remove any existing listeners
        const newLogoutLink = logoutLink.cloneNode(true);
        logoutLink.parentNode.replaceChild(newLogoutLink, logoutLink);

        newLogoutLink.onclick = (event) => {
            event.preventDefault();
            localStorage.removeItem('jwtToken');
            window.location.href = '/farmerlogin';
        };
    }
}

// Make necessary functions globally available
window.showEditCropModal = showEditCropModal;
window.showDeleteCropModal = showDeleteCropModal;