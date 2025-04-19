// Handle authentication state
firebase.auth().onAuthStateChanged((user) => {
    const authMessage = document.getElementById('auth-message');
    const authenticatedContent = document.getElementById('authenticated-content');

    if (user) {
        // User is signed in
        authMessage.style.display = 'none';
        authenticatedContent.style.display = 'block';
        loadReviews();
        updateAuthButtons(true);
        updateUserInfo(user);
    } else {
        // No user is signed in
        authMessage.style.display = 'block';
        authenticatedContent.style.display = 'none';
        updateAuthButtons(false);
    }
});

// Update user info in the review form
async function updateUserInfo(user) {
    const userName = document.getElementById('userName');
    const letterAvatar = document.getElementById('letterAvatar');
    
    try {
        // Get user's profile from Firestore
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (userData && userData.firstName && userData.lastName) {
            // Set full name
            const fullName = `${userData.firstName} ${userData.lastName}`;
            userName.textContent = fullName;
            
            // Set first letter of first name in avatar
            letterAvatar.textContent = userData.firstName.charAt(0).toUpperCase();
        } else {
            userName.textContent = user.email.split('@')[0];
            letterAvatar.textContent = user.email.charAt(0).toUpperCase();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        userName.textContent = user.email.split('@')[0];
        letterAvatar.textContent = user.email.charAt(0).toUpperCase();
    }
}

// Star rating functionality
const starContainer = document.querySelector('.star-rating');
let selectedRating = 0;

if (starContainer) {
    starContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'I') {
            const rating = parseInt(e.target.getAttribute('data-rating'));
            selectedRating = rating;
            updateStars(rating);
        }
    });

    starContainer.addEventListener('mouseover', (e) => {
        if (e.target.tagName === 'I') {
            const rating = parseInt(e.target.getAttribute('data-rating'));
            updateStars(rating);
        }
    });

    starContainer.addEventListener('mouseleave', () => {
        updateStars(selectedRating);
    });
}

function updateStars(rating) {
    const stars = document.querySelectorAll('.star-rating i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

// Handle review submission
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const user = firebase.auth().currentUser;
        if (!user) {
            alert('Please log in to submit a review');
            return;
        }

        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }

        const reviewText = document.getElementById('reviewText').value;
        if (!reviewText.trim()) {
            alert('Please enter your review');
            return;
        }

        try {
            // Get user's profile data
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            const userData = userDoc.data();

            await firebase.firestore().collection('reviews').add({
                userId: user.uid,
                userEmail: user.email,
                firstName: userData?.firstName || '',
                lastName: userData?.lastName || '',
                rating: selectedRating,
                text: reviewText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Reset form
            selectedRating = 0;
            updateStars(0);
            reviewForm.reset();
            
            // Reload reviews
            loadReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review. Please try again.');
        }
    });
}

// Load reviews
async function loadReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    try {
        const snapshot = await firebase.firestore()
            .collection('reviews')
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();

        reviewsList.innerHTML = '';

        if (snapshot.empty) {
            reviewsList.innerHTML = '<p>No reviews yet. Be the first to share your experience!</p>';
            return;
        }

        snapshot.forEach(doc => {
            const review = doc.data();
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-card';
            
            const userName = review.firstName && review.lastName 
                ? `${review.firstName} ${review.lastName}`
                : review.userEmail.split('@')[0];

            reviewElement.innerHTML = `
                <div class="reviewer-name">${userName}</div>
                <div class="review-stars">
                    ${getStarRating(review.rating)}
                </div>
                <p class="review-text">${review.text}</p>
            `;
            
            reviewsList.appendChild(reviewElement);
        });
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsList.innerHTML = '<p>Error loading reviews. Please try again later.</p>';
    }
}

// Helper function to generate star rating HTML
function getStarRating(rating) {
    return Array(5).fill(0).map((_, index) => 
        `<i class="${index < rating ? 'fas' : 'far'} fa-star"></i>`
    ).join('');
}

// Update auth buttons visibility
function updateAuthButtons(isLoggedIn) {
    const authButtons = document.querySelector('.auth-buttons');
    if (authButtons) {
        authButtons.style.display = isLoggedIn ? 'none' : 'flex';
    }
}

// Handle load more button
const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        // Implement load more functionality here
        // This would involve updating the limit in the loadReviews function
        // and keeping track of the last document
    });
} 