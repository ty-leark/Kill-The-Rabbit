// ==========================================================
// KILL THE RABBIT
// INVESTIGATION ENGINE v4 — Progressive Unlock + Clue Trails
// ==========================================================

const GAME_STATE_KEY = "alice_incident_state";
const VISITED_KEY = "alice_incident_pages";
const STORAGE = window.sessionStorage;

// Clear legacy localStorage saves so prior visits cannot bleed into a new session
try {
    localStorage.removeItem(GAME_STATE_KEY);
    localStorage.removeItem(VISITED_KEY);
} catch (err) {
    /* ignore */
}

const CATEGORY_ALIAS = {
    environment: "environments",
    environments: "environments",
    evidence: "evidence",
    memories: "memories",
    queen: "queen"
};

const PAGE_EVIDENCE = {
    "doc1.html": "green-man",
    "doc.html": "guard"
};

// First visit to a subject file reveals them in the Suspects log
const PAGE_SUSPECTS = {
    "index.html": "rabbit",
    "hatter.html": "hatter",
    "queen.html": "queen"
};

// Trail file pages cannot be opened before their prior clue is earned
const PAGE_GATES = {
    "memorial.html": {
        canAccess: (s) => !!s.unlocked.cipher || !!s.trails.memorial,
        message: "ACCESS DENIED: DECRYPT WATCHTOWER CIPHER FIRST",
        title: "MEMORIAL SEALED",
        hint: "Decrypt the Watchtower Cipher before this site will open.",
        returnHref: "queen.html",
        returnLabel: "Return to Queen File"
    },
    "mailbox.html": {
        canAccess: (s) => !!s.trails.memorial || !!s.trails.mailbox,
        message: "ACCESS DENIED: MEMORIAL SIGNAL REQUIRED",
        title: "VOICEMAIL SEALED",
        hint: "Open the memorial plaque first. This recording stays scrambled until then.",
        returnHref: "alice.html",
        returnLabel: "Return to Alice File"
    },
    "diary.html": {
        canAccess: (s) => !!s.trails.mailbox || !!s.trails.diary,
        message: "ACCESS DENIED: VOICEMAIL SIGNAL REQUIRED",
        title: "DIARY SEALED",
        hint: "Recover the mailbox voice first. This entry stays glued shut until then.",
        returnHref: "alice.html",
        returnLabel: "Return to Alice File"
    }
};

const CASE = {
    limits: {
        evidence: 2,
        memories: 2,
        environments: 2,
        queen: 2
    },

    evidence: {
        "green-man": {
            name: "GREEN MAN TIN",
            lockedBlurb: "Unknown forensic artifact.",
            unlockedBlurb: "Wire strangle residue. Pattern does not match royal pike protocol.",
            dossier:
                "Forensic anomaly: green enamel tin recovered near the eastern hedge. Interior wiring suggests strangulation — not a clean execution. Someone wanted this to look like a Guard strike."
        },
        guard: {
            name: "ROYAL GUARD",
            lockedBlurb: "Identity withheld.",
            unlockedBlurb: "Pike trajectory logged. Impact angle contradicts official report.",
            dossier:
                "Pike impact analysis indicates a fatal trajectory from behind and below. The Guard's statement claims a frontal engagement. One of these accounts is false."
        },
        cipher: {
            name: "WATCHTOWER CIPHER",
            lockedBlurb: "FILE ENCRYPTED",
            unlockedBlurb: "Partial decrypt recovered from overlapping memory/location signals.",
            dossier:
                "He was never late.\nHe was EARLY for the wrong funeral.\n\nCOORDINATE FRAGMENT: MEMORIAL: EAST HEDGE\nSpeak that word to the sealed plaque."
        }
    },

    // Cipher → Memorial → Mailbox → Diary → Queen
    trails: {
        memorial: {
            title: "Sealed Plaque",
            codes: ["EARLY"],
            requires: (s) => !!s.unlocked.cipher,
            blockedHint:
                "The plaque refuses inspection. Decrypt the Watchtower Cipher first.",
            openHint: "The cipher left a single word for this place.",
            timelineTitle: "Memorial Plaque Opened",
            timelineBody: "Inscription recovered: next signal: mailbox.",
            next: "mailbox"
        },
        mailbox: {
            title: "Voicemail Lock",
            codes: ["TICKTOCK", "TICK TOCK"],
            requires: (s) => !!s.trails.memorial,
            blockedHint:
                "The recording is scrambled. Open the memorial plaque first.",
            openHint: "Enter the soot-scratched phrase from the memorial.",
            timelineTitle: "Voicemail Unlocked",
            timelineBody: "Voice fragment recovered: check the diary walls.",
            next: "diary"
        },
        diary: {
            title: "Sealed Diary Entry",
            codes: ["RABBIT"],
            requires: (s) => !!s.trails.mailbox,
            blockedHint:
                "This entry is glued shut. Recover the mailbox voice first.",
            openHint: "The walls keep almost-spelling a name. Enter it cleanly.",
            timelineTitle: "Diary Seal Broken",
            timelineBody: "Hidden entry recovered: Queen contradiction pending.",
            next: "queen"
        },
        queen: {
            title: "Queen Contradiction",
            codes: ["CORNERED"],
            requires: (s) => !!s.trails.diary,
            blockedHint:
                "Royal intel remains redacted. Finish the diary trail first.",
            openHint: "Enter the clearance word from the sealed diary entry.",
            timelineTitle: "Queen Contradiction Logged",
            timelineBody: "Official narrative fractures: ??? page stirring.",
            next: null
        }
    },

    suspects: {
        rabbit: {
            name: "WHITE RABBIT",
            status: "AT LARGE",
            blurb: "Primary subject. Last confirmed near the eastern hedge maze."
        },
        hatter: {
            name: "MAD HATTER",
            status: "PERSON OF INTEREST",
            blurb: "Denies involvement. Tea party logs show a missing guest seat the night of the breach."
        },
        queen: {
            name: "QUEEN OF HEARTS",
            status: "ROYAL CLEARANCE",
            blurb: "Official narrative conflicts with recovered memorial and diary signals. Approach carefully."
        }
    },

    objectives: [
        {
            id: "obj-evidence",
            title: "Recover First Evidence",
            lockedHint: "Inspect the Green Man Tin file.",
            unlockWhen: () => true,
            completeWhen: (s) => s.evidence >= 1
        },
        {
            id: "obj-trail",
            title: "Locate Rabbit Trail",
            lockedHint: "No intelligence available.",
            activeHint: "Go Down. Follow unstable environments.",
            unlockWhen: (s) => s.evidence >= 1,
            completeWhen: (s) => s.environments >= 1
        },
        {
            id: "obj-memory",
            title: "Recover Lost Memory",
            lockedHint: "Unknown location...",
            activeHint: "Open the memorial, then play the intercepted voicemail.",
            unlockWhen: (s) => !!s.unlocked.cipher,
            completeWhen: (s) => s.memories >= 1
        },
        {
            id: "obj-cipher-trail",
            title: "Follow the Cipher Trail",
            lockedHint: "Encrypted file still sealed.",
            activeHint: "Memorial → Mailbox → Diary → Queen",
            unlockWhen: (s) => !!s.unlocked.cipher,
            completeWhen: (s) => !!s.trails.queen
        }
    ],

    queenIntel: [
        { min: 0, text: '"No reliable intelligence has been recovered."' },
        { min: 1, text: '"A name keeps surfacing in sealed memorial logs. The Queen forbids further inquiry."' },
        { min: 2, text: '"Clearance elevated. The Queen\'s network is watching the investigator as closely as the Rabbit."' }
    ]
};

