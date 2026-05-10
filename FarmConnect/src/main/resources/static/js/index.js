/* Index Page Logic */

document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
    initHeroDropdowns();
});

function initCarousel() {
    const carousel = document.getElementById('farmerCarousel');
    if (!carousel) return;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const cards = document.querySelectorAll('.farmer-card');
    const indicators = document.querySelectorAll('.indicator');

    let cardWidth = 345; // Card width (320) + gap (25)
    let currentIndex = 0;
    let autoScrollInterval;

    function updateCarousel() {
        carousel.style.transform = `translateX(${-currentIndex * cardWidth}px)`;

        // Update indicators
        indicators.forEach((indicator, index) => {
            if (index === currentIndex % 3) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : cards.length - 3;
            updateCarousel();
            resetAutoScroll();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            currentIndex = (currentIndex < cards.length - 3) ? currentIndex + 1 : 0;
            updateCarousel();
            resetAutoScroll();
        });
    }

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function () {
            currentIndex = index;
            updateCarousel();
            resetAutoScroll();
        });
    });

    function startAutoScroll() {
        autoScrollInterval = setInterval(function () {
            currentIndex = (currentIndex < cards.length - 3) ? currentIndex + 1 : 0;
            updateCarousel();
        }, 4000);
    }

    function resetAutoScroll() {
        clearInterval(autoScrollInterval);
        startAutoScroll();
    }

    // Touch events for mobile swipe
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    carousel.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) {
            // Swipe left
            if (nextBtn) nextBtn.click();
        } else if (touchEndX > touchStartX + 50) {
            // Swipe right
            if (prevBtn) prevBtn.click();
        }
    }, false);

    function adjustForScreenSize() {
        if (window.innerWidth < 768) {
            cardWidth = window.innerWidth - 80;
            // Force cards to match the width
            cards.forEach(card => card.style.minWidth = (window.innerWidth - 105) + 'px');
        } else {
            cardWidth = 345;
            cards.forEach(card => card.style.minWidth = '320px');
        }
        updateCarousel();
    }

    window.addEventListener('resize', adjustForScreenSize);
    adjustForScreenSize();
    startAutoScroll();
}

function initHeroDropdowns() {
    // Dropdown toggling is handled by inline onclick for simplicity in template,
    // but we can add global click listener to close them
    window.onclick = function (event) {
        if (!event.target.matches('.btn')) {
            const dropdowns = document.querySelectorAll('.dropdown');
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    };
}

function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId).closest('.dropdown');
    
    // Close other dropdowns first
    document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
    });

    dropdown.classList.toggle('active');
}
