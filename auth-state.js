// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinksContainer = document.querySelector('.nav-links-container');

    if (hamburgerMenu && navLinksContainer) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            navLinksContainer.classList.toggle('active');
        });
    }

    // Set initial UI state to loading
    const desktopAuthButtons = document.querySelector('.nav-right .auth-buttons');
    const mobileAuthButtons = document.querySelector('.nav-links-container .auth-buttons');
    
    if (desktopAuthButtons) {
        desktopAuthButtons.innerHTML = '<div class="auth-loading">Loading...</div>';
    }
    if (mobileAuthButtons) {
        mobileAuthButtons.innerHTML = '<div class="auth-loading">Loading...</div>';
    }

    // Initialize Firebase Auth listener
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            const authButtonsHTML = `
                <span class="user-name">${user.email}</span>
                <a href="#" class="logout-btn" onclick="signOut()">Logout</a>
            `;
            
            if (desktopAuthButtons) desktopAuthButtons.innerHTML = authButtonsHTML;
            if (mobileAuthButtons) mobileAuthButtons.innerHTML = authButtonsHTML;
        } else {
            // User is signed out
            const authButtonsHTML = `
                <a href="login.html" class="login-btn">Login</a>
                <a href="register.html" class="signup-btn">Sign up</a>
            `;
            
            if (desktopAuthButtons) desktopAuthButtons.innerHTML = authButtonsHTML;
            if (mobileAuthButtons) mobileAuthButtons.innerHTML = authButtonsHTML;
        }
    });
});

// Sign out function
function signOut() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
} 