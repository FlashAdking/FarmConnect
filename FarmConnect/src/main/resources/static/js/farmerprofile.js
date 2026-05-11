// ============================================================
// farmerprofile.js — Farmer Profile Page Logic
// Depends on: global.js (loaded first in HTML)
// ============================================================

'use strict';

// ── State ─────────────────────────────────────────────────
let currentFarmer = null;
let currentFarmerId = null;

// ── Helpers ───────────────────────────────────────────────
function getToken() {
    return localStorage.getItem('jwtToken');
}

function handleApiError(error, message) {
    console.error(`[FarmerProfile] ${message}:`, error);
    showToast(`${message}. Please try again later.`, 'error');
}

// Open/close modals using CSS class (avoids inline style conflicts)
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('is-open');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('is-open');
}

// ── Date Utilities ────────────────────────────────────────
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    // Try DD-MM-YYYY
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const d = new Date(`${parts[1]}-${parts[0]}-${parts[2]}`);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }
    return dateString;
}

// Convert any date string to YYYY-MM-DD for <input type="date">
function formatDateForInput(dateString) {
    if (!dateString) return '';
    // Already YYYY-MM-DD?
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    // DD-MM-YYYY → YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    // Try parsing as Date object
    const d = new Date(dateString);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
    }
    return dateString;
}

