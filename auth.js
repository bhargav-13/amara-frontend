// Get Firebase auth instance
const auth = firebase.auth();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loaderContainer = document.querySelector('.loader-container');

// Show/Hide loader
function showLoader() {
    if (loaderContainer) loaderContainer.style.display = 'flex';
}

function hideLoader() {
    if (loaderContainer) loaderContainer.style.display = 'none';
}

// Handle login form
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();

        const email = document.getElementById('loginIdentifier').value;
        const password = document.getElementById('password').value;

        try {
            await auth.signInWithEmailAndPassword(email, password);
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        } finally {
            hideLoader();
        }
    });
}

// Handle register form
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoader();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;

        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Add user details to Firestore
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                firstName: firstName,
                lastName: lastName,
                email: email,
                createdAt: new Date()
            });

            window.location.href = 'index.html';
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + error.message);
        } finally {
            hideLoader();
        }
    });
}

// Update UI based on auth state
auth.onAuthStateChanged((user) => {
    const authButtons = document.querySelector('.auth-buttons');
    if (!authButtons) return;

    if (user) {
        // Get user data from Firestore to display full name
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
});

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

// Get Firestore instance
const db = firebase.firestore();

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

// Validate password
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

// Update password requirements UI
function updatePasswordRequirements(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*]/.test(password)
    };

    Object.entries(requirements).forEach(([key, isValid]) => {
        const requirementElement = document.querySelector(`[data-requirement="${key}"]`);
        if (requirementElement) {
            requirementElement.classList.toggle('valid', isValid);
        }
    });
}

// Add password input event listener
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordRequirements(this.value);
        });
    }
});

// Handle country selection
document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const phoneCodeInput = document.getElementById('phoneCode');
    
    if (countrySelect && phoneCodeInput) {
        countrySelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const phoneCode = selectedOption.getAttribute('data-code');
            phoneCodeInput.value = phoneCode;
        });
    }
});

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