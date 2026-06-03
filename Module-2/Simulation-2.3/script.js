// Game State
const totalLevels = 6;
let currentLevel = 1;
let levelScores = [0, 0, 0, 0, 0, 0];
let totalXP = 0;

document.addEventListener("DOMContentLoaded", () => {
    updateProgress();
});

// HUD Update
function updateHUD() {
    let averageScore = Math.round(levelScores.reduce((a, b) => a + b, 0) / totalLevels);
    totalXP = averageScore * 10;
    document.getElementById('current-score').innerText = totalXP;
}

// ==========================================
// LEVEL 1: Layout Mistakes (Realistic Mockup)
// ==========================================
let mistakesFound = 0;
const totalMistakes = 8;
const mistakeExplanations = {
    header: "Header placed incorrectly. It should be at the top.",
    sidebar: "Sidebar is too wide, leaving no room for main content.",
    footer: "Footer should be placed at the bottom, not in the middle.",
    button: "Primary button is too far from related content.",
    spacing: "Uneven spacing between cards makes the layout messy.",
    hidden: "Important content should not be hidden at the bottom.",
    search: "Search bar should logically be placed in or near the header.",
    hierarchy: "No visual hierarchy. All text is the same size and weight."
};

const mockups = document.querySelectorAll('.mockup-mistake');
mockups.forEach(el => {
    el.addEventListener('click', function (e) {
        if (!this.classList.contains('found')) {
            this.classList.add('found');

            mistakesFound++;
            document.getElementById('mistakes-found').innerText = mistakesFound;

            const mistakeType = this.getAttribute('data-mistake');
            const feedbackEl = document.getElementById('mistake-feedback');
            feedbackEl.innerText = "Correct! " + mistakeExplanations[mistakeType];
            feedbackEl.style.color = "var(--success)";

            levelScores[0] = Math.round((mistakesFound / totalMistakes) * 100);
            updateHUD();

            if (mistakesFound === totalMistakes) {
                document.getElementById('next-btn-1').style.display = "inline-block";
                feedbackEl.innerText = "Great job! You found all layout mistakes.";
            }
        }
        e.stopPropagation();
    });
});

const decoys = document.querySelectorAll('.mockup-decoy');
decoys.forEach(el => {
    el.addEventListener('click', function (e) {
        this.classList.add('wrong');
        const feedbackEl = document.getElementById('mistake-feedback');
        feedbackEl.innerText = "That area looks fine. Keep looking for mistakes!";
        feedbackEl.style.color = "var(--error)";
        setTimeout(() => this.classList.remove('wrong'), 500);
        e.stopPropagation();
    });
});

// ==========================================
// LEVEL 2: Drag and Drop Builder
// ==========================================
const draggableItems = document.querySelectorAll('.draggable-item');
const dropZones = document.querySelectorAll('.drop-zone');
const elementsPool = document.getElementById('elements-pool');

draggableItems.forEach(item => {
    item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const draggable = document.querySelector('.draggable-item.dragging');
        if (draggable) {
            zone.appendChild(draggable);
            Array.from(zone.childNodes).forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) node.textContent = '';
            });
        }
    });
});

elementsPool.addEventListener('dragover', (e) => { e.preventDefault(); });
elementsPool.addEventListener('drop', (e) => {
    e.preventDefault();
    const draggable = document.querySelector('.draggable-item.dragging');
    if (draggable) elementsPool.appendChild(draggable);
});