// Convert YYYY-MM-DD (from date input) to DD-MM-YYYY (API format)
function formatDateForApi(isoDate) {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}-${m}-${y}`;
}


// ── Auth Guard ────────────────────────────────────────────
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = '/farmerlogin';
        return false;
    }
    return true;
}


// ── API: Load Farmer Data ─────────────────────────────────
function loadFarmerData() {
    fetch('/api/farmer/profile', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
        }
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to load farmer profile');
            return res.json();
        })
        .then(data => {
            currentFarmer = data;
            currentFarmerId = data.uniqueId;

            setText('farmerName', data.fullName);
            setText('farmerAddress', data.address || 'N/A');
            setText('farmerState', data.state || 'N/A');
            setText('farmerContact', data.emailOrPhone || 'N/A');
            setText('farmerEmail', data.emailOrPhone || 'N/A');
            setText('farmerLand', data.landInAcre ?? 'N/A');

            if (data.imageUrl) {
                const img = document.getElementById('farmerImage');
                if (img) img.src = data.imageUrl;
            }

            // Pre-fill edit form
            setValue('fullname', data.fullName || '');
            setValue('address', data.address || '');
            setValue('state', data.state || '');
            setValue('landInAcre', data.landInAcre ?? '');
            setValue('emailOrPhone', data.emailOrPhone || '');
        })
        .catch(err => handleApiError(err, 'Failed to load profile information'));
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
}


// ── API: Load Crops ───────────────────────────────────────
function loadFarmerCrops() {
    fetch('/api/farmer/crops', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
        }
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to load crops');
            return res.json();
        })
        .then(crops => {
            const list = document.getElementById('cropList');
            if (!list) return;

            if (!crops || crops.length === 0) {
                list.innerHTML = '<p class="empty-state"><i class="fa-solid fa-seedling"></i> No crops added yet.</p>';
                return;
            }

            list.innerHTML = crops.map(crop => {
                const img = crop.imageUrl || '/img/default-crop.jpg';
                return `
                <div class="crop-item">
                    <div class="crop-image">
                        <img src="${img}" alt="${escapeHtml(crop.name)}" loading="lazy">
                    </div>
                    <div class="crop-info">
                        <h3>${escapeHtml(crop.name)}</h3>
                        <p>${escapeHtml(crop.description)}</p>
                        <p><strong>Category:</strong> ${crop.category}</p>
                        <p><strong>Price:</strong> ₹${crop.price}</p>
                        <p><strong>Quantity:</strong> ${crop.quantity} kg</p>
                        <p><strong>Available:</strong> ${crop.productAvailable ? 'Yes' : 'No'}</p>
                        <p><strong>Release:</strong> ${formatDate(crop.releaseDate)}</p>
                    </div>
                    <div class="crop-actions">
                        <button class="btn edit-btn" onclick="showEditCropModal('${crop.cropId}')">
                            <i class="fa-solid fa-pen"></i> Edit
                        </button>
                        <button class="btn delete-btn" onclick="showDeleteCropModal('${crop.cropId}')">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </div>
                </div>`;
            }).join('');
        })
        .catch(err => {
            const list = document.getElementById('cropList');
            if (list) list.innerHTML = '<p class="empty-state">Failed to load crops.</p>';
            console.error('Error loading crops:', err);
        });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;');
}


// ── API: Load Deals ───────────────────────────────────────
function loadConfirmedDeals() {
    fetch('/api/farmer/deals', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
        }
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to load deals');
            return res.json();
        })
        .then(deals => {
            const list = document.getElementById('dealsList');
            if (!list) return;

            if (!deals || deals.length === 0) {
                list.innerHTML = '<p class="empty-state"><i class="fa-solid fa-handshake-slash"></i> No deals confirmed yet.</p>';
                setText('totalSales', '₹0');
                return;
            }

            let totalSales = 0;
            list.innerHTML = deals
                .filter(d => d.dealId)
                .map(deal => {
                    const date = deal.orderDate
                        ? new Date(deal.orderDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : 'N/A';

                    let paymentMethod = 'N/A';
                    if (deal.cashOnDelivery && deal.upi) paymentMethod = 'Cash on Delivery / UPI';
                    else if (deal.cashOnDelivery) paymentMethod = 'Cash on Delivery';
                    else if (deal.upi) paymentMethod = 'UPI';

                    const cropsHtml = (deal.crops || []).map(c => {
                        const price = parseFloat(c.price) || 0;
                        const qty = parseInt(c.quantity) || 0;
                        return `<div class="crop-item">
                            <p><strong>Crop:</strong> ${escapeHtml(c.name || 'N/A')}</p>
                            <p><strong>Price:</strong> ₹${price}</p>
                            <p><strong>Qty:</strong> ${qty}</p>
                            <p><strong>Total:</strong> ₹${price * qty}</p>
                        </div>`;
                    }).join('') || '<p><strong>Crops:</strong> N/A</p>';

                    totalSales += parseFloat(deal.totalPrice) || 0;

                    return `
                    <div class="deal-item">
                        <div class="deal-header">
                            <h3>Deal #${deal.dealId}</h3>
                            <p>${date}</p>
                        </div>
                        <div class="deal-crops">${cropsHtml}</div>
                        <p><strong>Total Amount:</strong> ₹${deal.totalPrice || 'N/A'}</p>
                        <p><strong>Payment:</strong> ${paymentMethod}</p>
                        <p><strong>Buyer:</strong> ${deal.user ? escapeHtml(deal.user.fullName || 'N/A') : 'N/A'}</p>
                        ${deal.transporter ? `<p><strong>Transporter:</strong> ${escapeHtml(deal.transporter.fullName || 'N/A')}</p>` : ''}
                        ${deal.pickupLocation ? `<p><strong>Pickup:</strong> ${escapeHtml(deal.pickupLocation)}</p>` : ''}
                        ${deal.deliveryLocation ? `<p><strong>Delivery:</strong> ${escapeHtml(deal.deliveryLocation)}</p>` : ''}
                    </div>`;
                }).join('');

            setText('totalSales', `₹${totalSales.toLocaleString('en-IN')}`);
        })
        .catch(err => {
            const list = document.getElementById('dealsList');
            if (list) list.innerHTML = '<p class="empty-state">Failed to load deals.</p>';
            console.error('Error loading deals:', err);
        });
}


// ── API: Update Profile ───────────────────────────────────
function updateFarmerProfile(formData) {
    fetch('/api/farmer/update', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
        },
        body: JSON.stringify(formData)
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to update profile');
            return res.json();
        })
        .then(() => {
            showToast('Profile updated successfully!', 'success');
            loadFarmerData();
            closeModal('editProfileModal');
        })
        .catch(err => handleApiError(err, 'Failed to update profile'));
}


// ── API: Add Crop ─────────────────────────────────────────
function addCrop(payload) {
    payload.append('farmerId', currentFarmerId);
    fetch('/api/crops/add', {
        method: 'POST',
        headers: { 'Authorization': getToken() },
        body: payload
    })
        .then(res => {
            if (!res.ok) throw new Error('Failed to add crop');
            return res.json();
        })
        .then(() => {
            showToast('Crop added successfully!', 'success');
            loadFarmerCrops();
            closeModal('addCropModal');
            document.getElementById('addCropForm').reset();
        })
        .catch(err => handleApiError(err, 'Failed to add crop'));
}


// ── API: Update Crop ──────────────────────────────────────
function updateCrop(cropId, payload) {
    payload.append('farmerId', currentFarmerId);
    fetch(`/api/crops/${cropId}/update`, {
        method: 'PUT',
        headers: { 'Authorization': getToken() },
        body: payload
    })
        .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(`Failed to update crop: ${t}`); });
            return res.json();
        })
        .then(() => {
            showToast('Crop updated successfully!', 'success');
            loadFarmerCrops();
            closeModal('editCropModal');
            document.getElementById('editCropForm').reset();
        })
        .catch(err => handleApiError(err, 'Failed to update crop'));
}


// ── API: Delete Crop ──────────────────────────────────────
function deleteCrop(cropId) {
    fetch(`/api/crops/${cropId}/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        }
    })
        .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(t || 'Failed to delete crop'); });
            return res.text();
        })
        .then(msg => {
            showToast(msg || 'Crop deleted successfully.', 'success');
            loadFarmerCrops();
            closeModal('deleteCropModal');
        })
        .catch(err => handleApiError(err, 'Failed to delete crop'));
}