// ==========================================================
// STATE
// ==========================================================

function defaultState() {
    return {
        evidence: 0,
        memories: 0,
        environments: 0,
        queen: 0,
        rank: "OPEN CASE",
        unlocked: {
            "suspect-rabbit": true
        },
        trails: {
            memorial: false,
            mailbox: false,
            diary: false,
            queen: false
        },
        lastDiscovery: "None",
        timeline: [
            {
                id: "case-opened",
                title: "Case Opened",
                body: "Royal investigation initiated."
            },
            {
                id: "suspect-rabbit",
                title: "Suspect Identified: WHITE RABBIT",
                body: "Primary subject. Last confirmed near the eastern hedge maze."
            }
        ]
    };
}

function getState() {
    let raw = null;
    try {
        raw = JSON.parse(STORAGE.getItem(GAME_STATE_KEY));
    } catch (err) {
        raw = null;
    }
    if (!raw || typeof raw !== "object") return defaultState();
    const base = defaultState();
    return {
        ...base,
        ...raw,
        unlocked: { ...base.unlocked, ...(raw.unlocked || {}) },
        trails: { ...base.trails, ...(raw.trails || {}) },
        timeline: Array.isArray(raw.timeline) && raw.timeline.length
            ? raw.timeline
            : base.timeline
    };
}

function saveState(state) {
    try {
        STORAGE.setItem(GAME_STATE_KEY, JSON.stringify(state));
    } catch (err) {
        console.warn("Case state could not be saved.", err);
    }
}

function getVisited() {
    try {
        return JSON.parse(STORAGE.getItem(VISITED_KEY)) || [];
    } catch (err) {
        return [];
    }
}

function saveVisited(visited) {
    try {
        STORAGE.setItem(VISITED_KEY, JSON.stringify(visited));
    } catch (err) {
        console.warn("Visit log could not be saved.", err);
    }
}

function currentPage() {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
}

function caseTotal(state) {
    return state.evidence + state.memories + state.environments + state.queen;
}

function caseMax() {
    return Object.values(CASE.limits).reduce((a, b) => a + b, 0);
}

// ==========================================================
// INIT
// ==========================================================

function initializeInvestigation() {
    mountInvestigationTerminal();
    bindQuestionNav();
    bindPageGates();
    bindMobileNav();
    bindTerminalCollapse();

    if (!enforcePageGate()) {
        updateUI();
        return;
    }

    registerPageVisit();
    evaluateUnlocks();
    bindTabs();
    bindInspect();
    bindDossier();
    bindTrailForms();
    bindReveal();
    guardQuestionPage();
    updateUI();
    logEvent("SYSTEM ONLINE: INVESTIGATION INITIATED");
}

// Backward-compatible entry used by older pages
function updateLog() {
    initializeInvestigation();
}

// ==========================================================
// TERMINAL MOUNT (replaces legacy #investigation-log)
// ==========================================================

function mountInvestigationTerminal() {
    document.body.classList.add("has-terminal");

    // Always prefer the shared markup so index and subpages stay in sync
    let terminal = document.getElementById("terminal");
    if (!terminal) {
        terminal = document.createElement("aside");
        terminal.id = "terminal";
        document.body.appendChild(terminal);
    }
    terminal.innerHTML = getTerminalMarkup();

    ensureOverlayChrome();
}

