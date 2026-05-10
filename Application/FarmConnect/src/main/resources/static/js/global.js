// auth.js
document.addEventListener("DOMContentLoaded", () => {

    // Define public paths and protected paths.
    // Public pages never require a token.
    const publicPaths = ['/', '/farmerlogin', '/Home', '/Signupfarmer', '/crops', '/farmers'];
    // Protected pages require a valid token.
    const protectedPaths = ['/profile', '/confirmorder', '/checkout'];
    // Adjust to match your actual protected URLs

    // Returns true if the given path is protected.
    function isProtectedPath(path) {
        return protectedPaths.some(protectedPath =>
            path === protectedPath || path.startsWith(protectedPath + '/')
        );
    }

    // Check if token in localStorage is valid and not expired.
    function isTokenValid() {
        const token = localStorage.getItem('jwtToken');
        if (!token) return false;
        try {
            // Parse the token and check expiration.
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < currentTime) {
                console.log("Token expired");
                localStorage.removeItem('jwtToken');
                return false;
            }
            return true;
        } catch (error) {
            console.error("Invalid token format:", error);
            localStorage.removeItem('jwtToken');
            return false;
        }
    }

    // If the current page is protected and the token is invalid, redirect immediately.
    if (isProtectedPath(window.location.pathname) && !isTokenValid()) {
        window.location.href = '/farmerlogin';
        return;
    }

    // Add JWT token to every link navigation for protected pages
    function addTokenToLinks() {
        // For links, we'll skip adding token for public pages.
        // (You might change this logic if your public pages need some token data—but here we assume they don't.)
        const token = localStorage.getItem('jwtToken');
        if (!isTokenValid()) return;

        // Process all links except those that are explicitly public (or oauth buttons).
        const allLinks = document.querySelectorAll('a:not(.oauth-btn)');
        // We'll use our publicPaths here
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Skip if no href, an external link, an anchor (#), or one of our public base paths.
            if (
                !href ||
                href.startsWith('http') ||
                href.startsWith('#') ||
                publicPaths.some(publicPath =>
                    href === publicPath || href.startsWith(publicPath + '/')
                )
            ) {
                return;
            }

            // Modify link click to use fetch for protected endpoints.
            link.addEventListener('click', function (e) {
                e.preventDefault();
                if (!isTokenValid()) {
                    window.location.href = '/farmerlogin';
                    return;
                }
                fetch(href, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then(response => {
                        if (response.status === 401) {
                            // Token rejected by server.
                            localStorage.removeItem('jwtToken');
                            window.location.href = '/farmerlogin';
                            return null;
                        }
                        return response.text();
                    })
                    .then(html => {
                        if (html) {
                            document.open();
                            document.write(html);
                            document.close();
                            window.history.pushState({}, '', href);
                        }
                    })
                    .catch(error => {
                        console.error('Navigation error:', error);
                        if (error.message && error.message.includes('JWT')) {
                            localStorage.removeItem('jwtToken');
                            window.location.href = '/farmerlogin';
                        }
                    });
            });
        });
    }

    // Add token to all forms for protected endpoints.
    function addTokenToForms() {
        if (!isTokenValid()) return;

        const token = localStorage.getItem('jwtToken');
        // Only intercept forms that post to protected endpoints.
        const forms = document.querySelectorAll('form:not(#loginForm):not([action="/farmerlogin"]):not([action="/Signupfarmer"])');
        forms.forEach(form => {
            // If the form action is public, skip token injection.
            const formAction = form.getAttribute('action');
            if (
                !formAction ||
                publicPaths.some(publicPath =>
                    formAction === publicPath || formAction.startsWith(publicPath + '/')
                )
            ) {
                return;
            }

            form.addEventListener('submit', function (e) {
                e.preventDefault();
                if (!isTokenValid()) {
                    window.location.href = '/farmerlogin';
                    return;
                }
                const formData = new FormData(form);
                const method = form.method.toUpperCase() || 'GET';

                let fetchOptions = {
                    method: method,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                if (method !== 'GET') {
                    fetchOptions.body = formData;
                }

                fetch(form.action, fetchOptions)
                    .then(response => {
                        if (response.status === 401) {
                            localStorage.removeItem('jwtToken');
                            window.location.href = '/farmerlogin';
                            return null;
                        }
                        return response.text();
                    })
                    .then(html => {
                        if (html) {
                            document.open();
                            document.write(html);
                            document.close();
                        }
                    })
                    .catch(error => {
                        console.error('Form submission error:', error);
                        if (error.message && error.message.includes('JWT')) {
                            localStorage.removeItem('jwtToken');
                            window.location.href = '/farmerlogin';
                        }
                    });
            });
        });
    }

    // Intercept fetch calls and add Authorization header for protected URLs.
    const originalFetch = window.fetch;
    window.fetch = function (url, options = {}) {
        // Use our publicPaths array to determine if authorization should be skipped.
        const skipAuth = publicPaths.some(path => url === path || url.startsWith(path + '?') || url.startsWith(path + '/'));
        if (!skipAuth && isTokenValid()) {
            const token = localStorage.getItem('jwtToken');
            options = options || {};
            options.headers = options.headers || {};
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        return originalFetch(url, options)
            .then(response => {
                if (response.status === 401 && !skipAuth) {
                    localStorage.removeItem('jwtToken');
                    if (!window.location.pathname.includes('/farmerlogin')) {
                        window.location.href = '/farmerlogin';
                    }
                }
                return response;
            })
            .catch(error => {
                console.error('Fetch error:', error);
                if (error.message && error.message.includes('JWT') && !skipAuth) {
                    localStorage.removeItem('jwtToken');
                    if (!window.location.pathname.includes('/farmerlogin')) {
                        window.location.href = '/farmerlogin';
                    }
                }
                throw error;
            });
    };

    // Global error handler for JWT signature issues.
    function handleInvalidSignature() {
        window.addEventListener('error', function (event) {
            if (event.message && event.message.includes('JWT')) {
                console.error('JWT validation error detected');
                localStorage.removeItem('jwtToken');
                if (!window.location.pathname.includes('/farmerlogin')) {
                    window.location.href = '/farmerlogin';
                }
            }
        });
    }

    // Inject a logout button.
    function injectLogoutButton() {
        if (!document.getElementById("logout-btn")) {
            const logoutButton = document.createElement("button");
            logoutButton.id = "logout-btn";
            logoutButton.className = "logout-btn";
            logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            const target = document.querySelector("#logout-placeholder") || document.body;
            target.appendChild(logoutButton);
            logoutButton.addEventListener("click", () => {
                localStorage.removeItem("jwtToken");
                window.location.href = "/";
            });
        }
    }

    // Only enforce token validation when on protected pages.
    // On public pages (like crops or Farmers), simply inject logout if a token exists.
    if (isProtectedPath(window.location.pathname)) {
        if (isTokenValid()) {
            addTokenToLinks();
            addTokenToForms();
            handleInvalidSignature();
            injectLogoutButton();
        }
    } else {
        // For public pages, we may just inject logout if token exists (optional).
        if (isTokenValid()) {
            injectLogoutButton();
        }
    }

    // Using a MutationObserver to catch dynamically added content.
    const observer = new MutationObserver(() => {
        if (isTokenValid()) {
            addTokenToLinks();
            addTokenToForms();
            injectLogoutButton();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});
