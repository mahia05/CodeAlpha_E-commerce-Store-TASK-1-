// ===== Auth Helpers (replaces check_login_status.php + header.php) =====

function getToken() { return localStorage.getItem('token'); }
function getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
function isLoggedIn() { return !!getToken(); }

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function toggleDropdown() {
    const dd = document.getElementById('dropdown');
    if (dd) dd.style.display = dd.style.display === 'block' ? 'none' : 'block';
}

// Close dropdown on outside click
document.addEventListener('click', function (e) {
    const dd = document.getElementById('dropdown');
    const icon = document.querySelector('.profile-icon');
    if (dd && icon && !icon.contains(e.target) && !dd.contains(e.target)) {
        dd.style.display = 'none';
    }
});

// Inject profile icon + dropdown if logged in (replaces header.php)
function injectHeader() {
    const user = getUser();
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Remove any existing profile container
    const existing = document.querySelector('.profile-container');
    if (existing) existing.remove();

    if (user) {
        const div = document.createElement('div');
        div.className = 'profile-container';
        div.innerHTML = `
      <div class="profile-icon" onclick="toggleDropdown()">👤</div>
      <div id="dropdown" class="dropdown-content">
        <a href="order_history.html">History</a>
        <a href="receipt.html">Receipt</a>
        <a href="#" onclick="logout()">Logout</a>
      </div>`;
        nav.appendChild(div);
    }
}

// Show flash message
function showMessage(msg, type = 'error') {
    let el = document.getElementById('flash-msg');
    if (!el) {
        el = document.createElement('div');
        el.id = 'flash-msg';
        document.body.insertBefore(el, document.body.children[1]);
    }
    el.innerHTML = `<div class="message ${type}">${msg}</div>`;
    if (type === 'success') setTimeout(() => el.innerHTML = '', 4000);
}

// Authenticated fetch helper
async function authFetch(url, options = {}) {
    const token = getToken();
    options.headers = options.headers || {};
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    return fetch(url, options);
}