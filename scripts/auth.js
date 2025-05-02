// Check authentication status
function checkAuth() {
    const user = localStorage.getItem('userEmail');
    if (!user && !window.location.href.includes('login.html') && !window.location.href.includes('signup.html')) {
        window.location.href = 'login.html';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Initialize auth check on page load
window.onload = checkAuth;