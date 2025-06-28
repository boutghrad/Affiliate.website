// Mobile Navigation
document.querySelector('.mobile-menu').addEventListener('click', () => {
    document.querySelector('.nav-menu').classList.toggle('active');
});

// Scroll Management
const scrollTop = document.createElement('div');
scrollTop.className = 'scroll-top';
scrollTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
document.body.appendChild(scrollTop);

window.addEventListener('scroll', () => {
    scrollTop.style.display = window.scrollY > 500 ? 'block' : 'none';
});

scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Popup Controls
let popupShown = false;

const showPopup = () => {
    if (!popupShown) {
        document.querySelector('.newsletter-popup').style.display = 'block';
        popupShown = true;
    }
};

setTimeout(showPopup, 10000);

document.addEventListener('mouseout', (e) => {
    if (!e.toElement && !e.relatedTarget) {
        showPopup();
    }
});

// Cookie Consent
document.querySelector('.cookie-accept').addEventListener('click', () => {
    document.querySelector('.cookie-consent').style.display = 'none';
});

// Star Ratings
document.querySelectorAll('.rating').forEach(rating => {
    const score = parseFloat(rating.dataset.rating);
    rating.innerHTML = Array(5).fill()
        .map((_, i) => `<i class="fas fa-star${i + 0.5 < score ? '' : '-half-alt'}"></i>`)
        .join('');
});