function ensureOverlayChrome() {
    if (!document.getElementById("notification")) {
        const notification = document.createElement("div");
        notification.id = "notification";
        notification.innerHTML = `
            <div class="notify-icon">✓</div>
            <div>
                <h3>NEW DISCOVERY</h3>
                <p id="notification-text">Evidence recovered.</p>
            </div>
        `;
        document.body.appendChild(notification);
    }

    if (!document.getElementById("dossier-viewer")) {
        const dossier = document.createElement("div");
        dossier.id = "dossier-viewer";
        dossier.className = "hidden";
        dossier.innerHTML = `
            <div class="dossier-window">
                <button id="close-dossier" type="button">✕</button>
                <div class="classified">TOP SECRET</div>
                <h2 id="dossier-title">Recovered File</h2>
                <p id="dossier-description">Awaiting data...</p>
                <div id="dossier-content"></div>
            </div>
        `;
        document.body.appendChild(dossier);
    }
}

function getTerminalMarkup() {
    return `
    <header class="terminal-header">
        <div class="terminal-status">
            <div class="status-dot"></div>
            <div>
                <p class="terminal-kicker">ROYAL INVESTIGATION BUREAU</p>
                <h2>CASE FILE 01</h2>
            </div>
        </div>
        <div class="terminal-header-actions">
            <button type="button" class="terminal-collapse" id="terminal-collapse" aria-expanded="true" title="Minimize terminal">—</button>
            <div class="clearance">
                <span>LEVEL</span>
                <strong>V</strong>
            </div>
        </div>
    </header>

    <section class="terminal-progress">
        <div class="progress-title">
            <span>CASE COMPLETION</span>
            <strong id="case-percent">0%</strong>
        </div>
        <div class="progress-bar"><div id="progress-fill"></div></div>
        <p id="case-status">Awaiting first discovery...</p>
    </section>

    <section class="terminal-objectives">
        <div class="section-heading">CURRENT OBJECTIVES</div>
        <div id="objective-list"></div>
    </section>

    <nav class="terminal-tabs">
        <button class="tab active" data-tab="overview" type="button">Overview</button>
        <button class="tab" data-tab="evidence" type="button">Evidence</button>
        <button class="tab" data-tab="suspects" type="button">Suspects</button>
        <button class="tab" data-tab="timeline" type="button">Timeline</button>
        <button class="tab" data-tab="queen" type="button">Queen</button>
    </nav>

    <div class="terminal-content">
        <section class="tab-panel active" id="overview">
            <div class="stats-grid">
                <div class="stat-card">
                    <span class="stat-label">Evidence</span>
                    <h3 id="log-evidence">0 / 2</h3>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Recovered Memories</span>
                    <h3 id="log-memories">0 / 2</h3>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Locations</span>
                    <h3 id="log-environments">0 / 2</h3>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Queen Intel</span>
                    <h3 id="log-queen">0 / 2</h3>
                </div>
            </div>
            <div class="live-status">
                <div class="status-line"><span>SYSTEM</span><strong id="system-state">ONLINE</strong></div>
                <div class="status-line"><span>LAST DISCOVERY</span><strong id="last-discovery">None</strong></div>
                <div class="status-line"><span>CASE RANK</span><strong id="case-rank">OPEN CASE</strong></div>
                <div class="status-line"><span>CIPHER TRAIL</span><strong id="trail-status">LOCKED: decrypt watchtower cipher</strong></div>
                <div class="status-line"><span>??? CHANNEL</span><strong id="question-status">SEALED: trail or critical event required</strong></div>
            </div>
        </section>

        <section class="tab-panel" id="evidence">
            <div class="panel-title">Recovered Evidence</div>
            <div id="evidence-board">
                <div class="evidence-file locked" data-id="green-man">
                    <div class="file-top">CLASSIFIED</div>
                    <h3>GREEN MAN TIN</h3>
                    <p>Unknown forensic artifact.</p>
                    <button class="inspect" data-open="green-man" type="button">Inspect</button>
                </div>
                <div class="evidence-file locked" data-id="guard">
                    <div class="file-top">CLASSIFIED</div>
                    <h3>ROYAL GUARD</h3>
                    <p>Identity withheld.</p>
                    <button class="inspect" data-open="guard" type="button">Inspect</button>
                </div>
                <div class="evidence-file secret locked" data-id="cipher">
                    <div class="secret-overlay">FILE ENCRYPTED</div>
                    <div class="file-top">SEALED</div>
                    <h3>WATCHTOWER CIPHER</h3>
                    <p data-cipher-blurb>Requires memory + environment correlation.</p>
                    <button class="inspect" data-open="cipher" type="button">Inspect</button>
                </div>
            </div>
        </section>

        <section class="tab-panel" id="suspects">
            <div class="panel-title">Primary Persons of Interest</div>
            <div class="suspect-grid">
                <article class="suspect-card" id="suspect-rabbit">
                    <div class="portrait rabbit"></div>
                    <h3>WHITE RABBIT</h3>
                    <p data-suspect-status>Status: AT LARGE</p>
                    <p data-suspect-blurb>Primary subject. Last confirmed near the eastern hedge maze.</p>
                    <div class="threat">Threat Level<div class="meter"><div class="fill" style="width:92%;"></div></div></div>
                </article>
                <article class="suspect-card locked" id="suspect-hatter">
                    <div class="portrait hatter"></div>
                    <h3>UNKNOWN</h3>
                    <p data-suspect-status>Identity concealed.</p>
                    <p data-suspect-blurb>Awaiting discovery.</p>
                </article>
                <article class="suspect-card locked" id="suspect-queen">
                    <div class="portrait queen"></div>
                    <h3>UNKNOWN</h3>
                    <p data-suspect-status>Identity concealed.</p>
                    <p data-suspect-blurb>Awaiting discovery.</p>
                </article>
            </div>
        </section>

        <section class="tab-panel" id="timeline">
            <div class="panel-title">Investigation Timeline</div>
            <div class="timeline" id="timeline-list"></div>
        </section>

        <section class="tab-panel" id="queen">
            <div class="panel-title">Queen Intelligence Network</div>
            <div class="intel-window">
                <p id="queen-report">"No reliable intelligence has been recovered."</p>
            </div>
            <div class="clearance-meter">
                <div class="meter-label">Security Clearance</div>
                <div class="meter"><div id="clearance-fill" class="fill"></div></div>
            </div>
        </section>
    </div>

    <section class="activity-feed">
        <div class="feed-title">LIVE INVESTIGATION FEED</div>
        <div id="feed-list">
            <div class="feed-entry">Waiting for investigator...</div>
        </div>
    </section>
    `;
}

