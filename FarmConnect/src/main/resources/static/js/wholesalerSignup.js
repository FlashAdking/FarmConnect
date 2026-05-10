/* Wholesaler Signup Logic */

document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("wholesalerSignupForm");
    
    if (signupForm) {
        signupForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const fullName = document.getElementById("fullName").value.trim();
            const emailOrPhone = document.getElementById("emailOrPhone").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Validation regex
            const emailRegex = /^\S+@\S+\.\S+$/;
            const phoneRegex = /^\d{10}$/;
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
            const fullNameRegex = /^[A-Za-z ]+$/;

            // Validate full name
            if (!fullNameRegex.test(fullName)) {
                alert("Full name must contain only letters and spaces.");
                return;
            }

            // Validate email or phone
            if (!emailRegex.test(emailOrPhone) && !phoneRegex.test(emailOrPhone.replace(/\D/g, ''))) {
                alert("Please enter a valid email or a 10-digit phone number.");
                return;
            }

            // Validate password
            if (!passwordRegex.test(password)) {
                alert("Password must be at least 8 characters and include uppercase, lowercase, and one special character.");
                return;
            }

            // Confirm passwords match
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const wholesaler = {
                fullName: fullName,
                email: emailOrPhone,
                password: password
            };

            const submitBtn = signupForm.querySelector("button[type='submit']");
            if (submitBtn) submitBtn.disabled = true;

            fetch("/Signupwholesaler", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(wholesaler)
            })
            .then(response => {
                if (response.ok) {
                    alert("Account created successfully!");
                    const loginUrl = document.body.dataset.loginUrl || '/wholesalerlogin';
                    window.location.href = loginUrl;
                } else {
                    return response.text().then(text => { throw new Error(text); });
                }
            })
            .catch(error => {
                console.error("Signup error:", error);
                alert("Error creating account: " + error.message);
            })
            .finally(() => {
                if (submitBtn) submitBtn.disabled = false;
            });
        });
    }

    // Google Login Handling
    const googleBtn = document.getElementById("googleBtn");
    if (googleBtn) {
        googleBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "/oauth2/authorization/google";
        });
    }
});
