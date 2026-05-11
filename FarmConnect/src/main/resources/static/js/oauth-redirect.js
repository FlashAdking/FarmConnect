/* OAuth Redirect Logic */

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const redirectPath = params.get("redirect") || "/";

    if (token) {
        console.log("Saving token to localStorage:", token);
        localStorage.setItem("jwtToken", token);
        // Set cookie for server-side access if needed
        document.cookie = "jwtToken=" + token + "; path=/; max-age=86400; SameSite=Lax";
    } else {
        console.error("No token found in URL");
    }

    // Slight delay to ensure token is saved before redirect
    setTimeout(() => {
        window.location.href = redirectPath;
    }, 500);
});