// ==========================================================
// PAGE TRACKING
// ==========================================================

function registerPageVisit() {
    const page = currentPage();
    let visited = getVisited();
    const isNew = !visited.includes(page);

    if (isNew) {
        visited.push(page);
        saveVisited(visited);
    }

    const rawCategory = document.body.dataset.category;
    const category = CATEGORY_ALIAS[rawCategory];
    const state = getState();
    let changed = false;

    if (isNew && category && state[category] !== undefined) {
        const before = state[category];
        state[category] = Math.min(state[category] + 1, CASE.limits[category]);
        if (state[category] !== before) {
            state.lastDiscovery = page;
            changed = true;
            pushTimeline(state, {
                id: `visit-${page}`,
                title: `Site Recovered: ${formatPageName(page)}`,
                body: `Category signal: ${category.toUpperCase()}`
            });
        }
    }

    const evidenceId = PAGE_EVIDENCE[page];
    if (evidenceId && !state.unlocked[evidenceId]) {
        state.unlocked[evidenceId] = true;
        changed = true;
    }

    if (revealSuspectFromPage(page, state)) {
        changed = true;
    }

    if (changed) {
        updateCaseRank(state);
        saveState(state);
        if (isNew && category) {
            triggerDiscovery(category, page);
        }
    }
}

function formatPageName(page) {
    return page.replace(".html", "").replace(/[-_]/g, " ").toUpperCase();
}

// ==========================================================
// UNLOCK EVALUATION
// ==========================================================

function evaluateUnlocks() {
    const state = getState();
    let changed = false;

    // Encrypted third file: evidence + environment (memories stay trail-gated)
    if (
        !state.unlocked.cipher &&
        state.evidence >= 1 &&
        state.environments >= 1
    ) {
        state.unlocked.cipher = true;
        changed = true;
        pushTimeline(state, {
            id: "cipher-decrypt",
            title: "Encrypted File Broken",
            body: "Watchtower cipher partially decrypted."
        });
        showNotification("ENCRYPTED FILE DECRYPTED");
        logEvent("DECRYPT SUCCESS: WATCHTOWER CIPHER");
    }

    // Suspect reveals: White Rabbit is known from case open;
    // Alice / Hatter / Queen unlock on first visit to their subject file.
    if (revealSuspectFromPage("index.html", state, { notify: false })) changed = true;
    getVisited().forEach((page) => {
        if (revealSuspectFromPage(page, state, { notify: false })) changed = true;
    });

    // Sync evidence flags from visited pages (for returning players)
    Object.entries(PAGE_EVIDENCE).forEach(([page, id]) => {
        if (getVisited().includes(page) && !state.unlocked[id]) {
            state.unlocked[id] = true;
            changed = true;
        }
    });

    if (changed) {
        updateCaseRank(state);
        saveState(state);
    }
}

function revealSuspectFromPage(page, state = getState(), { notify = true } = {}) {
    const key = PAGE_SUSPECTS[page];
    if (!key) return false;

    const unlockKey = `suspect-${key}`;
    if (state.unlocked[unlockKey]) return false;

    state.unlocked[unlockKey] = true;
    const data = CASE.suspects[key];
    pushTimeline(state, {
        id: unlockKey,
        title: `Suspect Identified: ${data.name}`,
        body: data.blurb
    });

    if (notify && key !== "rabbit") {
        showNotification(`SUSPECT IDENTIFIED: ${data.name}`);
        logEvent(`SUSPECT IDENTIFIED: ${data.name}`);
    }

    return true;
}

function pushTimeline(state, entry) {
    if (!state.timeline.some((t) => t.id === entry.id)) {
        state.timeline.push(entry);
    }
}

// ==========================================================
// DISCOVERY
// ==========================================================

function triggerDiscovery(type, page) {
    logEvent(`NEW DISCOVERY: ${formatPageName(page)}: ${type.toUpperCase()}`);
    showNotification("NEW DISCOVERY RECOVERED");
    evaluateUnlocks();
    updateUI();
}

// ==========================================================
// CASE RANK
// ==========================================================

function updateCaseRank(state) {
    const total = caseTotal(state);
    let rank = "OPEN CASE";

    if (total >= 2) rank = "ACTIVE INVESTIGATION";
    if (total >= 4) rank = "PRIME SUSPECT IDENTIFIED";
    if (total >= 6) rank = "CLASSIFIED THREAT";
    if (total >= 8) rank = "CRITICAL EVENT";

    state.rank = rank;
}

// ==========================================================
// UI
// ==========================================================

