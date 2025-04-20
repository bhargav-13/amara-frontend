document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navCenter = document.querySelector('.nav-center');

    hamburger.addEventListener('click', () => {
        navCenter.classList.toggle('active');
    });

    // Close dropdown when clicking a link
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navCenter.classList.remove('active');
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!navCenter.contains(e.target) && !hamburger.contains(e.target)) {
            navCenter.classList.remove('active');
        }
    });
});