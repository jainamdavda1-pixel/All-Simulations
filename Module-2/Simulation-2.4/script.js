// Game State Variables
const totalLevels = 5;
let currentLevel = 1;
let levelScores = [0, 0, 0, 0, 0];
let totalXP = 0;
let maxLevelScores = [100, 100, 100, 100, 100]; // Can drop if hints are used

// Correct Orders & Groupings
const correctOrders = {
    1: ['video', 'notes', 'flashcards', 'quiz', 'score'], // Level 1
    2: ['quiz', 'assignment', 'report', 'badge', 'profile'], // Level 2
    3: ['resume', 'announcement', 'notes', 'results', 'leaderboard', 'settings'] // Level 3
};

const correctGrouping = {
    urgent: ['item-1', 'item-2', 'item-3', 'item-4'],
    learning: ['item-5', 'item-6', 'item-7', 'item-8'],
    general: ['item-9', 'item-10', 'item-11', 'item-12']
};

document.addEventListener("DOMContentLoaded", () => {
    updateHUD();
    initSortableLists();
    initGroupingDragDrop();
});

function updateHUD() {
    document.getElementById('current-level-display').innerText = `${currentLevel} / ${totalLevels}`;
    document.getElementById('progress-bar').style.width = `${((currentLevel - 1) / totalLevels) * 100}%`;

    totalXP = levelScores.reduce((a, b) => a + b, 0) * 10;
    document.getElementById('total-xp-display').innerText = totalXP;
}

function goToNextLevel(nextLvl) {
    document.getElementById(`level-${currentLevel}`).classList.remove('active');
    currentLevel = nextLvl;
    document.getElementById(`level-${currentLevel}`).classList.add('active');
    updateHUD();
}

function useHint(level) {
    maxLevelScores[level - 1] = Math.max(0, maxLevelScores[level - 1] - 10);

    let hintMessage = "";
    if (level === 1) {
        hintMessage = "Concept building comes first. Watch the video, read the study notes to consolidate, practice with flashcards, test yourself with the quiz, and finally check your score.";
    } else if (level === 2) {
        hintMessage = "Priority order is defined by deadline urgency. Put tasks due in 1 hour first, then tomorrow's assignments, weekly reports, new notifications, and finally non-urgent profile settings.";
    } else if (level === 3) {
        hintMessage = "The user has a quiz in 30 minutes! Resume the quiz immediately. Announcements and study notes support this task directly. Match history, leaderboard, and settings are secondary.";
    } else if (level === 4) {
        hintMessage = "Classify items by their time-sensitivity and function: Urgent Tasks (strict deadlines), Learning Resources (self-paced study guides and videos), and General Dashboard (social and admin links).";
    } else {
        hintMessage = "Pay attention to scanning cost. Prioritized lists with concise labels are always better than verbose alphabetical text.";
    }

    alert(`💡 Hint: ${hintMessage}\n\n(10 points have been deducted from this level's maximum potential score.)`);
}

/* =====================================
   DRAG AND DROP FOR SORTABLE LISTS (Lvls 1-3)
   ===================================== */