function updateUI() {
    const state = getState();

    // Terminal counters
    setText("log-evidence", `${state.evidence} / ${CASE.limits.evidence}`);
    setText("log-memories", `${state.memories} / ${CASE.limits.memories}`);
    setText("log-environments", `${state.environments} / ${CASE.limits.environments}`);
    setText("log-queen", `${state.queen} / ${CASE.limits.queen}`);

    // Legacy sidebar IDs used on older pages
    setText("log-suspect", `${state.evidence}/${CASE.limits.evidence}`);
    setText("log-theory", `${state.memories}/${CASE.limits.memories}`);
    setText("log-stability", `${state.environments}/${CASE.limits.environments}`);
    setText("log-rabbit", `${state.queen}/${CASE.limits.queen}`);

    setText("case-rank", state.rank);
    setText("last-discovery", state.lastDiscovery === "None"
        ? "None"
        : formatPageName(state.lastDiscovery));

    const percent = Math.round((caseTotal(state) / caseMax()) * 100);
    setText("case-percent", `${percent}%`);

    const fill = document.getElementById("progress-fill");
    if (fill) fill.style.width = `${percent}%`;

    const status = document.getElementById("case-status");
    if (status) {
        status.textContent = percent === 0
            ? "Awaiting first discovery..."
            : percent < 100
                ? `Investigation ${percent}% complete: keep digging`
                : "All known channels exhausted: re-examine contradictions";
    }

    updateEvidenceBoard(state);
    updateObjectives(state);
    updateSuspects(state);
    updateTimeline(state);
    updateQueenIntel(state);
    updateClearance(state);
    updateTrailPanels(state);
    updateTrailStatus(state);
    updateQuestionAccess(state);
    updatePageAccess(state);
}

function updateEvidenceBoard(state) {
    updateEvidenceCard("green-man", state);
    updateEvidenceCard("guard", state);
    updateCipherCard(state);
}

function updateEvidenceCard(id, state) {
    const card = document.querySelector(`.evidence-file[data-id="${id}"]`);
    if (!card) return;

    const data = CASE.evidence[id];
    const unlocked = !!state.unlocked[id];
    const blurb = card.querySelector("p");
    const top = card.querySelector(".file-top");

    card.classList.toggle("locked", !unlocked);
    card.classList.toggle("unlocked", unlocked);

    if (top) top.textContent = unlocked ? "RECOVERED" : "CLASSIFIED";
    if (blurb) blurb.textContent = unlocked ? data.unlockedBlurb : data.lockedBlurb;
}

function updateCipherCard(state) {
    const card = document.querySelector('.evidence-file[data-id="cipher"]');
    if (!card) return;

    const unlocked = !!state.unlocked.cipher;
    card.classList.toggle("locked", !unlocked);
    card.classList.toggle("unlocked", unlocked);
    card.classList.toggle("decrypted", unlocked);

    const overlay = card.querySelector(".secret-overlay");
    if (overlay) {
        overlay.textContent = unlocked ? "DECRYPTED" : "FILE ENCRYPTED";
    }

    const blurb = card.querySelector("[data-cipher-blurb]");
    if (blurb) {
        blurb.textContent = unlocked
            ? CASE.evidence.cipher.unlockedBlurb
            : "Requires memory + environment correlation.";
    }
}

function updateObjectives(state) {
    const list = document.getElementById("objective-list");
    if (!list) return;

    list.replaceChildren();

    CASE.objectives.forEach((obj) => {
        const unlocked = obj.unlockWhen(state);
        const complete = obj.completeWhen(state);
        let cls = "objective locked";
        let hint = obj.lockedHint;

        if (complete) {
            cls = "objective completed";
            hint = obj.activeHint || obj.lockedHint;
        } else if (unlocked) {
            cls = "objective active";
            hint = obj.activeHint || obj.lockedHint;
        }

        const row = document.createElement("div");
        row.className = cls;
        row.dataset.objective = obj.id;

        const icon = document.createElement("div");
        icon.className = "objective-icon";

        const copy = document.createElement("div");
        const title = document.createElement("h4");
        title.textContent = obj.title;
        const body = document.createElement("p");
        body.textContent = hint;
        copy.append(title, body);

        row.append(icon, copy);
        list.appendChild(row);
    });
}

function updateSuspects(state) {
    renderSuspect("suspect-rabbit", "rabbit", !!state.unlocked["suspect-rabbit"]);
    renderSuspect("suspect-hatter", "hatter", !!state.unlocked["suspect-hatter"]);
    renderSuspect("suspect-queen", "queen", !!state.unlocked["suspect-queen"]);
}

function renderSuspect(elementId, key, unlocked) {
    const card = document.getElementById(elementId);
    if (!card) return;

    const data = CASE.suspects[key];
    card.classList.toggle("locked", !unlocked);

    const name = card.querySelector("h3");
    const status = card.querySelector("[data-suspect-status]");
    const blurb = card.querySelector("[data-suspect-blurb]");
    const threat = card.querySelector(".threat");

    if (!unlocked) {
        if (name) name.textContent = "UNKNOWN";
        if (status) status.textContent = "Identity concealed.";
        if (blurb) blurb.textContent = "Awaiting discovery.";
        if (threat) threat.hidden = true;
        return;
    }

    if (name) name.textContent = data.name;
    if (status) status.textContent = data.status;
    if (blurb) blurb.textContent = data.blurb;
    if (threat) threat.hidden = false;
}

function updateTimeline(state) {
    const list = document.getElementById("timeline-list");
    if (!list) return;

    list.replaceChildren();

    state.timeline.forEach((item, i) => {
        const row = document.createElement("div");
        row.className = `timeline-item${i === state.timeline.length - 1 ? " active" : ""}`;

        const marker = document.createElement("div");
        marker.className = "time-marker";

        const copy = document.createElement("div");
        const title = document.createElement("h4");
        title.textContent = item.title || "";
        const body = document.createElement("p");
        body.textContent = item.body || "";
        copy.append(title, body);

        row.append(marker, copy);
        list.appendChild(row);
    });
}

