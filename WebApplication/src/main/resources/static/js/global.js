// auth.js
document.addEventListener("DOMContentLoaded", () => {
    // Check if token is valid and not expired
    function isTokenValid() {
        const token = localStorage.getItem('jwtToken');
        if (!token) return false;
        
        try {
            // Parse the token
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if token has expired
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
    
    // Add JWT token to every link navigation
    function addTokenToLinks() {
        if (!isTokenValid()) return;
        
        const token = localStorage.getItem('jwtToken');
        // Process all links except those in the permitAll list
        const allLinks = document.querySelectorAll('a:not(.oauth-btn)');
        const permitAllPaths = ['/', '/farmerlogin', '/Home', '/Signupfarmer'];
        
        allLinks.forEach(link => {
            const href = link.getAttribute('href');
            
            // Skip if no href, external link, or permitAll path
            if (!href || href.startsWith('http') || href.startsWith('#') || 
                permitAllPaths.some(path => href === path)) {
                return;
            }
            
            // Modify link event
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (!isTokenValid()) {
                    window.location.href = '/farmerlogin';
                    return;
                }
                
                // Make a fetch request instead of direct navigation
                fetch(href, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                .then(response => {
                    if (response.status === 401) {
                        // Token rejected by server
                        localStorage.removeItem('jwtToken');
                        window.location.href = '/farmerlogin';
                        return null;
                    }
                    return response.text();
                })
                .then(html => {
                    if (html) {
                        // Replace current page content with response
                        document.open();
                        document.write(html);
                        document.close();
                        // Update URL without reloading
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
    
    // Add token to all forms
    function addTokenToForms() {
        if (!isTokenValid()) return;
        
        const token = localStorage.getItem('jwtToken');
        const forms = document.querySelectorAll('form:not(#loginForm):not([action="/farmerlogin"]):not([action="/Signupfarmer"])');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                // Don't add token to the login form itself
                if (form.id === 'loginForm') return;
                
                const formAction = form.getAttribute('action');
                if (formAction === '/farmerlogin' || formAction === '/Signupfarmer') return;
                
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
    
    // Intercept AJAX calls made by fetch API
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        // Skip auth token for permitAll paths
        const permitAllPaths = ['/', '/farmerlogin', '/Home', '/Signupfarmer'];
        const skipAuth = permitAllPaths.some(path => url === path || url.startsWith(path + '?'));
        
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
                    // Only redirect if we're not already on the login page
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
                    // Only redirect if we're not already on the login page
                    if (!window.location.pathname.includes('/farmerlogin')) {
                        window.location.href = '/farmerlogin';
                    }
                }
                throw error;
            });
    };
    
    // Handle the case where signature does not match
    function handleInvalidSignature() {
        // Add global error handler
        window.addEventListener('error', function(event) {
            if (event.message && event.message.includes('JWT')) {
                console.error('JWT validation error detected');
                localStorage.removeItem('jwtToken');
                if (!window.location.pathname.includes('/farmerlogin')) {
                    window.location.href = '/farmerlogin';
                }
            }
        });
    }
    
    // Initialize auth mechanisms if we're not on login/signup pages
    if (!window.location.pathname.includes('/farmerlogin') && 
        !window.location.pathname.includes('/Signupfarmer')) {
        
        // Check if token is valid before proceeding
        if (isTokenValid()) {
            addTokenToLinks();
            addTokenToForms();
            handleInvalidSignature();
            injectLogoutButton(); 
            
            // Re-process when DOM changes (for dynamically added elements)
            const observer = new MutationObserver(() => {
                if (isTokenValid()) {
                    addTokenToLinks();
                    addTokenToForms();
                    injectLogoutButton();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            // If token is invalid or expired, redirect to login
            // Only redirect if on a protected page
            if (!['/', '/Home'].includes(window.location.pathname)) {
                window.location.href = '/';
            }
        }
    }
});

function injectLogoutButton() {
    if (!document.getElementById("logout-btn")) {
        const logoutButton = document.createElement("button");
        logoutButton.id = "logout-btn";
        logoutButton.className = "logout-btn";
        logoutButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';

        // Style or position it depending on your layout
        const target = document.querySelector("#logout-placeholder") || document.body;
        target.appendChild(logoutButton);

        // Attach the logout logic
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem("jwtToken");
            window.location.href = "/";
        });
    }
}


