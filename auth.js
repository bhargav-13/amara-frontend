// Check if Firebase is available
if (typeof firebase === 'undefined') {
    console.error('Firebase is not loaded!');
    alert('Error: Firebase is not loaded. Please check your internet connection.');
} else {
    console.log('Firebase is loaded successfully');
}

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
  

try {
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
} catch (error) {
    console.error('Firebase initialization error:', error);
    alert('Error initializing Firebase: ' + error.message);
}

const auth = firebase.auth();
const db = firebase.firestore();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loaderContainer = document.querySelector('.loader-container');

// Show loader
function showLoader() {
    loaderContainer.style.display = 'flex';
}

// Hide loader
function hideLoader() {
    loaderContainer.style.display = 'none';
}

// Show error message
function showError(element, message) {
    if (!element) return;
    
    const formGroup = element.closest('.form-group');
    if (!formGroup) return;
    
    let errorElement = formGroup.querySelector('.error-message');
    
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    element.style.borderColor = '#ff4444';
}

// Hide error message
function hideError(element) {
    if (!element) return;
    
    const formGroup = element.closest('.form-group');
    if (!formGroup) return;
    
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    element.style.borderColor = '#ddd';
}

// Validate password strength
function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };
    return Object.values(requirements).every(Boolean);
}

// Update auth UI based on user state
function updateAuthUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (user) {
        // User is signed in
        const displayName = user.displayName || user.email || 'User';
        authButtons.innerHTML = `
            <div class="user-profile">
                <span class="user-name">${displayName}</span>
                <button class="logout-btn" onclick="handleLogout()">Logout</button>
            </div>
        `;
    } else {
        // User is signed out
        authButtons.innerHTML = `
            <a href="login.html" class="login-btn">Login</a>
            <a href="register.html" class="signup-btn">Sign up</a>
        `;
    }
}

// Handle logout
async function handleLogout() {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error during logout: ' + error.message);
    }
}

// Check auth state
auth.onAuthStateChanged((user) => {
    updateAuthUI(user);
});

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();

        const identifier = document.getElementById('loginIdentifier').value;
        const password = document.getElementById('password').value;

        try {
            // Check if identifier is email or phone
            const isEmail = identifier.includes('@');
            let userCredential;

            if (isEmail) {
                userCredential = await auth.signInWithEmailAndPassword(identifier, password);
            } else {
                // Handle phone number login if needed
                throw new Error('Phone number login not implemented yet');
            }

            // Update UI and redirect
            updateAuthUI(userCredential.user);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Login error:', error);
            showError(document.getElementById('loginIdentifier'), 'Invalid credentials');
        } finally {
            hideLoader();
        }
    });
}

// Register form submission
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();

        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        const terms = document.getElementById('terms');

        // Clear previous errors
        [email, phone, password, confirmPassword, terms].forEach(hideError);

        // Validate email
        if (!email.value.trim()) {
            showError(email, 'Email is required');
            hideLoader();
            return;
        }

        if (!isValidEmail(email.value)) {
            showError(email, 'Please enter a valid email address');
            hideLoader();
            return;
        }

        // Validate phone
        if (!phone.value.trim()) {
            showError(phone, 'Phone number is required');
            hideLoader();
            return;
        }

        // Validate password
        if (!password.value.trim()) {
            showError(password, 'Password is required');
            hideLoader();
            return;
        }

        if (!validatePassword(password.value)) {
            showError(password, 'Password does not meet requirements');
            hideLoader();
            return;
        }

        // Check password match
        if (password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            hideLoader();
            return;
        }

        // Validate terms
        if (!terms.checked) {
            const termsError = document.querySelector('.terms-error');
            termsError.style.display = 'block';
            hideLoader();
            return;
        }

        try {
            // Create user with email
            const userCredential = await auth.createUserWithEmailAndPassword(email.value, password.value);
            
            // Store additional user data in Firestore
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email.value,
                phone: phone.value,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Update UI and redirect
            updateAuthUI(userCredential.user);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Registration error:', error);
            if (error.code === 'auth/email-already-in-use') {
                showError(email, 'This email is already registered');
            } else if (error.code === 'auth/invalid-email') {
                showError(email, 'Invalid email address');
            } else if (error.code === 'auth/weak-password') {
                showError(password, 'Password is too weak');
            } else {
                showError(email, error.message);
            }
        } finally {
            hideLoader();
        }
    });

    // Hide terms error when checkbox is checked
    document.getElementById('terms').addEventListener('change', function() {
        const termsError = document.querySelector('.terms-error');
        termsError.style.display = this.checked ? 'none' : 'block';
    });

    // Add real-time validation for password
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            if (this.value.trim()) {
                if (!validatePassword(this.value)) {
                    showError(this, 'Password does not meet requirements');
                } else {
                    hideError(this);
                }
            } else {
                hideError(this);
            }
        });
    }

    // Add real-time validation for confirm password
    const confirmPasswordInput = document.getElementById('confirmPassword');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const password = document.getElementById('password').value;
            if (this.value.trim() && this.value !== password) {
                showError(this, 'Passwords do not match');
            } else {
                hideError(this);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auth...');
    
    // Debug form elements
    console.log('Login form found:', !!loginForm);
    
    if (loginForm) {
        console.log('Setting up login form event listener');
        loginForm.addEventListener('submit', function(e) {
            console.log('Login form submitted');
            e.preventDefault();
            
            const email = loginForm.querySelector('input[name="loginIdentifier"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;
            
            console.log('Form values:', { email, password });
            
            if (!email || !password) {
                console.log('Email or password is empty');
                return;
            }
            
            // Directly call handleLogin with the form
            handleLogin(loginForm);
        });
    }

    // Debug registration form
    console.log('Register form found:', !!registerForm);
    
    if (registerForm) {
        console.log('Setting up register form event listener');
        registerForm.addEventListener('submit', function(e) {
            console.log('Register form submitted');
            e.preventDefault();
            handleRegistration(registerForm);
        });
    }

    // Password validation
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        input.addEventListener('input', function() {
            validatePassword(this);
        });
    });

    // Phone number validation
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });

    // Social login handlers
    document.querySelectorAll('.social-btn').forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 
                new firebase.auth.GoogleAuthProvider() : 
                new firebase.auth.FacebookAuthProvider();
            
            handleSocialLogin(provider);
        });
    });
});