function updateQueenIntel(state) {
    const report = document.getElementById("queen-report");
    if (!report) return;

    if (state.trails.queen) {
        report.textContent =
            '"Contradiction confirmed. \"Kill the Rabbit\" was cover. The Queen already had him cornered — and still ordered the hunt. The ??? channel is no longer silent."';
        return;
    }

    let text = CASE.queenIntel[0].text;
    CASE.queenIntel.forEach((entry) => {
        if (state.queen >= entry.min) text = entry.text;
    });
    report.textContent = text;
}

function updateClearance(state) {
    const fill = document.getElementById("clearance-fill");
    if (!fill) return;
    const trailBonus = state.trails.queen ? 25 : 0;
    const pct = Math.min(100, (state.queen / CASE.limits.queen) * 75 + trailBonus);
    fill.style.width = `${pct}%`;
}

// ==========================================================
// CLUE TRAILS
// ==========================================================

function normalizeCode(value) {
    return String(value || "")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "");
}

function bindTrailForms() {
    document.querySelectorAll("[data-trail-form]").forEach((form) => {
        if (form.dataset.bound === "1") return;
        form.dataset.bound = "1";

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const id = form.dataset.trailForm;
            const input = form.querySelector("input");
            submitTrailCode(id, input ? input.value : "");
        });
    });
}

function submitTrailCode(id, rawValue) {
    const trail = CASE.trails[id];
    const panel = document.querySelector(`[data-trail="${id}"]`);
    const feedback = panel?.querySelector("[data-trail-feedback]");
    if (!trail) return;

    const state = getState();

    if (state.trails[id]) {
        updateTrailPanels(state);
        return;
    }

    if (!trail.requires(state)) {
        if (feedback) {
            feedback.textContent = trail.blockedHint;
            feedback.classList.remove("is-success");
        }
        return;
    }

    const guess = normalizeCode(rawValue);
    const accepted = trail.codes.some((code) => normalizeCode(code) === guess);

    if (!accepted) {
        if (feedback) {
            feedback.textContent = "REJECTED: phrase does not match sealed record";
            feedback.classList.remove("is-success");
        }
        logEvent(`TRAIL REJECTED: ${id.toUpperCase()}`);
        return;
    }

    state.trails[id] = true;
    state.lastDiscovery = `${id}-trail`;
    pushTimeline(state, {
        id: `trail-${id}`,
        title: trail.timelineTitle,
        body: trail.timelineBody
    });
    updateCaseRank(state);
    saveState(state);

    if (feedback) {
        feedback.textContent = "ACCEPTED: seal broken";
        feedback.classList.add("is-success");
    }

    showNotification(`TRAIL OPENED: ${trail.title.toUpperCase()}`);
    logEvent(`TRAIL SOLVED: ${id.toUpperCase()}`);
    updateUI();
}

function updateTrailPanels(state) {
    Object.keys(CASE.trails).forEach((id) => {
        const trail = CASE.trails[id];
        const panel = document.querySelector(`[data-trail="${id}"]`);
        if (!panel) return;

        const ready = trail.requires(state) || !!state.trails[id];
        const solved = !!state.trails[id];

        panel.dataset.ready = ready ? "true" : "false";
        panel.classList.toggle("is-solved", solved);

        const hint = panel.querySelector("[data-trail-hint]");
        if (hint) {
            hint.textContent = ready ? trail.openHint : trail.blockedHint;
        }

        const blocked = panel.querySelector("[data-trail-blocked]");
        if (blocked) {
            blocked.textContent = trail.blockedHint;
        }
    });
}

function updateTrailStatus(state) {
    const el = document.getElementById("trail-status");
    if (!el) return;

    const order = ["memorial", "mailbox", "diary", "queen"];
    const done = order.filter((id) => state.trails[id]).length;

    if (!state.unlocked.cipher) {
        el.textContent = "LOCKED: decrypt watchtower cipher";
        return;
    }

    if (done === 0) {
        el.textContent = "ACTIVE: begin at memorial plaque";
        return;
    }

    if (done < order.length) {
        const next = order.find((id) => !state.trails[id]);
        el.textContent = `${done}/${order.length}: next: ${next.toUpperCase()}`;
        return;
    }

    el.textContent = "COMPLETE: contradiction confirmed";
}

function isQuestionUnlocked(state = getState()) {
    return !!state.trails.queen || state.rank === "CRITICAL EVENT";
}

function bindQuestionNav() {
    document.querySelectorAll('a[href="question.html"], a[href="./question.html"]').forEach((link) => {
        if (link.dataset.questionBound === "1") return;
        link.dataset.questionBound = "1";

        link.addEventListener("click", (e) => {
            if (isQuestionUnlocked()) return;
            e.preventDefault();
            showNotification("ACCESS DENIED: ??? CHANNEL SEALED");
            logEvent("ACCESS DENIED: ??? CHANNEL SEALED");
        });
    });
}

function pageGateForHref(href) {
    if (!href) return null;
    const file = href.split("/").pop().split("?")[0].split("#")[0];
    return PAGE_GATES[file] || null;
}

function canAccessPage(page = currentPage(), state = getState()) {
    const gate = PAGE_GATES[page];
    if (!gate) return true;
    return gate.canAccess(state);
}

function bindPageGates() {
    document.querySelectorAll("a[href]").forEach((link) => {
        const gate = pageGateForHref(link.getAttribute("href"));
        if (!gate || link.dataset.pageGateBound === "1") return;
        link.dataset.pageGateBound = "1";

        link.addEventListener("click", (e) => {
            const file = link.getAttribute("href").split("/").pop().split("?")[0].split("#")[0];
            if (canAccessPage(file)) return;
            e.preventDefault();
            showNotification(gate.message);
            logEvent(gate.message);
        });
    });
}

