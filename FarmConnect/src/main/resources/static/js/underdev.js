/* Under Development Logic */

document.addEventListener("DOMContentLoaded", () => {
    // Check if token exists
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // No token found, redirect to login
        window.location.href = '/farmerlogin';
        return;
    }

    // Optional: Add some interactivity to the progress bar
    const progress = document.querySelector('.progress');
    if (progress) {
        let width = 0;
        setInterval(() => {
            if (width >= 100) {
                width = 0;
            } else {
                width += 1;
                progress.style.width = width + '%';
            }
        }, 50);
    }
});