function setLoadingState(form, isLoading) {
    if (!form) return;
    
    const submitButton = form.querySelector('.auth-btn');
    if (submitButton) {
        if (isLoading) {
            submitButton.classList.add('loading');
            form.classList.add('loading');
        } else {
            submitButton.classList.remove('loading');
            form.classList.remove('loading');
        }
    }
}

async function handleLogin(form) {
    console.log('handleLogin called');
    setLoadingState(form, true);
    showLoader();
    
    const email = form.querySelector('input[name="loginIdentifier"]').value;
    const password = form.querySelector('input[name="password"]').value;
    
    try {
        console.log('Attempting login with:', { email });
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Login successful:', userCredential.user);
        
        localStorage.setItem('user', JSON.stringify({
            email: userCredential.user.email,
            uid: userCredential.user.uid
        }));
        
        updateAuthUI(userCredential.user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        showError(form.querySelector('input[name="loginIdentifier"]'), error.message);
    } finally {
        setLoadingState(form, false);
        hideLoader();
    }
}

async function handleRegistration(form) {
    console.log('handleRegistration called');
    setLoadingState(form, true);
    showLoader();
    
    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const phone = form.querySelector('input[name="phone"]').value;
    
    try {
        console.log('Attempting registration with:', { email });
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        await db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            phone: phone,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('Registration successful:', userCredential.user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Registration error:', error);
        showError(form.querySelector('input[name="email"]'), error.message);
    } finally {
        setLoadingState(form, false);
        hideLoader();
    }
}

async function handleSocialLogin(provider) {
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Save user data to Firestore if it's a new user
        if (result.additionalUserInfo.isNewUser) {
            await firebase.firestore().collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        console.log('User logged in with social:', user);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Social login error:', error);
        alert('Error during social login: ' + error.message);
    }
}

function validateForm(form) {
    if (!form) return false;
    
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!input) return;
        
        if (!input.value.trim()) {
            showError(input, 'This field is required');
            isValid = false;
        } else {
            clearError(input);
        }
    });

    // Validate email
    const email = form.querySelector('input[type="email"]');
    if (email && !isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password match
    const password = form.querySelector('input[name="password"]');
    const confirmPassword = form.querySelector('input[name="confirmPassword"]');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        isValid = false;
    }

    // Validate terms checkbox
    const terms = form.querySelector('input[type="checkbox"]');
    if (terms && !terms.checked) {
        showError(terms, 'You must agree to the terms and conditions');
        isValid = false;
    }

    return isValid;
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 0) {
        value = value.match(new RegExp('.{1,3}', 'g')).join('-');
    }
    input.value = value;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function clearError(input) {
    if (!input) return;
    
    const formGroup = input.closest('.form-group');
    if (!formGroup) return;
    
    const errorElement = formGroup.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    input.style.borderColor = '#ddd';
}

// Add this function to check login status on page load
function checkLoginStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateAuthUI({ email: user.email });
    }
}

// Social login handlers
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', function() {
        const provider = this.dataset.provider;
        // Here you would implement the social login logic
        console.log(`Logging in with ${provider}`);
    });
}); 