function enforcePageGate() {
    const page = currentPage();
    const gate = PAGE_GATES[page];
    if (!gate) return true;

    const state = getState();
    if (gate.canAccess(state)) {
        document.body.classList.remove("page-locked");
        return true;
    }

    document.body.classList.add("page-locked");
    renderPageLockGate(gate);
    showNotification(gate.message);
    logEvent(gate.message);
    return false;
}

function renderPageLockGate(gate) {
    let gateEl = document.getElementById("page-lock-gate");
    if (!gateEl) {
        gateEl = document.createElement("section");
        gateEl.id = "page-lock-gate";
        gateEl.className = "question-lock-gate page-lock-gate";
        document.body.appendChild(gateEl);
    }

    gateEl.innerHTML = `
        <p class="hero__eyebrow">CLEARANCE REQUIRED</p>
        <h1>${gate.title}</h1>
        <p>${gate.hint}</p>
        <p style="margin-top:18px;">
            <a href="${gate.returnHref}" class="button" style="display:inline-flex;padding:10px 18px;background:#e61c06;color:#fff;text-decoration:none;">
                ${gate.returnLabel}
            </a>
        </p>
    `;
}

function updatePageAccess(state = getState()) {
    document.querySelectorAll("a[href]").forEach((link) => {
        const href = link.getAttribute("href");
        const gate = pageGateForHref(href);
        if (!gate) return;

        const file = href.split("/").pop().split("?")[0].split("#")[0];
        const allowed = canAccessPage(file, state);
        link.classList.toggle("nav-locked", !allowed);
        link.setAttribute("aria-disabled", allowed ? "false" : "true");
        link.title = allowed ? "" : gate.message;
    });
}

function bindMobileNav() {
    const toggle = document.getElementById("mobile-menu");
    const menu = document.querySelector(".navbar__menu");
    if (!toggle || !menu || toggle.dataset.bound === "1") return;
    toggle.dataset.bound = "1";

    toggle.addEventListener("click", () => {
        toggle.classList.toggle("is-active");
        menu.classList.toggle("active");
    });
}

function bindReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("active"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    items.forEach((el) => observer.observe(el));
}

function updateQuestionAccess(state) {
    const unlocked = isQuestionUnlocked(state);

    document.querySelectorAll('a[href="question.html"], a[href="./question.html"]').forEach((link) => {
        link.classList.toggle("nav-locked", !unlocked);
        link.title = unlocked
            ? "Unanswered channel"
            : "Sealed: finish cipher trail or reach Critical Event";
        link.setAttribute("aria-disabled", unlocked ? "false" : "true");
    });

    setText(
        "question-status",
        unlocked ? "OPEN: unanswered channel live" : "SEALED: trail or critical event required"
    );
}

function guardQuestionPage() {
    if (currentPage() !== "question.html") return;

    const unlocked = isQuestionUnlocked();
    document.body.classList.toggle("question-locked", !unlocked);
    document.body.classList.toggle("question-unlocked", unlocked);

    if (unlocked) {
        logEvent("??? CHANNEL OPEN: TRANSMISSION RECOVERED");
        runQuestionBreachFinale();
        bindCaseResolvedEnding();
    } else {
        logEvent("??? CHANNEL SEALED: INSUFFICIENT CLEARANCE");
    }
}

function runQuestionBreachFinale() {
    const breach = document.getElementById("breach-screen");
    const logEl = document.getElementById("breach-log");
    const status = document.getElementById("breach-status");
    const tears = document.getElementById("tear-bars");
    const transmission = document.getElementById("transmission");
    if (!breach || !logEl || !transmission) return;
    if (breach.dataset.ran === "1") return;
    breach.dataset.ran = "1";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
        breach.classList.add("is-done");
        breach.setAttribute("hidden", "");
        transmission.hidden = false;
        transmission.classList.add("is-live");
        return;
    }

    const lines = [
        { text: "> LINKING EAST HEDGE NODE…", cls: "" },
        { text: "> SIGNAL NOISE: 87%", cls: "warn" },
        { text: "> BUREAU LOCK: ACTIVE", cls: "warn" },
        { text: "> OVERRIDE PROTOCOL ???", cls: "" },
        { text: "> KEY ACCEPTED — CHANNEL UNSTABLE", cls: "ok" },
        { text: "> WARNING: NON-PROTOCOL CONTENT", cls: "warn" },
        { text: "> STRIPPING INVESTIGATION SHELL…", cls: "" },
        { text: "> OPENING TRANSMISSION", cls: "ok" }
    ];

    let i = 0;
    const dump = () => {
        if (i >= lines.length) {
            if (status) status.textContent = "CHANNEL OPEN";
            window.setTimeout(tearIntoTransmission, 480);
            return;
        }
        const line = lines[i++];
        const row = document.createElement("div");
        if (line.cls) row.className = line.cls;
        row.textContent = line.text;
        logEl.appendChild(row);
        if (status) {
            status.textContent =
                i < lines.length ? "DECRYPTING CHANNEL…" : "SIGNAL BREACH";
        }
        window.setTimeout(dump, 280 + Math.random() * 120);
    };

    const tearIntoTransmission = () => {
        if (tears) tears.classList.add("is-active");
        breach.classList.add("is-done");
        transmission.hidden = false;
        // force paint before anim class
        void transmission.offsetWidth;
        transmission.classList.add("is-live");
        window.setTimeout(() => {
            breach.setAttribute("hidden", "");
            if (tears) tears.classList.remove("is-active");
        }, 700);
    };

    dump();
}