function initSortableLists() {
    const lists = document.querySelectorAll('.sortable-list');

    lists.forEach(list => {
        let draggedItem = null;

        list.addEventListener('dragstart', e => {
            if (e.target.classList.contains('sortable-item')) {
                draggedItem = e.target;
                setTimeout(() => e.target.classList.add('dragging'), 0);
            }
        });

        list.addEventListener('dragend', e => {
            if (e.target.classList.contains('sortable-item')) {
                e.target.classList.remove('dragging');
            }
        });

        list.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(list, e.clientY);
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                if (afterElement == null) {
                    list.appendChild(draggable);
                } else {
                    list.insertBefore(draggable, afterElement);
                }
            }
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sortable-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* =====================================
   LEVEL VALIDATION LOGIC
   ===================================== */
function checkListOrder(levelNum, explanation) {
    const list = document.getElementById(`list-level-${levelNum}`);
    const items = list.querySelectorAll('.sortable-item');
    const correct = correctOrders[levelNum];
    const maxScore = maxLevelScores[levelNum - 1];
    let correctCount = 0;

    items.forEach((item, index) => {
        item.classList.remove('correct', 'incorrect');
        if (item.getAttribute('data-id') === correct[index]) {
            item.classList.add('correct');
            correctCount++;
        } else {
            item.classList.add('incorrect');
        }
    });

    const scorePct = correctCount / correct.length;
    levelScores[levelNum - 1] = Math.round(scorePct * maxScore);

    const feedback = document.getElementById(`feedback-${levelNum}`);
    feedback.style.display = "block";

    if (correctCount === correct.length) {
        feedback.className = "feedback-box success";
        feedback.innerHTML = `<strong>Perfect!</strong><br><br>${explanation}`;
        document.getElementById(`next-btn-${levelNum}`).style.display = "block";
        updateHUD();
    } else {
        feedback.className = "feedback-box warning";
        feedback.innerHTML = `You got ${correctCount} out of ${correct.length} in the correct position. Check the red items and try again!`;
    }
}

function checkLevel1() {
    checkListOrder(1, "The learner should first understand the concept through a video, then read notes for revision, practice using flashcards, attempt the quiz, and finally view the result.");
}

function checkLevel2() {
    checkListOrder(2, "Urgent and time-sensitive information should appear first. Rewards and profile suggestions are useful but less urgent.");
}

function checkLevel3() {
    checkListOrder(3, "The most important task is to resume the quiz because the deadline is close. Important announcements and study notes support the immediate goal. Leaderboard and settings are secondary.");
}


/* =====================================
   DRAG AND DROP FOR GROUPING (Lvl 4)
   ===================================== */
function initGroupingDragDrop() {
    const pills = document.querySelectorAll('.draggable-pill');
    const dropZones = document.querySelectorAll('.drop-zone');
    const pool = document.getElementById('item-pool');

    pills.forEach(pill => {
        pill.addEventListener('dragstart', () => {
            pill.classList.add('dragging');
        });
        pill.addEventListener('dragend', () => {
            pill.classList.remove('dragging');
        });
    });

    [...dropZones, pool].forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const draggable = document.querySelector('.draggable-pill.dragging');
            if (draggable) {
                zone.appendChild(draggable);
            }
        });
    });
}

function checkLevel4() {
    let correctCount = 0;
    const totalItems = 12;
    const maxScore = maxLevelScores[3]; // Index 3 is Level 4

    const pills = document.querySelectorAll('.draggable-pill');
    pills.forEach(pill => {
        const expectedGroup = pill.getAttribute('data-group');
        const parentZone = pill.parentElement.id.replace('zone-', ''); // 'urgent', 'learning', or 'general' (or 'item-pool')

        pill.style.borderColor = "";
        pill.style.backgroundColor = "";

        if (parentZone === expectedGroup) {
            correctCount++;
            pill.style.borderColor = "var(--success-green)";
            pill.style.backgroundColor = "#ECFDF5";
        } else if (parentZone !== 'item-pool') {
            pill.style.borderColor = "var(--error-red)";
            pill.style.backgroundColor = "#FEF2F2";
        }
    });

    const feedback = document.getElementById('feedback-4');
    feedback.style.display = "block";
    levelScores[3] = Math.round((correctCount / totalItems) * maxScore);

    if (correctCount === totalItems) {
        feedback.className = "feedback-box success";
        feedback.innerHTML = "<strong>Outstanding!</strong><br><br>You correctly categorized all dashboard tasks. Proper grouping reduces visual noise and helps users map resources to their current tasks immediately.";
        document.getElementById('next-btn-4').style.display = "block";
        updateHUD();
    } else {
        feedback.className = "feedback-box warning";
        feedback.innerHTML = `You correctly categorized ${correctCount}/${totalItems} items. Look for time-sensitivity (Urgent), educational items (Learning Resources), or account/social elements (General Dashboard) and re-sort the red items.`;
    }
}


