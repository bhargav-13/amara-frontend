// Function to load reviews into testimonials section
async function loadTestimonials() {
    try {
        const reviewsList = document.querySelector('.testimonials-grid');
        if (!reviewsList) return;

        // Get the first 3 reviews ordered by timestamp
        const snapshot = await db
            .collection('reviews')
            .orderBy('timestamp', 'desc')
            .limit(3)
            .get();

        // Clear existing testimonials
        reviewsList.innerHTML = '';

        if (snapshot.empty) {
            console.log('No reviews found');
            return;
        }

        snapshot.forEach(doc => {
            const review = doc.data();
            const reviewElement = document.createElement('div');
            reviewElement.className = 'testimonial-card';
            
            // Create the review HTML using the existing testimonial card structure
            reviewElement.innerHTML = `
                <div class="testimonial-content">
                    <h4>${review.firstName} ${review.lastName}</h4>
                    <p>${review.text}</p>
                </div>
                <div class="rating">${'★'.repeat(review.rating)}</div>
            `;
            
            reviewsList.appendChild(reviewElement);
        });
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Load testimonials when the page loads
document.addEventListener('DOMContentLoaded', loadTestimonials); 