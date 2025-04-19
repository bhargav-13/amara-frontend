// Function to update auth UI based on user state
function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (user) {
        // Get user data from Firestore
        db.collection('users').doc(user.uid).get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const fullName = `${userData.firstName} ${userData.lastName}`;
                    authButtons.innerHTML = `
                        <div class="user-profile">
                            <span class="user-name">${fullName}</span>
                            <button class="logout-btn" onclick="handleLogout()">Logout</button>
                        </div>
                    `;
                }
            })
            .catch((error) => {
                console.error("Error getting user data:", error);
            });
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="login-btn">Login</a>
            <a href="register.html" class="signup-btn">Sign up</a>
        `;
    }
}

// Handle logout
function handleLogout() {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Logout error:', error);
            alert('Logout failed: ' + error.message);
        });
}

// Initialize auth state listener
document.addEventListener('DOMContentLoaded', () => {
    // Set initial UI state to loading
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.innerHTML = '<div class="auth-loading">Loading...</div>';
    }

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
        updateAuthUI(user);
    });
}); 