// ── API: Upload Profile Image ─────────────────────────────
function uploadProfileImage(payload) {
    console.log('[FarmerProfile] Uploading image for farmer:', currentFarmerId);
    fetch(`/farmers/${currentFarmerId}/uploadImage`, {
        method: 'PUT',
        headers: { 'Authorization': getToken() },
        body: payload
    })
        .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(`Failed to upload image: ${t}`); });
            return res.json();
        })
        .then(data => {
            showToast('Profile image updated successfully!', 'success');
            if (data.imageUrl) {
                const img = document.getElementById('farmerImage');
                if (img) img.src = data.imageUrl;
            }
        })
        .catch(err => handleApiError(err, 'Failed to upload image'));
}


// ── API: Get Crop Details ─────────────────────────────────
function getCropDetails(cropId) {
    return fetch(`/api/crops/${cropId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getToken()
        }
    })
        .then(res => {
            if (!res.ok) return res.text().then(t => { throw new Error(`Failed to load crop: ${t}`); });
            return res.json();
        });
}


// ── Modal Triggers (globally exposed for inline onclick) ──
function showEditCropModal(cropId) {
    getCropDetails(cropId)
        .then(crop => {
            setValue('editCropId', crop.cropId);
            setValue('editName', crop.name);
            setValue('editDescription', crop.description);
            setValue('editPrice', crop.price);
            setValue('editCategory', crop.category);
            setValue('editQuantity', crop.quantity);
            setValue('editReleaseDate', formatDateForInput(crop.releaseDate));
            setValue('editProductAvailable', String(crop.productAvailable));
            openModal('editCropModal');
        })
        .catch(err => handleApiError(err, 'Failed to load crop details'));
}

function showDeleteCropModal(cropId) {
    setValue('deleteCropId', cropId);
    openModal('deleteCropModal');
}

// Expose globally for inline onclick attributes
window.showEditCropModal = showEditCropModal;
window.showDeleteCropModal = showDeleteCropModal;


// ── Event Listener Setup ──────────────────────────────────
function setupModalListeners() {
    // Mapping: [openTriggerId, modalId, closeTriggerIds...]
    const bindings = [
        { open: 'editProfileBtn', modal: 'editProfileModal', close: ['closeEditProfile', 'cancelEditProfile'] },
        { open: 'showAddCropForm', modal: 'addCropModal',    close: ['closeAddCrop', 'cancelAddCrop'] },
        { close: ['closeEditCrop', 'cancelEditCrop'],        modal: 'editCropModal' },
        { close: ['closeDeleteCrop', 'cancelDeleteCrop'],    modal: 'deleteCropModal' }
    ];

    bindings.forEach(({ open, modal, close }) => {
        if (open) {
            const btn = document.getElementById(open);
            if (btn) btn.addEventListener('click', () => {
                if (modal === 'addCropModal') {
                    // Set default release date to today
                    const rd = document.getElementById('releaseDate');
                    if (rd) rd.value = new Date().toISOString().split('T')[0];
                }
                openModal(modal);
            });
        }
        (close || []).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', () => closeModal(modal));
        });
    });

    // Click outside to close
    document.addEventListener('click', e => {
        if (e.target.classList.contains('modal') && e.target.classList.contains('is-open')) {
            e.target.classList.remove('is-open');
        }
    });

    // Delete confirm
    const confirmDelete = document.getElementById('confirmDeleteCrop');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', () => {
            const cropId = document.getElementById('deleteCropId').value;
            if (cropId) deleteCrop(cropId);
        });
    }
}

function setupFormListeners() {
    // ── Edit Profile Form ──
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', e => {
            e.preventDefault();
            updateFarmerProfile({
                fullName:    document.getElementById('fullname').value,
                address:     document.getElementById('address').value,
                state:       document.getElementById('state').value,
                landInAcre:  parseFloat(document.getElementById('landInAcre').value) || 0,
                emailOrPhone: document.getElementById('emailOrPhone').value,
                uniqueId:    currentFarmerId
            });
        });
    }

    // ── Add Crop Form ──
    const addCropForm = document.getElementById('addCropForm');
    if (addCropForm) {
        addCropForm.addEventListener('submit', e => {
            e.preventDefault();
            const releaseDateRaw = document.getElementById('releaseDate').value;
            const crop = {
                name:             document.getElementById('name').value,
                description:      document.getElementById('description').value,
                price:            parseFloat(document.getElementById('price').value),
                category:         document.getElementById('category').value,
                quantity:         parseInt(document.getElementById('quantity').value),
                releaseDate:      formatDateForApi(releaseDateRaw),
                productAvailable: document.getElementById('productAvailable').value === 'true',
                farmerId:         currentFarmerId
            };
            const payload = new FormData();
            payload.append('crop', JSON.stringify(crop));
            const img = document.getElementById('cropImage').files[0];
            if (img) payload.append('image', img);
            addCrop(payload);
        });
    }

    // ── Edit Crop Form ──
    const editCropForm = document.getElementById('editCropForm');
    if (editCropForm) {
        editCropForm.addEventListener('submit', e => {
            e.preventDefault();
            const cropId  = document.getElementById('editCropId').value;
            const payload = new FormData(editCropForm);
            // Normalise date to DD-MM-YYYY
            const rawDate = document.getElementById('editReleaseDate').value;
            if (rawDate) payload.set('releaseDate', formatDateForApi(rawDate));
            updateCrop(cropId, payload);
        });
    }

    // ── Profile Photo Upload (on file change) ──
    const photoInput = document.getElementById('upload-photo');
    if (photoInput) {
        photoInput.addEventListener('change', () => {
            if (photoInput.files.length > 0) {
                const payload = new FormData();
                payload.append('image', photoInput.files[0]);
                uploadProfileImage(payload);
                photoInput.value = ''; // reset so same file can be re-selected
            }
        });
    }
}


// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    loadFarmerData();
    loadFarmerCrops();
    loadConfirmedDeals();

    setupModalListeners();
    setupFormListeners();
});