function bindCaseResolvedEnding() {
    const btn = document.getElementById("case-resolved-btn");
    const reel = document.getElementById("ending-reel");
    const frame = document.getElementById("ending-frame");
    const credits = document.getElementById("ending-credits");
    if (!btn || !reel || !frame || btn.dataset.endingBound === "1") return;
    btn.dataset.endingBound = "1";

    // Preload both frames so the handoff is clean
    ["Images/end1.png", "Images/end2.png"].forEach((src) => {
        const img = new Image();
        img.src = src;
    });

    btn.addEventListener("click", () => {
        if (reel.dataset.playing === "1") return;
        reel.dataset.playing = "1";

        frame.src = "Images/end1.png";
        frame.alt = "Ending frame 1";
        if (credits) {
            credits.hidden = true;
            credits.classList.remove("is-live");
        }
        reel.hidden = false;
        void reel.offsetWidth;
        reel.classList.add("is-live");
        document.body.classList.add("ending-active");
        logEvent("CASE RESOLVED: FINAL SEQUENCE");

        window.setTimeout(() => {
            frame.src = "Images/end2.png";
            frame.alt = "Ending frame 2";
        }, 3000);

        window.setTimeout(() => {
            frame.style.display = "none";
            if (credits) {
                credits.hidden = false;
                void credits.offsetWidth;
                credits.classList.add("is-live");
            }
            logEvent("CASE CLOSED: THE END");
        }, 6000);
    });
}

// ==========================================================
// INSPECT / DOSSIER
// ==========================================================

let dossierHideTimer = null;

function bindInspect() {
    document.querySelectorAll(".inspect[data-open]").forEach((btn) => {
        if (btn.dataset.bound === "1") return;
        btn.dataset.bound = "1";
        btn.addEventListener("click", () => openDossier(btn.dataset.open));
    });
}

function bindDossier() {
    const close = document.getElementById("close-dossier");
    const viewer = document.getElementById("dossier-viewer");
    if (!viewer || viewer.dataset.bound === "1") return;
    viewer.dataset.bound = "1";

    if (close) {
        close.addEventListener("click", () => closeDossier());
    }

    viewer.addEventListener("click", (e) => {
        if (e.target === viewer) closeDossier();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeDossier();
    });
}

function closeDossier() {
    const viewer = document.getElementById("dossier-viewer");
    if (!viewer) return;
    clearTimeout(dossierHideTimer);
    dossierHideTimer = null;
    viewer.classList.remove("show");
    viewer.classList.add("hidden");
}

function openDossier(id) {
    const state = getState();
    const data = CASE.evidence[id];
    const viewer = document.getElementById("dossier-viewer");
    if (!viewer || !data) return;

    const unlocked = !!state.unlocked[id];

    setText("dossier-title", data.name);
    setText(
        "dossier-description",
        unlocked ? "FILE ACCESS GRANTED" : "ACCESS DENIED: INSUFFICIENT CLEARANCE"
    );

    const content = document.getElementById("dossier-content");
    if (content) {
        content.textContent = unlocked
            ? data.dossier
            : "This file remains sealed. Recover related material across Wonderland to raise clearance.";
    }

    viewer.classList.remove("hidden");
    viewer.classList.add("show");

    clearTimeout(dossierHideTimer);
    dossierHideTimer = setTimeout(() => closeDossier(), 10000);

    if (unlocked) {
        logEvent(`DOSSIER OPENED: ${data.name}`);
    } else {
        logEvent(`ACCESS DENIED: ${data.name}`);
    }
}

// ==========================================================
// TABS
// ==========================================================

function bindTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
        if (tab.dataset.bound === "1") return;
        tab.dataset.bound = "1";
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
            document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
            tab.classList.add("active");
            const panel = document.getElementById(tab.dataset.tab);
            if (panel) panel.classList.add("active");
        });
    });
}

function bindTerminalCollapse() {
    const terminal = document.getElementById("terminal");
    const btn = document.getElementById("terminal-collapse");
    if (!terminal || !btn || btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";

    const apply = (collapsed) => {
        terminal.classList.toggle("is-collapsed", collapsed);
        document.body.classList.toggle("terminal-collapsed", collapsed);
        btn.setAttribute("aria-expanded", collapsed ? "false" : "true");
        btn.textContent = collapsed ? "+" : "—";
        btn.title = collapsed ? "Expand terminal" : "Minimize terminal";
    };

    btn.addEventListener("click", () => {
        apply(!terminal.classList.contains("is-collapsed"));
    });
}

// ==========================================================
// FEED / NOTIFICATIONS
// ==========================================================

function logEvent(text) {
    const feed = document.getElementById("feed-list");
    if (!feed) return;

    const entry = document.createElement("div");
    entry.className = "feed-entry";
    entry.textContent = text;
    feed.prepend(entry);
}

function showNotification(text) {
    const box = document.getElementById("notification");
    const label = document.getElementById("notification-text");

    if (box && label) {
        label.textContent = text;
        box.classList.add("show");
        setTimeout(() => box.classList.remove("show"), 3000);
        return;
    }

    let toast = document.getElementById("ktr-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "ktr-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.style.opacity = "1";
    clearTimeout(toast._hideTimer);
    toast._hideTimer = setTimeout(() => {
        toast.style.opacity = "0";
    }, 3000);
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ==========================================================
// RESET (DEBUG)
// ==========================================================

function resetGame() {
    STORAGE.removeItem(GAME_STATE_KEY);
    STORAGE.removeItem(VISITED_KEY);
    try {
        localStorage.removeItem(GAME_STATE_KEY);
        localStorage.removeItem(VISITED_KEY);
    } catch (err) {
        /* ignore */
    }
    location.reload();
}
