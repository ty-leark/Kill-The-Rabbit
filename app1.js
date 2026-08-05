// ==========================================================
// KILL THE RABBIT — CINEMATIC UI ENGINE
// ==========================================================

// -------------------------
// MOBILE NAV TOGGLE
// -------------------------
const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

if (menu && menuLinks) {
    menu.addEventListener('click', () => {
        menu.classList.toggle('is-active');
        menuLinks.classList.toggle('active');
    });
}

// -------------------------
// SCROLL REVEAL SYSTEM
// -------------------------
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.12
});

revealElements.forEach(el => revealObserver.observe(el));

// -------------------------
// PARALLAX DEPTH SYSTEM
// -------------------------
const parallaxItems = document.querySelectorAll('.parallax');

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    parallaxItems.forEach((el) => {
        const speed = 0.15;
        el.style.transform = `translateY(${scrollY * speed}px)`;
    });
});

// -------------------------
// OPTIONAL: TICKER LOOP SAFETY
// (Ensures smooth continuous motion if DOM reflows)
// -------------------------
const ticker = document.querySelector('.ticker__content');

if (ticker) {
    ticker.addEventListener('animationiteration', () => {
        ticker.style.transform = 'translateX(0)';
    });
}