function checkLayout() {
    let score = 0;
    let feedbackMsgs = [];

    const getZoneElements = (zoneId) => {
        const zone = document.querySelector(`.canvas-zone[data-zone="${zoneId}"]`);
        if (!zone) return [];
        return Array.from(zone.querySelectorAll('.draggable-item')).map(el => el.getAttribute('data-element'));
    };

    const topZone = getZoneElements('top');
    const leftZone = getZoneElements('left');
    const centerZone = getZoneElements('center');
    const rightZone = getZoneElements('right');
    const bottomZone = getZoneElements('bottom');

    if (topZone.includes('header')) { score += 10; feedbackMsgs.push("✅ Header correctly placed."); } else { feedbackMsgs.push("❌ Header should be at the top."); }
    if (leftZone.includes('sidebar')) { score += 10; feedbackMsgs.push("✅ Sidebar correctly placed on the left."); } else { feedbackMsgs.push("❌ Sidebar should be on the left."); }
    if (centerZone.includes('main')) { score += 15; feedbackMsgs.push("✅ Main content correctly placed in center."); } else { feedbackMsgs.push("❌ Main content should be in the center zone."); }

    let cards = ['progress', 'quiz', 'leaderboard'];
    let cardsInCenter = cards.filter(c => centerZone.includes(c));
    if (cardsInCenter.length === 3) { score += 20; feedbackMsgs.push("✅ Cards properly grouped in the main area."); }
    else if (cardsInCenter.length > 0) { score += 10; feedbackMsgs.push("⚠️ Some cards are grouped correctly, but keep them together near main content."); }
    else { feedbackMsgs.push("❌ Cards should be grouped with or near the main content."); }

    if (centerZone.includes('button')) { score += 15; feedbackMsgs.push("✅ Primary button placed near relevant content."); } else { feedbackMsgs.push("❌ Primary button is far from related content (should be center)."); }
    if (rightZone.includes('notification')) { score += 10; feedbackMsgs.push("✅ Notification panel perfectly placed on the right."); } else { feedbackMsgs.push("❌ Notification panel usually goes on the right or near header."); }
    if (bottomZone.includes('footer')) { score += 10; feedbackMsgs.push("✅ Footer correctly placed at the bottom."); } else { feedbackMsgs.push("❌ Footer belongs at the bottom."); }
    if (topZone.includes('search') && topZone.includes('profile')) { score += 10; feedbackMsgs.push("✅ Search and profile properly placed near header."); } else { feedbackMsgs.push("❌ Search bar and profile icon should be inside the top zone."); }

    const feedbackEl = document.getElementById('feedback-2');
    feedbackEl.innerHTML = `Score for this layout: ${score}/100<br><br>` + feedbackMsgs.join('<br>');
    feedbackEl.className = 'feedback ' + (score >= 70 ? 'success' : 'warning');

    levelScores[1] = score;
    updateHUD();
    document.getElementById('next-btn-2').style.display = "inline-block";
}

// ==========================================
// LEVEL 3: Choose Layout
// ==========================================
let level3Answered = false;
function selectLayoutPattern(choice, element) {
    if (level3Answered) return;

    const feedbackEl = document.getElementById('feedback-3');
    document.querySelectorAll('.layout-card').forEach(c => c.classList.remove('selected-correct', 'selected-wrong'));

    if (choice === 'sidebar') {
        element.classList.add('selected-correct');
        feedbackEl.innerText = "Correct! A sidebar dashboard layout is better for learning platforms because it keeps important sections visible and allows users to move quickly between modules, quizzes, progress, leaderboard, and settings.";
        feedbackEl.className = "feedback success";
        levelScores[2] = 100;
        updateHUD();
        document.getElementById('next-btn-3').style.display = "inline-block";
        level3Answered = true;
    } else {
        element.classList.add('selected-wrong');
        feedbackEl.innerText = "Incorrect. While that layout works for some sites, a learning dashboard needs quick navigation between many sections, which a sidebar provides best.";
        feedbackEl.className = "feedback error";
        setTimeout(() => element.classList.remove('selected-wrong'), 500);
    }
}

// ==========================================
// LEVEL 4: Responsive Challenge
// ==========================================
let level4Scores = { desktop: false, tablet: false, mobile: false };

