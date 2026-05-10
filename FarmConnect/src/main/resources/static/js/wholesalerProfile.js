/* Wholesaler Profile Logic */

document.addEventListener('DOMContentLoaded', function () {
    // Check if token exists
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // No token found, redirect to login
        const loginUrl = document.body.dataset.loginUrl || '/wholesalerlogin';
        window.location.href = loginUrl;
        return;
    }

    // Initialize the page
    fetchWholesalerData();
    fetchConfirmedDeals();

    // Set up event listeners for edit profile button
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function () {
            // Get current values to prepopulate the edit form
            const infoValues = document.querySelectorAll('.info-value');
            if (infoValues.length >= 4) {
                document.getElementById('fullName').value = infoValues[0].textContent.trim();
                document.getElementById('email').value = infoValues[1].textContent.trim();
                document.getElementById('phoneNumber').value = infoValues[2].textContent.trim();
                document.getElementById('address').value = infoValues[3].textContent.trim();
            }
            // Show the modal
            document.getElementById('editProfileModal').style.display = 'block';
        });
    }

    // Close modals
    const closeEditProfileModal = document.getElementById('closeEditProfileModal');
    if (closeEditProfileModal) {
        closeEditProfileModal.addEventListener('click', () => {
            document.getElementById('editProfileModal').style.display = 'none';
        });
    }

    const closeChangeImageModal = document.getElementById('closeChangeImageModal');
    if (closeChangeImageModal) {
        closeChangeImageModal.addEventListener('click', () => {
            document.getElementById('changeImageModal').style.display = 'none';
        });
    }

    // Change image button
    const changeImageBtn = document.getElementById('changeImageBtn');
    if (changeImageBtn) {
        changeImageBtn.addEventListener('click', () => {
            document.getElementById('changeImageModal').style.display = 'block';
        });
    }

    // Show filename and preview when a file is selected
    const profileImageFile = document.getElementById('profileImageFile');
    if (profileImageFile) {
        profileImageFile.addEventListener('change', function (e) {
            const fileName = e.target.files[0]?.name || 'No file selected';
            const fileNameDisplay = document.getElementById('fileName');
            if (fileNameDisplay) fileNameDisplay.textContent = fileName;

            // Preview the image
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const preview = document.getElementById('imagePreview');
                    if (preview) {
                        preview.src = e.target.result;
                        preview.style.display = 'block';
                    }
                }
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }

    // Submit handlers
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const updatedProfile = {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                address: document.getElementById('address').value
            };
            updateWholesalerProfile(updatedProfile);
        });
    }

    const changeImageForm = document.getElementById('changeImageForm');
    if (changeImageForm) {
        changeImageForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const formData = new FormData();
            const fileInput = document.getElementById('profileImageFile');

            if (fileInput.files && fileInput.files[0]) {
                formData.append('profileImageFile', fileInput.files[0]);
                updateWholesalerImage(formData);
            } else {
                alert('Please select an image file');
            }
        });
    }

    // View all purchases button
    const viewAllPurchasesBtn = document.getElementById('viewAllPurchasesBtn');
    if (viewAllPurchasesBtn) {
        viewAllPurchasesBtn.addEventListener('click', () => {
            window.location.href = '/wholesaler/all-purchases';
        });
    }

    // Add Refresh button functionality
    const container = document.getElementById('purchasesList')?.parentElement;
    if (container && !document.querySelector('.refresh-button')) {
        const refreshButton = document.createElement('button');
        refreshButton.className = 'refresh-button';
        refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh Deals';
        refreshButton.onclick = fetchConfirmedDeals;
        container.insertBefore(refreshButton, container.firstChild);
    }
});

// API Calls
function fetchWholesalerData() {
    fetch('/api/wholesaler/profile')
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch wholesaler data');
            return response.json();
        })
        .then(data => {
            // Update dashboard statistics
            const totalPurchases = document.getElementById('totalPurchases');
            const amountSpent = document.getElementById('amountSpent');
            const farmersConnected = document.getElementById('farmersConnected');
            const pendingDeals = document.getElementById('pendingDeals');

            if (totalPurchases) totalPurchases.textContent = data.totalPurchases || 0;
            if (amountSpent) amountSpent.textContent = `₹${(data.amountSpent || 0).toLocaleString('en-IN')}`;
            if (farmersConnected) farmersConnected.textContent = data.farmersConnected || 0;
            if (pendingDeals) pendingDeals.textContent = data.pendingDeals || 0;

            // Update profile information
            const infoValues = document.querySelectorAll('.info-value');
            if (infoValues.length >= 4) {
                infoValues[0].textContent = data.fullName;
                infoValues[1].textContent = data.email;
                infoValues[2].textContent = data.phoneNumber;
                infoValues[3].textContent = data.address;
            }

            // Update profile image
            if (data.imageUrl) {
                const profileImg = document.getElementById('profileImage');
                if (profileImg) profileImg.src = data.imageUrl;
            }
        })
        .catch(error => console.error('Error fetching wholesaler data:', error));
}

