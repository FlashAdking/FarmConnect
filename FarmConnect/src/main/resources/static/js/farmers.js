/* Connect with Farmers Logic */

document.addEventListener('DOMContentLoaded', function () {
    fetchFarmers();
});

// Function to get JWT token
function getToken() {
    return localStorage.getItem('jwtToken');
}

// Function to fetch farmers from the API endpoint
async function fetchFarmers() {
    const farmerGrid = document.querySelector('.farmers-grid');
    if (!farmerGrid) return;

    try {
        const response = await fetch('/api/farmers', {
            headers: {
                'Authorization': `Bearer ${getToken()}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const farmers = await response.json();
        renderFarmers(farmers);
    } catch (error) {
        console.error('Error fetching farmers:', error);
        displayError("Failed to load farmers. Please try again later.");
    }
}

// Function to display an error message in the UI
function displayError(message) {
    const farmerGrid = document.querySelector('.farmers-grid');
    if (farmerGrid) {
        farmerGrid.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button onclick="fetchFarmers()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

// Function to render the farmer details
function renderFarmers(farmers) {
    const farmerGrid = document.querySelector('.farmers-grid');
    if (!farmerGrid) return;

    farmerGrid.innerHTML = "";

    if (!farmers || farmers.length === 0) {
        farmerGrid.innerHTML = `
            <div class="no-data">
                <i class="fas fa-user-slash"></i>
                <p>No farmers found in your area.</p>
            </div>
        `;
        return;
    }

    farmers.forEach((farmer, index) => {
        const card = document.createElement('div');
        card.classList.add("farmer-card", "animate-fade-in");
        card.style.animationDelay = `${(index % 6) * 0.1}s`;
        card.setAttribute('data-uniqueid', farmer.uniqueId);

        // Render tags
        let tagsHtml = '';
        if (Array.isArray(farmer.tags) && farmer.tags.length > 0) {
            tagsHtml = farmer.tags.map(tag => `<span class="tag ${tag.toLowerCase()}">${tag}</span>`).join('');
        } else {
            tagsHtml = '<span class="tag organic">Organic</span><span class="tag local">Local</span>';
        }

        const imageUrl = farmer.imageUrl || '/img/default-farmer.jpg';

        card.innerHTML = `
            <div class="farmer-image-wrapper">
                <img src="${imageUrl}" alt="Farmer ${farmer.fullName}"
                     onerror="this.onerror=null;this.src='/img/default-farmer.jpg';">
            </div>
            <div class="farmer-content">
                <h2>${farmer.fullName}</h2>
                <div class="tags">${tagsHtml}</div>
                <div class="farmer-details">
                    <p class="location"><i class="fas fa-map-marker-alt"></i> ${farmer.state || 'Location not specified'}</p>
                    <p class="contact"><i class="fas fa-envelope"></i> ${farmer.emailOrPhone}</p>
                </div>
                <button class="crops-btn" onclick="window.location.href='/crops?farmerId=${farmer.uniqueId}'">
                    <i class="fas fa-leaf"></i> View Crops
                </button>
            </div>
        `;

        farmerGrid.appendChild(card);
    });
}
