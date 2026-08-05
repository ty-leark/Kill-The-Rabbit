
/* ==========================================================
KILL THE RABBIT — CINEMATIC UI SYSTEM v3
UNIFIED MULTI-PAGE ENGINE
========================================================== */

/* =========================
MOBILE MENU SYSTEM
========================= */

const menu = document.querySelector('#mobile-menu');
const nav = document.querySelector('.navbar__menu');

if (menu && nav) {
    menu.addEventListener('click', () => {
        menu.classList.toggle('is-active');
        nav.classList.toggle('active');
    });
}

/* =========================
SCROLL REVEAL ENGINE
========================= */

const revealItems = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.12
});

revealItems.forEach(el => revealObserver.observe(el));

/* =========================
PARALLAX ENGINE (SAFE)
========================= */

window.addEventListener('scroll', () => {

    const y = window.scrollY;

    document.querySelectorAll('.parallax').forEach(el => {
        el.style.transform = `translateY(${y * 0.12}px)`;
    });

});

/* =========================
GLITCH IMAGE ENGINE (HATTER SUPPORT)
========================= */

const heroImage = document.getElementById('main__img');

if (heroImage && heroImage.dataset.glitch) {

    const normal = heroImage.src;
    const glitch = heroImage.dataset.glitch;

    setInterval(() => {

        heroImage.src = glitch;

        setTimeout(() => {
            heroImage.src = normal;
        }, 180);

    }, 3800);
}

/* =========================
NAV ACTIVE STATE ENGINE
========================= */

const currentPage = window.location.pathname.split('/').pop();

document.querySelectorAll('.navbar__links').forEach(link => {

    const href = link.getAttribute('href');

    if (href && href === currentPage) {
        link.classList.add('active');
    }

});

