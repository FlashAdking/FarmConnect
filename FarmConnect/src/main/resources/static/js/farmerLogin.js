/* Farmer Login Logic */

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const emailOrPhone = document.getElementById("emailOrPhone");
    const emailPhoneError = document.getElementById("emailPhoneError");
    const password = document.getElementById("password");
    const passwordError = document.getElementById("passwordError");

    // Create status message element
    let statusMessage = document.getElementById("statusMessage");
    if (!statusMessage && loginForm) {
        statusMessage = document.createElement("div");
        statusMessage.id = "statusMessage";
        statusMessage.style.display = "none";
        statusMessage.style.marginTop = "10px";
        loginForm.appendChild(statusMessage);
    }

    // Helper functions for validation
    const isValidEmail = (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    const isValidPhone = (value) => /^\d{10}$/.test(value);

    const validateEmailOrPhone = () => {
        const value = emailOrPhone.value.trim();
        if (value === "" || isValidEmail(value) || isValidPhone(value)) {
            if (emailPhoneError) emailPhoneError.style.display = "none";
            emailOrPhone.setCustomValidity("");
            return true;
        } else {
            if (emailPhoneError) emailPhoneError.style.display = "block";
            emailOrPhone.setCustomValidity("Invalid email or phone format");
            return false;
        }
    };

    const validatePassword = () => {
        const value = password.value;
        if (value.length > 0 && value.length < 6) {
            if (passwordError) passwordError.style.display = "block";
            password.setCustomValidity("Password must be at least 6 characters");
            return false;
        } else {
            if (passwordError) passwordError.style.display = "none";
            password.setCustomValidity("");
            return true;
        }
    };

    // Attach real-time validation handlers
    if (emailOrPhone) emailOrPhone.addEventListener("input", validateEmailOrPhone);
    if (password) password.addEventListener("input", validatePassword);

    // Form submission handler
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();

            // Clear any previously stored token
            localStorage.removeItem('jwtToken');

            // Reset status message
            statusMessage.style.display = "none";
            statusMessage.textContent = "";

            const emailPhoneValue = emailOrPhone.value.trim();
            const passwordValue = password.value;

            // Validate input fields again on submit
            const validEmailOrPhone = isValidEmail(emailPhoneValue) || isValidPhone(emailPhoneValue);
            const validPassword = passwordValue.length >= 6;

            if (!validEmailOrPhone) {
                if (emailPhoneError) emailPhoneError.style.display = "block";
                return;
            }
            if (!validPassword) {
                if (passwordError) passwordError.style.display = "block";
                return;
            }

            const formData = {
                emailOrPhone: emailPhoneValue,
                password: passwordValue
            };

            const submitBtn = loginForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            fetch('/farmerlogin', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            .then(response => {
                if (response.status === 401) {
                    return response.json().then(data => { throw new Error(data.error || "Wrong username or password"); });
                }
                if (!response.ok) throw new Error("Login failed. Please try again.");
                return response.json();
            })
            .then(data => {
                if (!data.token) throw new Error("No token received from server");

                localStorage.setItem('jwtToken', data.token);
                document.cookie = "jwtToken=" + data.token + "; path=/; max-age=86400; SameSite=Lax";

                statusMessage.textContent = "Login successful! Redirecting...";
                statusMessage.style.display = "block";
                statusMessage.style.color = "green";

                setTimeout(() => {
                    const profileUrl = document.body.dataset.profileUrl || '/profile';
                    window.location.href = profileUrl;
                }, 1000);
            })
            .catch(error => {
                console.error("Error during login:", error);
                statusMessage.textContent = error.message || "Login failed. Please try again.";
                statusMessage.style.display = "block";
                statusMessage.style.color = "red";
            })
            .finally(() => {
                if (submitBtn) submitBtn.disabled = false;
            });
        });
    }
});
