document.addEventListener("DOMContentLoaded", () => {
    
    // =========================
    // SCROLL REVEAL (shared system)
    // =========================
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll(".reveal").forEach(el => {
        observer.observe(el);
    });

    // =========================
    // IMAGE LOAD SEQUENCE (cinematic feel)
    // =========================
    const img = document.querySelector("#main__img");

    if (img) {
        img.style.opacity = "0";
        img.style.transform = "scale(1.02)";

        img.onload = () => {
            img.style.transition = "1s ease";
            img.style.opacity = "1";
            img.style.transform = "scale(1)";
        };
    }

    // =========================
    // NAVBAR MICRO-INTERACTION (optional enhancement)
    // =========================
    const logo = document.querySelector("#navbar__logo");

    if (logo) {
        setInterval(() => {
            logo.style.textShadow = "0 0 12px rgba(177,0,26,0.3)";
            setTimeout(() => {
                logo.style.textShadow = "none";
            }, 300);
        }, 4000);
    }

});

// ----------------------------
// MOBILE MENU
// ----------------------------

const menu = document.querySelector('#mobile-menu');
const menuLinks = document.querySelector('.navbar__menu');

menu.addEventListener('click', function () {
    menu.classList.toggle('is-active');
    menuLinks.classList.toggle('active');
});


// ----------------------------
// CASE FILE CORE STATE
// ----------------------------

const CaseFile = {
    suspect: "YOU",
    theory: "UNSTABLE",
    stability: "FRAGMENTED",
    evidence: [],

    rabbitState: {
        location: "UNKNOWN",
        stability: 100,
        trust: 100,
        lastMovement: "STATIC",
        sightings: []
    }
};


// ----------------------------
// INITIAL LOG UPDATE
// ----------------------------

function updateLog() {
    document.getElementById("log-suspect").innerText = CaseFile.suspect;
    document.getElementById("log-theory").innerText = CaseFile.theory;
    document.getElementById("log-stability").innerText = CaseFile.stability;

    updateRabbitUI();
}


// ----------------------------
// THEORY ENGINE
// ----------------------------

function setTheory(text) {
    CaseFile.theory = text;
    updateLog();
}


// ----------------------------
// EVIDENCE SYSTEM
// ----------------------------

function revealEvidence(item) {

    CaseFile.evidence.push(item);

    switch (item) {

        case "GREEN MAN TIN":
            setTheory("ANOMALY DETECTED IN INDUSTRIAL SECTOR");
            CaseFile.stability = "SLIGHTLY COMPROMISED";
            CaseFile.rabbitState.lastMovement = "MOVEMENT DETECTED: EASTERN MAZE";
            break;

        case "GUARD TESTIMONY":
            setTheory("AUTHORITIES MAY BE ALTERING REPORTS");
            CaseFile.stability = "QUESTIONABLE";
            CaseFile.rabbitState.lastMovement = "TRACKING INTERFERENCE DETECTED";
            break;

        default:
            setTheory("UNCLASSIFIED DATA INTEGRATED");
            CaseFile.stability = "FRAGMENTED";
            CaseFile.rabbitState.lastMovement = "SIGNAL CORRUPTION DETECTED";
    }

    processRabbitMovement();
    randomGhostReport();
    updateLog();
    triggerEvidenceFlash(item);
}


// ----------------------------
// FALSE SIGHTINGS ENGINE
// ----------------------------

const fakeLocations = [
    "EASTERN HEDGE MAZE",
    "TULGEY WOOD",
    "TEA DISTRICT UNDERPASS",
    "WHITE FOREST EDGE",
    "LOOKING GLASS BORDER",
    "ABANDONED CLOCK TOWER",
    "ROYAL SERVICE TUNNELS"
];

function generateFalseSighting() {

    const randomLocation =
        fakeLocations[Math.floor(Math.random() * fakeLocations.length)];

    const fakeReport = {
        location: randomLocation,
        timestamp: Date.now(),
        validity: "UNCONFIRMED"
    };

    CaseFile.rabbitState.sightings.push(fakeReport);

    return fakeReport;
}


// ----------------------------
// RABBIT MOVEMENT ENGINE
// ----------------------------