/* =====================================
   LEVEL 5: Comparison & MCQ
   ===================================== */
let level5Score = 0;
let mcqCorrect = 0;
let designChosen = false;

function selectDesign(design) {
    if (designChosen) return; // Prevent selection changes once correct design is chosen

    document.querySelectorAll('.list-preview').forEach(el => el.classList.remove('selected', 'wrong-selection'));

    if (design === 'good') {
        designChosen = true;
        document.querySelector('.good-list').classList.add('selected');
        document.getElementById('mcq-section').style.display = 'block';
        document.getElementById('feedback-5').style.display = 'none';
        level5Score = 25; // Base score for choosing correctly (idempotent)
    } else {
        document.querySelector('.bad-list').classList.add('wrong-selection');
        const feedback = document.getElementById('feedback-5');
        feedback.style.display = 'block';
        feedback.className = "feedback-box warning";
        feedback.innerText = "Incorrect. Design A has clean cards but is sorted alphabetically (hiding the urgent assignment at the top) and uses verbose, essay-like labels that slow down scanning. Try again!";
    }
}

function checkMCQ(questionNum, isCorrect) {
    const feedback = document.getElementById(`mcq-feedback-${questionNum}`);
    const btns = document.querySelectorAll(`#mcq-${questionNum} .mcq-btn`);

    // Disable all buttons in this question
    btns.forEach(btn => {
        btn.disabled = true;
        if (btn.getAttribute('onclick').includes('true')) {
            btn.classList.add('correct-ans');
        }
    });

    if (isCorrect) {
        feedback.innerHTML = "<span style='color:var(--success-green)'>✅ Correct!</span>";
        level5Score += 25;
        mcqCorrect++;
    } else {
        feedback.innerHTML = "<span style='color:var(--error-red)'>❌ Incorrect. Review the highlighted answer.</span>";
    }

    // Show next question or finish button
    if (questionNum < 3) {
        document.getElementById(`mcq-${questionNum + 1}`).style.display = "block";
    } else {
        levelScores[4] = level5Score;
        updateHUD();
        document.getElementById('next-btn-5').style.display = "block";
    }
}

/* =====================================
   FINAL RESULT SCREEN
   ===================================== */
function showResultScreen() {
    document.getElementById(`level-5`).classList.remove('active');
    document.getElementById('result-screen').classList.add('active');
    document.getElementById('progress-bar').style.width = "100%";

    const finalAvgScore = Math.round(levelScores.reduce((a, b) => a + b, 0) / totalLevels);

    document.getElementById('final-score').innerText = finalAvgScore;
    document.getElementById('final-total-xp').innerText = totalXP;

    let badgeTitle = "";
    let icon = "";
    let feedbackTxt = "";

    if (finalAvgScore >= 90) {
        badgeTitle = "Content Organizer Pro";
        icon = "🏆";
        feedbackTxt = "Outstanding work! You masterfully organized lists based on priority, urgency, and user goals.";
    } else if (finalAvgScore >= 70) {
        badgeTitle = "Smart List Designer";
        icon = "🥈";
        feedbackTxt = "Great job! You have a strong grasp of how to group and sequence content for better UX.";
    } else if (finalAvgScore >= 50) {
        badgeTitle = "Content Learner";
        icon = "🥉";
        feedbackTxt = "Good effort! Review the explanations carefully to strengthen your understanding of content prioritization.";
    } else {
        badgeTitle = "Try Again";
        icon = "🔄";
        feedbackTxt = "Don't worry, UX design takes practice! Restart the simulation and apply the principles from the feedback.";
    }

    document.getElementById('final-badge-title').innerText = badgeTitle;
    document.getElementById('final-badge-icon').innerText = icon;
    document.getElementById('final-feedback-text').innerText = feedbackTxt;
}