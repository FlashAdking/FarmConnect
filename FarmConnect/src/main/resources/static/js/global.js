// ============================================================
// FarmConnect Global JS — Auth, Navbar, Toast Notifications
// ============================================================

// ─── Toast Notification System ───────────────────────────────
(function setupToastSystem() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body ? document.body.appendChild(container) : document.addEventListener('DOMContentLoaded', () => document.body.appendChild(container));

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };

    window.showToast = function(message, type = 'success', duration = 4000) {
        const c = document.getElementById('toast-container');
        if (!c) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="toast-icon ${icons[type] || icons.info}"></i>
            <div class="toast-body">
                <div class="toast-title">${titles[type] || 'Notice'}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close">&times;</button>
            <div class="toast-progress"></div>
        `;

        c.appendChild(toast);

        const close = toast.querySelector('.toast-close');
        function dismiss() {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 320);
        }
        close.addEventListener('click', dismiss);

        const timer = setTimeout(dismiss, duration);
        toast.addEventListener('mouseenter', () => clearTimeout(timer));
        toast.addEventListener('mouseleave', () => setTimeout(dismiss, 1500));
    };
})();

// ─── Auth & Token Utilities ───────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {

    const publicPaths = ['/', '/farmerlogin', '/Home', '/Signupfarmer', '/crops', '/farmers',
        '/wholesalerlogin', '/Signupwholesaler', '/Signuptransporter', '/transporterlogin'];
    const protectedPaths = ['/profile', '/confirmorder', '/checkout'];

    function isProtectedPath(path) {
        return protectedPaths.some(p => path === p || path.startsWith(p + '/'));
    }

    function isTokenValid() {
        const token = localStorage.getItem('jwtToken');
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < now) {
                localStorage.removeItem('jwtToken');
                document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                return false;
            }
            return true;
        } catch {
            localStorage.removeItem('jwtToken');
            document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            return false;
        }
    }

    // Redirect from protected pages if not authenticated
    if (isProtectedPath(window.location.pathname) && !isTokenValid()) {
        window.location.href = '/farmerlogin';
        return;
    }

    // ─── Fetch Interceptor ───────────────────────────────────
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const skipAuth = publicPaths.some(p =>
            typeof url === 'string' && (url === p || url.startsWith(p + '?') || url.startsWith(p + '/'))
        );
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
                    if (!window.location.pathname.includes('/farmerlogin') &&
                        !window.location.pathname.includes('/wholesalerlogin')) {
                        window.location.href = '/farmerlogin';
                    }
                }
                return response;
            })
            .catch(error => {
                console.error('Fetch error:', error);
                throw error;
            });
    };

    // ─── Token in Nav Links ───────────────────────────────────
    function addTokenToLinks() {
        if (!isTokenValid()) return;
        const allLinks = document.querySelectorAll('a:not(.oauth-btn)');
        allLinks.forEach(link => {
            if (link.dataset.tokenAdded === "true") return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:') ||
                publicPaths.some(p => href === p || href.startsWith(p + '/'))) return;

            link.dataset.tokenAdded = "true";
            link.addEventListener('click', function(e) {
                e.preventDefault();
                if (!isTokenValid()) { window.location.href = '/farmerlogin'; return; }
                fetch(href)
                    .then(res => {
                        if (res.status === 401) { localStorage.removeItem('jwtToken'); window.location.href = '/farmerlogin'; return null; }
                        return res.text();
                    })
                    .then(html => {
                        if (html) { document.open(); document.write(html); document.close(); window.history.pushState({}, '', href); }
                    })
                    .catch(err => console.error('Nav error:', err));
            });
        });
    }

    // ─── Token in Forms ───────────────────────────────────────
    function addTokenToForms() {
        if (!isTokenValid()) return;
        const forms = document.querySelectorAll('form:not(#loginForm):not([action="/farmerlogin"]):not([action="/Signupfarmer"])');
        forms.forEach(form => {
            if (form.dataset.tokenAdded === "true") return;
            const action = form.getAttribute('action');
            if (!action || action === '#' || publicPaths.some(p => action === p || action.startsWith(p + '/'))) return;

            form.dataset.tokenAdded = "true";
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                if (!isTokenValid()) { window.location.href = '/farmerlogin'; return; }
                const formData = new FormData(form);
                const method = (form.method || 'GET').toUpperCase();
                let opts = { method };
                if (method !== 'GET') opts.body = formData;

                fetch(form.action, opts)
                    .then(res => {
                        if (res.status === 401) { localStorage.removeItem('jwtToken'); window.location.href = '/farmerlogin'; return null; }
                        return res.text();
                    })
                    .then(html => { if (html) { document.open(); document.write(html); document.close(); } })
                    .catch(err => console.error('Form error:', err));
            });
        });
    }

    // ─── Logout Button ────────────────────────────────────────
    function injectLogoutButton() {
        const target = document.querySelector('#logout-placeholder');
        if (target && !document.getElementById('logout-btn')) {
            const btn = document.createElement('button');
            btn.id = 'logout-btn';
            btn.className = 'logout-btn';
            btn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            target.appendChild(btn);
            btn.addEventListener('click', e => {
                e.stopPropagation();
                localStorage.removeItem('jwtToken');
                document.cookie = "jwtToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                showToast('You have been logged out successfully.', 'info');
                setTimeout(() => { window.location.href = '/'; }, 1200);
            });
        }
    }

    // ─── Dropdown Toggle ──────────────────────────────────────
    function initDropdownToggle() {
        const dropdownUser = document.getElementById('dropdownUser');
        if (dropdownUser && !dropdownUser.dataset.toggleInitialized) {
            dropdownUser.addEventListener('click', e => {
                e.stopPropagation();
                dropdownUser.classList.toggle('active');
            });
            document.addEventListener('click', () => dropdownUser.classList.remove('active'));
            dropdownUser.dataset.toggleInitialized = "true";
        }
    }

    // ─── Navbar Profile Image Update ─────────────────────────
    async function updateNavbar() {
        if (!isTokenValid()) return;
        const dropdownUser = document.getElementById('dropdownUser');
        if (!dropdownUser || dropdownUser.dataset.navUpdated === "true") return;
        dropdownUser.dataset.navUpdated = "true";

        const token = localStorage.getItem('jwtToken');
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload.role;
            const endpoint = (role === 'ROLE_FARMER') ? '/api/farmer/profile' : '/api/wholesaler/profile';
            const response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                if (data && data.imageUrl) {
                    const icon = dropdownUser.querySelector('i.fa-user-circle');
                    if (icon) {
                        const img = document.createElement('img');
                        img.src = data.imageUrl;
                        img.alt = "Profile";
                        img.className = "user-nav-img";
                        img.onerror = function() {
                            this.style.display = 'none';
                            const fallback = document.createElement('i');
                            fallback.className = 'fa fa-user-circle';
                            fallback.style.fontSize = '26px';
                            this.parentNode.insertBefore(fallback, this);
                        };
                        icon.replaceWith(img);
                    }
                }
            } else {
                dropdownUser.dataset.navUpdated = "false";
            }
        } catch (e) {
            console.error("Navbar update error:", e);
            dropdownUser.dataset.navUpdated = "false";
        }
    }

    // ─── Init ─────────────────────────────────────────────────
    initDropdownToggle();
    updateNavbar();

    if (isTokenValid()) {
        addTokenToLinks();
        addTokenToForms();
        injectLogoutButton();
    }

    // MutationObserver for dynamically added content
    const observer = new MutationObserver(() => {
        if (isTokenValid()) {
            addTokenToLinks();
            addTokenToForms();
            injectLogoutButton();
            initDropdownToggle();
            updateNavbar();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
});

// ─── Index page dropdown helper ───────────────────────────────
function toggleDropdown(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('active');
    document.addEventListener('click', function handler(e) {
        if (!el.contains(e.target) && !e.target.closest('button')) {
            el.classList.remove('active');
            document.removeEventListener('click', handler);
        }
    });
}