function fetchConfirmedDeals() {
    const purchasesList = document.getElementById('purchasesList');
    if (!purchasesList) return;

    purchasesList.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading your purchases...</p>
        </div>
    `;

    fetch('/api/confirm-deals', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return response.json();
    })
    .then(deals => {
        purchasesList.innerHTML = '';

        if (!deals || deals.length === 0) {
            purchasesList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No Purchases Found</h3>
                    <p>You haven't made any confirmed purchases yet.</p>
                </div>
            `;
            return;
        }

        deals.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        deals.forEach(deal => {
            const dealElement = document.createElement('div');
            dealElement.classList.add('deal-card');

            const farmerName = deal.farmer?.fullName || 'Unknown Farmer';
            const farmerEmail = deal.farmer?.emailOrPhone || 'N/A';
            const farmerPhone = deal.farmer?.phoneNumber || 'N/A';
            const formattedDate = new Date(deal.orderDate).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            let totalQuantity = 0;
            let cropsHTML = '';

            if (deal.crops && deal.crops.length > 0) {
                cropsHTML = `
                    <table class="crops-table">
                        <thead>
                            <tr><th>Crop</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
                        </thead>
                        <tbody>
                            ${deal.crops.map(crop => {
                                const qty = crop.quantity || 0;
                                const price = crop.price || 0;
                                totalQuantity += qty;
                                return `<tr>
                                    <td>${crop.name}</td>
                                    <td>${qty} kg</td>
                                    <td>₹${price}/kg</td>
                                    <td>₹${qty * price}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                `;
            }

            const paymentMethod = deal.cashOnDelivery ? 'Cash on Delivery' : (deal.upi ? 'UPI' : 'Other');
            const paymentClass = deal.cashOnDelivery ? 'cash-icon' : (deal.upi ? 'upi-icon' : '');

            dealElement.innerHTML = `
                <div class="deal-header">
                    <div class="deal-date"><span class="date-text">${formattedDate}</span></div>
                    <div class="deal-id">ID: ${deal.dealId || 'N/A'}</div>
                </div>
                <div class="deal-info">
                    <div class="info-section">
                        <h3 class="section-title">Farmer</h3>
                        <div class="farmer-details">
                            <div class="farmer-name">${farmerName}</div>
                            <div class="farmer-contact">${farmerPhone}</div>
                        </div>
                    </div>
                    <div class="info-section">
                        <h3 class="section-title">Location</h3>
                        <div class="location-details">Pickup: ${deal.pickupLocation || 'N/A'}</div>
                    </div>
                    <div class="info-section">
                        <h3 class="section-title">Payment</h3>
                        <div class="payment-details ${paymentClass}">${paymentMethod}</div>
                    </div>
                </div>
                <div class="crops-container">${cropsHTML}</div>
                <div class="deal-summary">
                    <div class="summary-item">Total: ${totalQuantity} kg</div>
                    <div class="summary-item total-price">Total Price: ₹${(deal.totalPrice || 0).toLocaleString('en-IN')}</div>
                </div>
            `;
            purchasesList.appendChild(dealElement);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        purchasesList.innerHTML = `<div class="error-state"><p>Error loading deals.</p></div>`;
    });
}

function updateWholesalerProfile(updatedProfile) {
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    fetch('/api/wholesaler/update-profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(updatedProfile)
    })
    .then(response => {
        if (!response.ok) throw new Error('Update failed');
        return response.json();
    })
    .then(() => {
        alert('Profile updated successfully');
        document.getElementById('editProfileModal').style.display = 'none';
        fetchWholesalerData();
    })
    .catch(error => alert('Error: ' + error.message));
}

function updateWholesalerImage(formData) {
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute('content');
    fetch('/api/wholesaler/upload-image', {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': csrfToken
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Upload failed');
        return response.json();
    })
    .then(data => {
        alert(data.message);
        if (data.imageUrl) document.getElementById('profileImage').src = data.imageUrl;
        document.getElementById('changeImageModal').style.display = 'none';
    })
    .catch(error => alert('Error: ' + error.message));
}