function processRabbitMovement() {

    const evidenceCount = CaseFile.evidence.length;

    CaseFile.rabbitState.stability -= evidenceCount * 5;

    if (CaseFile.rabbitState.stability < 0) {
        CaseFile.rabbitState.stability = 0;
    }

    const truthThreshold = CaseFile.rabbitState.stability;
    const deceptionChance = Math.min(0.7, evidenceCount * 0.1);

    const roll = Math.random();

    // FALSE SIGHTINGS ACTIVE STATE
    if (truthThreshold < 40 && roll < deceptionChance) {

        const fake = generateFalseSighting();

        CaseFile.rabbitState.location = fake.location;
        CaseFile.rabbitState.lastMovement =
            "CONFLICTING REPORT DETECTED / SIGNAL CORRUPTED";

        CaseFile.rabbitState.trust -= 15;
    }

    // HIGH STABILITY
    else if (CaseFile.rabbitState.stability > 70) {

        CaseFile.rabbitState.location = "EASTERN HEDGE MAZE";
        CaseFile.rabbitState.lastMovement = "MINIMAL MOVEMENT DETECTED";
    }

    // MEDIUM STABILITY
    else if (CaseFile.rabbitState.stability > 40) {

        CaseFile.rabbitState.location = "TULGEY WOOD";
        CaseFile.rabbitState.lastMovement = "PATTERN SHIFTING";
    }

    // LOW STABILITY
    else if (CaseFile.rabbitState.stability > 15) {

        CaseFile.rabbitState.location = "TEA DISTRICT UNDERPASS";
        CaseFile.rabbitState.lastMovement = "INTERFERENCE IN TRACKING SIGNAL";
    }

    // CRITICAL STATE
    else {

        CaseFile.rabbitState.location = "UNKNOWN / UNSTABLE VECTOR";
        CaseFile.rabbitState.lastMovement = "ENTITY NO LONGER PREDICTABLE";
    }
}


// ----------------------------
// RABBIT UI FEED
// ----------------------------

function updateRabbitUI() {

    const log = document.getElementById("log-rabbit");

    if (!log) return;

    const trustWarning =
        CaseFile.rabbitState.trust < 60
            ? `<span style="color:#ff2a2a; font-size:0.6rem;">
                TRUST COMPROMISED
               </span>`
            : "";

    log.innerHTML = `
        ${CaseFile.rabbitState.location}
        <br>
        <span style="font-size:0.65rem; color:#888;">
            ${CaseFile.rabbitState.lastMovement}
        </span>
        <br>
        ${trustWarning}
    `;
}


// ----------------------------
// GHOST REPORT SYSTEM
// ----------------------------

function randomGhostReport() {

    if (Math.random() < 0.2 && CaseFile.evidence.length > 2) {

        const ghost = generateFalseSighting();

        console.warn("RABBIT SIGHTING LOGGED:", ghost);

        setTheory("MULTIPLE CONFLICTING RABBIT REPORTS DETECTED");
    }
}


// ----------------------------
// VISUAL FEEDBACK SYSTEM
// ----------------------------

function triggerEvidenceFlash(item) {

    const flash = document.createElement("div");

    flash.innerText = `EVIDENCE RECOVERED: ${item}`;

    flash.style.position = "fixed";
    flash.style.top = "50%";
    flash.style.left = "50%";
    flash.style.transform = "translate(-50%, -50%)";

    flash.style.background = "rgba(0,0,0,0.9)";
    flash.style.color = "#ff2a2a";
    flash.style.padding = "20px";
    flash.style.border = "1px solid rgba(255,0,0,0.4)";
    flash.style.zIndex = "99999";
    flash.style.fontFamily = "Alice, serif";

    document.body.appendChild(flash);

    setTimeout(() => {
        flash.remove();
    }, 1800);
}


// ----------------------------
// INITIALIZE SYSTEM
// ----------------------------

updateLog();

const dustLayer = document.getElementById('dust-layer');

for(let i = 0; i < 40; i++){

    const p = document.createElement('div');
    p.classList.add('dust-particle');

    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';

    dustLayer.appendChild(p);

    animateParticle(p);
}

function animateParticle(el){

    let y = Math.random() * window.innerHeight;

    function frame(){

        y -= 0.15;

        if(y < -20){
            y = window.innerHeight + 20;
        }

        el.style.transform =
            `translateY(${y}px)`;

        requestAnimationFrame(frame);
    }

    frame();
}

const reveals =
    document.querySelectorAll(
        '.services__card, .main__content'
    );

reveals.forEach(el => {
    el.classList.add('reveal');
});

const observer =
new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.classList.add('active');
        }

    });

},{
    threshold:.15
});

reveals.forEach(el => {
    observer.observe(el);
});

document
.querySelectorAll('.services__card')
.forEach(card => {

    card.addEventListener(
        'mousemove',
        e => {

            const rect =
                card.getBoundingClientRect();

            const x =
                e.clientX - rect.left;

            const y =
                e.clientY - rect.top;

            card.style.setProperty(
                '--x',
                `${x}px`
            );

            card.style.setProperty(
                '--y',
                `${y}px`
            );

            const rotateY =
                (x / rect.width - .5) * 12;

            const rotateX =
                (y / rect.height - .5) * -12;

            card.style.transform =
                `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                translateY(-8px)
                `;
        }
    );

    card.addEventListener(
        'mouseleave',
        () => {

            card.style.transform =
                'perspective(1000px) rotateX(0) rotateY(0)';
        }
    );
});

function examineEvidence(item, url) {

    revealEvidence(item);

    setTimeout(() => {
        window.location.href = url;
    }, 1500);

}

const img = document.querySelector(".main__container img");
const log = document.getElementById("investigation-log");

if (img && log) {

    img.addEventListener("mouseenter", () => {
        log.style.borderColor = "rgba(255,0,0,0.8)";
    });

    img.addEventListener("mouseleave", () => {
        log.style.borderColor = "rgba(200,0,0,0.4)";
    });
}