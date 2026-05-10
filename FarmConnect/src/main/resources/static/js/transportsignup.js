/* Transporter Signup Logic */

document.addEventListener("DOMContentLoaded", () => {
    // Check if token exists
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        // No token found, redirect to login
        window.location.href = '/farmerlogin';
        return;
    }

    const signupForm = document.querySelector(".signup-form");
    if (signupForm) {
        const createBtn = signupForm.querySelector(".create-account");
        if (createBtn) {
            createBtn.addEventListener("click", handleSignup);
        }
    }
});

async function handleSignup(event) {
    event.preventDefault();
    // Implementation for transporter signup
    alert("Transporter signup logic to be implemented");
}