function showDeviceQuestion(device) {
    document.querySelectorAll('.device-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.device-tab[onclick="showDeviceQuestion('${device}')"]`).classList.add('active');

    document.querySelectorAll('.device-question').forEach(q => q.classList.remove('active'));
    document.querySelectorAll('.device-question').forEach(q => q.style.display = "none");

    document.getElementById(`q-${device}`).style.display = "block";
    setTimeout(() => document.getElementById(`q-${device}`).classList.add('active'), 10);
}

function checkDeviceAnswer(device) {
    if (level4Scores[device]) return;

    const options = document.getElementsByName(device);
    let selected = null;
    let selectedLabel = null;
    options.forEach(opt => {
        if (opt.checked) {
            selected = opt;
            selectedLabel = opt.parentElement;
        }
    });

    const feedbackEl = document.querySelector(`#q-${device} .mcq-feedback`);

    if (selected && selected.value === 'correct') {
        feedbackEl.innerText = "Correct!";
        feedbackEl.style.color = "var(--success)";
        selectedLabel.style.color = "var(--success)";
        selectedLabel.style.fontWeight = "bold";

        level4Scores[device] = true;

        let correctCount = Object.values(level4Scores).filter(Boolean).length;
        levelScores[3] = Math.round((correctCount / 3) * 100);
        updateHUD();

        checkLevel4Completion();
    } else if (selected) {
        feedbackEl.innerText = "Incorrect. Think about how screen size affects readability and navigation.";
        feedbackEl.style.color = "var(--error)";
        selectedLabel.style.color = "var(--error)";
    } else {
        feedbackEl.innerText = "Please select an option.";
        feedbackEl.style.color = "var(--text-light)";
    }
}

function checkLevel4Completion() {
    if (level4Scores.desktop && level4Scores.tablet && level4Scores.mobile) {
        document.getElementById('feedback-4').innerText = "Awesome! You've mastered responsive layout rules.";
        document.getElementById('feedback-4').className = "feedback success";
        document.getElementById('next-btn-4').style.display = "inline-block";
    }
}

// ==========================================
// LEVEL 5: Visual Hierarchy 
// ==========================================
const tokens = document.querySelectorAll('.token-draggable');
const styleDrops = document.querySelectorAll('.drop-style');
const tokensPool = document.getElementById('tokens-pool');

tokens.forEach(item => {
    item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
    });
    item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
    });
});

styleDrops.forEach(row => {
    row.addEventListener('dragover', (e) => {
        e.preventDefault();
        row.classList.add('drag-over');
    });
    row.addEventListener('dragleave', () => {
        row.classList.remove('drag-over');
    });
    row.addEventListener('drop', (e) => {
        e.preventDefault();
        row.classList.remove('drag-over');

        const draggable = document.querySelector('.token-draggable.dragging');
        if (draggable) {
            // Remove previous style classes
            row.className = 'text-row drop-style';

            // Get style type and apply it to row
            const styleType = draggable.getAttribute('data-style');
            row.classList.add('style-' + styleType);

            // Mark which token is applied here (for checking later)
            row.setAttribute('data-applied-style', styleType);

            // Hide the token from the pool to simulate placing it
            draggable.style.display = 'none';
        }
    });
});

function checkHierarchy() {
    let correctCount = 0;

    styleDrops.forEach(row => {
        const expected = row.getAttribute('data-target');
        const applied = row.getAttribute('data-applied-style');
        if (expected === applied) {
            correctCount++;
        }
    });

    const feedbackEl = document.getElementById('feedback-5');

    if (correctCount === 4) {
        feedbackEl.innerText = "Perfect! Proper typographic scale and contrast establish a clear visual hierarchy.";
        feedbackEl.className = "feedback success";
        levelScores[4] = 100;
        document.getElementById('next-btn-5').style.display = "inline-block";
    } else if (correctCount > 0) {
        feedbackEl.innerText = `You have ${correctCount} out of 4 correct. Keep trying to match the token intent to the text purpose.`;
        feedbackEl.className = "feedback warning";
        levelScores[4] = (correctCount / 4) * 100;

        // Reset tokens
        tokens.forEach(t => t.style.display = 'block');
        styleDrops.forEach(r => {
            r.className = 'text-row drop-style';
            r.removeAttribute('data-applied-style');
        });
    } else {
        feedbackEl.innerText = "None of the styles are correct. Try again! Think about what needs the most attention.";
        feedbackEl.className = "feedback error";

        tokens.forEach(t => t.style.display = 'block');
        styleDrops.forEach(r => {
            r.className = 'text-row drop-style';
            r.removeAttribute('data-applied-style');
        });
    }
    updateHUD();
}

