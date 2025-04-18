// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBrVtHa3g_JFOAu1h-qxgF044xEnZp1Dgs",
    authDomain: "amara-dc314.firebaseapp.com",
    projectId: "amara-dc314",
    storageBucket: "amara-dc314.firebasestorage.app",
    messagingSenderId: "503583062374",
    appId: "1:503583062374:web:3a0467f5a0fab519c170a7",
    measurementId: "G-74XV2BFE9S"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Auth state management
const auth = firebase.auth();
const db = firebase.firestore();

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