// ==========================================
// LEVEL 6: Alignment & Proximity Form Fixer
// ==========================================
function updateFormFix() {
    const proximity = document.getElementById('toggle-proximity').checked;
    const alignment = document.getElementById('toggle-alignment').checked;
    const whitespace = document.getElementById('toggle-whitespace').checked;

    const form = document.getElementById('live-form');

    form.classList.toggle('fix-proximity', proximity);
    form.classList.toggle('fix-alignment', alignment);
    form.classList.toggle('fix-whitespace', whitespace);
}

function checkForm() {
    const proximity = document.getElementById('toggle-proximity').checked;
    const alignment = document.getElementById('toggle-alignment').checked;
    const whitespace = document.getElementById('toggle-whitespace').checked;

    const feedbackEl = document.getElementById('feedback-6');
    let score = 0;

    if (proximity && alignment && whitespace) {
        feedbackEl.innerText = "Excellent! By fixing proximity, alignment, and whitespace, the form is now clean, professional, and easy to use.";
        feedbackEl.className = "feedback success";
        score = 100;
        document.getElementById('finish-btn').style.display = "inline-block";
    } else {
        let missing = [];
        if (!proximity) missing.push("Proximity (Group related elements)");
        if (!alignment) missing.push("Alignment");
        if (!whitespace) missing.push("Whitespace (Padding)");

        feedbackEl.innerText = "Almost there! You are missing: " + missing.join(', ');
        feedbackEl.className = "feedback warning";
        score = [proximity, alignment, whitespace].filter(Boolean).length * 33.33;
    }

    levelScores[5] = Math.round(score);
    updateHUD();
}

// ==========================================
// Navigation & Global functions
// ==========================================
function updateProgress() {
    const progress = ((currentLevel - 1) / totalLevels) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    if (currentLevel <= totalLevels) {
        document.getElementById('level-indicator').innerText = `Level ${currentLevel} of ${totalLevels}`;
    }
}

function goToNextLevel() {
    document.getElementById(`level-${currentLevel}`).classList.remove('active');
    currentLevel++;
    if (currentLevel <= totalLevels) {
        document.getElementById(`level-${currentLevel}`).classList.add('active');
        updateProgress();
    }
}

function showResultScreen() {
    document.getElementById(`level-${currentLevel}`).classList.remove('active');
    document.getElementById('result-screen').classList.add('active');

    document.getElementById('progress-bar').style.width = "100%";
    document.getElementById('level-indicator').innerText = "Completed!";

    const finalScore = Math.round(levelScores.reduce((a, b) => a + b, 0) / totalLevels);

    document.getElementById('final-score').innerText = finalScore;
    document.getElementById('final-xp').innerText = totalXP;

    let badge = "";
    let icon = "🏅";
    let feedback = "";

    if (finalScore >= 90) {
        badge = "Layout Master";
        icon = "🏆";
        feedback = "Incredible! You have an expert eye for screen design and layout.";
    } else if (finalScore >= 70) {
        badge = "UI Designer";
        icon = "🥇";
        feedback = "Great work! You know the core principles of good layout.";
    } else if (finalScore >= 50) {
        badge = "Layout Learner";
        icon = "🥈";
        feedback = "Good effort. Reviewing UI layout principles will help you improve further.";
    } else {
        badge = "Try Again";
        icon = "🥉";
        feedback = "Don't give up! Layout takes practice. Try the mission again.";
    }

    document.getElementById('final-badge-title').innerText = badge;
    document.getElementById('final-badge-icon').innerText = icon;
    document.getElementById('final-feedback').innerText = feedback;
}