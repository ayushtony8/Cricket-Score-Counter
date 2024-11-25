let totalScore = 0;
let wickets = 0;
let balls = 0;
let strikerScore = 0;
let nonStrikerScore = 0;
let totalOvers = 0;
let matchStarted = false;
let batsmenHistory = {};
let bowlersHistory = {};
let currentBowler = '';
let isSecondInning = false;
let firstInningScore = 0;
let firstInningWickets = 0;
let bowlersList = new Set();
let firstInningBattingHistory = {};
let firstInningBowlingHistory = {};
let secondInningBattingHistory = {};
let secondInningBowlingHistory = {};

// Add these functions to handle local storage

// Function to save match data to local storage
function saveMatchData() {
    const matchData = {
        // Current match state
        totalScore,
        wickets,
        balls,
        strikerScore,
        nonStrikerScore,
        totalOvers,
        matchStarted,
        batsmenHistory,
        bowlersHistory,
        currentBowler,
        isSecondInning,

        // First innings data
        firstInningScore,
        firstInningWickets,
        firstInningBattingHistory,
        firstInningBowlingHistory,

        // Current batsmen
        currentStriker: document.getElementById('current-striker').textContent,
        currentNonStriker: document.getElementById('current-non-striker').textContent,

        // Button states
        showNewInningBtn: document.getElementById('new-inning-btn').style.display,
        showNewMatchBtn: document.getElementById('new-match-btn').style.display
    };

    localStorage.setItem('cricketMatchData', JSON.stringify(matchData));
    localStorage.setItem('lastUpdated', new Date().toISOString());
}

// Function to load match data from local storage
function loadMatchData() {
    const savedData = localStorage.getItem('cricketMatchData');
    if (savedData) {
        const matchData = JSON.parse(savedData);

        // Restore match state
        totalScore = matchData.totalScore;
        wickets = matchData.wickets;
        balls = matchData.balls;
        strikerScore = matchData.strikerScore;
        nonStrikerScore = matchData.nonStrikerScore;
        totalOvers = matchData.totalOvers;
        matchStarted = matchData.matchStarted;
        batsmenHistory = matchData.batsmenHistory;
        bowlersHistory = matchData.bowlersHistory;
        currentBowler = matchData.currentBowler;
        isSecondInning = matchData.isSecondInning;

        // Restore first innings data
        firstInningScore = matchData.firstInningScore;
        firstInningWickets = matchData.firstInningWickets;
        firstInningBattingHistory = matchData.firstInningBattingHistory;
        firstInningBowlingHistory = matchData.firstInningBowlingHistory;

        // Update UI
        document.getElementById('current-striker').textContent = matchData.currentStriker;
        document.getElementById('current-non-striker').textContent = matchData.currentNonStriker;
        document.getElementById('new-inning-btn').style.display = matchData.showNewInningBtn;
        document.getElementById('new-match-btn').style.display = matchData.showNewMatchBtn;

        updateScore();
        updateBattingHistory();
        updateBowlingHistory();
        updateBowlerDropdown();

        // If it's second innings, update the display accordingly
        if (isSecondInning) {
            updateDisplayForSecondInnings();
            updateTargetInfo();
        }

        return true;
    }
    return false;
}

// Function to clear match data from local storage
function clearMatchData() {
    localStorage.removeItem('cricketMatchData');
    localStorage.removeItem('lastUpdated');
}

function setPlayers() {
    const striker = document.getElementById('striker').value;
    const nonStriker = document.getElementById('non-striker').value;
    const overs = document.getElementById('total-overs').value;

    if (!striker || !nonStriker || !overs) {
        alert('Please fill in all fields!');
        return;
    }

    if (!isSecondInning) {
        totalOvers = parseInt(overs);
    }

    document.getElementById('current-striker').textContent = striker;
    document.getElementById('current-non-striker').textContent = nonStriker;

    batsmenHistory[striker] = { runs: 0, balls: 0, status: 'Batting', outBy: '' };
    batsmenHistory[nonStriker] = { runs: 0, balls: 0, status: 'Batting', outBy: '' };

    matchStarted = true;
    updateBattingHistory();
    saveMatchData();
}

function setBowler() {
    if (!matchStarted) {
        alert('Please start the match first!');
        return;
    }

    const bowlerName = document.getElementById('bowler-name').value;
    if (!bowlerName) {
        alert('Please enter bowler name!');
        return;
    }

    currentBowler = bowlerName;
    bowlersList.add(bowlerName);
    updateBowlerDropdown();

    if (!bowlersHistory[bowlerName]) {
        bowlersHistory[bowlerName] = { overs: 0, runs: 0, wickets: 0, balls: 0 };
    }
    updateBowlingHistory();
}

function updateBowlerDropdown() {
    const select = document.getElementById('bowler-select');
    select.innerHTML = '<option value="">Select Previous Bowler</option>';
    bowlersList.forEach(bowler => {
        const option = document.createElement('option');
        option.value = bowler;
        option.textContent = bowler;
        select.appendChild(option);
    });
}

function selectExistingBowler() {
    const select = document.getElementById('bowler-select');
    const bowlerName = select.value;
    if (bowlerName) {
        document.getElementById('bowler-name').value = bowlerName;
        setBowler();
    }
}

function startSecondInning() {
    firstInningScore = totalScore;
    firstInningWickets = wickets;

    // Save first innings histories
    firstInningBattingHistory = { ...batsmenHistory };
    firstInningBowlingHistory = { ...bowlersHistory };

    // Reset for second innings
    totalScore = 0;
    wickets = 0;
    balls = 0;
    strikerScore = 0;
    nonStrikerScore = 0;
    currentBowler = '';
    isSecondInning = true;

    // Clear batsmen names and histories
    document.getElementById('current-striker').textContent = '-';
    document.getElementById('current-non-striker').textContent = '-';
    document.getElementById('striker').value = '';
    document.getElementById('non-striker').value = '';
    batsmenHistory = {};

    // Clear bowlers for second innings
    bowlersList.clear();
    updateBowlerDropdown();

    // Keep the same number of overs
    document.getElementById('total-overs').value = totalOvers;
    document.getElementById('total-overs').disabled = true;

    // Show and update target info
    document.getElementById('target-info').style.display = 'block';
    updateTargetInfo();

    // Update UI
    updateDisplayForSecondInnings();

    // Reset match started flag to require new batsmen
    matchStarted = false;

    alert('Please enter new batting pair for second innings');
    saveMatchData();
}

function updateDisplayForSecondInnings() {
    // Only update the current innings display
    const historySection = document.querySelector('.history-section');
    historySection.innerHTML = `
        <div class="second-innings">
            <h3>Current Innings</h3>
            <div class="batting-history">
                <h4>Batting</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Batsman</th>
                            <th>Runs</th>
                            <th>Balls</th>
                            <th>Status</th>
                            <th>Out By</th>
                        </tr>
                    </thead>
                    <tbody id="second-innings-batting"></tbody>
                </table>
            </div>
            <div class="bowling-history">
                <h4>Bowling</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Bowler</th>
                            <th>Overs</th>
                            <th>Runs</th>
                            <th>Wickets</th>
                        </tr>
                    </thead>
                    <tbody id="second-innings-bowling"></tbody>
                </table>
            </div>
        </div>
    `;
}

function startNewMatch() {
    if (!confirm('Are you sure you want to start a new match? All current match data will be lost.')) {
        return;
    }

    // Reset all variables
    totalScore = 0;
    wickets = 0;
    balls = 0;
    strikerScore = 0;
    nonStrikerScore = 0;
    totalOvers = 0;
    matchStarted = false;
    isSecondInning = false;
    currentBowler = '';
    batsmenHistory = {};
    bowlersHistory = {};
    firstInningScore = 0;
    firstInningWickets = 0;
    firstInningBattingHistory = {};
    firstInningBowlingHistory = {};
    bowlersList.clear();

    // Clear all inputs
    document.getElementById('striker').value = '';
    document.getElementById('non-striker').value = '';
    document.getElementById('total-overs').value = '';
    document.getElementById('bowler-name').value = '';
    document.getElementById('total-overs').disabled = false;

    // Reset display
    document.getElementById('current-striker').textContent = '-';
    document.getElementById('current-non-striker').textContent = '-';
    document.getElementById('striker-score').textContent = '0';
    document.getElementById('non-striker-score').textContent = '0';
    document.getElementById('total-score').textContent = '0';
    document.getElementById('wickets').textContent = '0';
    document.getElementById('overs').textContent = '0.0';

    // Hide other control buttons
    document.getElementById('new-inning-btn').style.display = 'none';
    document.getElementById('show-history-btn').style.display = 'none';

    // Clear history tables
    document.getElementById('batting-history').innerHTML = '';
    document.getElementById('bowling-history').innerHTML = '';

    // Hide and clear target info
    const targetInfo = document.getElementById('target-info');
    if (targetInfo) {
        targetInfo.style.display = 'none';
        targetInfo.innerHTML = '';
    }

    // Hide history section
    const historySection = document.getElementById('history-section');
    if (historySection) {
        historySection.style.display = 'none';
    }

    // Reset bowler dropdown
    updateBowlerDropdown();

    // Clear local storage
    clearMatchData();
}

// Add this to handle match completion scenarios
function handleMatchCompletion(message) {
    alert(message);
    document.getElementById('new-match-btn').style.display = 'block';
    document.getElementById('new-inning-btn').style.display = 'none';
}

// Modify the addRuns function to use handleMatchCompletion
function addRuns(runs) {
    if (!matchStarted) {
        alert('Please set players and overs first!');
        return;
    }

    if (!currentBowler) {
        alert('Please set a bowler first!');
        return;
    }

    if (Math.floor(balls / 6) >= totalOvers) {
        alert('Match is over!');
        return;
    }

    const striker = document.getElementById('current-striker').textContent;
    batsmenHistory[striker].runs += runs;
    batsmenHistory[striker].balls += 1;
    bowlersHistory[currentBowler].runs += runs;
    bowlersHistory[currentBowler].balls += 1;

    totalScore += runs;
    strikerScore += runs;
    balls++;

    updateScore();
    updateBattingHistory();
    updateBowlingHistory();
    updateTargetInfo();
    saveMatchData();

    if (runs % 2 === 1) {
        rotateStrike();
    }

    if (balls % 6 === 0) {
        rotateStrike();
        promptNewBowler();
    }

    if (isSecondInning && totalScore > firstInningScore) {
        handleMatchCompletion('Match Complete! Second innings team wins!');
        return;
    }
}

// Modify promptNewBowler
function promptNewBowler() {
    if (Math.floor(balls / 6) >= totalOvers) {
        if (!isSecondInning) {
            document.getElementById('new-inning-btn').style.display = 'block';
            document.getElementById('new-match-btn').style.display = 'none';
            alert('First innings complete!');
        } else {
            handleMatchCompletion('Match complete! First innings team wins!');
        }
        return;
    }

    currentBowler = '';
    document.getElementById('bowler-name').value = '';
    alert('Over complete! Please set new bowler.');
}

function addWide() {
    if (!matchStarted) {
        alert('Please set players and overs first!');
        return;
    }

    if (!currentBowler) {
        alert('Please set a bowler first!');
        return;
    }

    totalScore += 1;
    bowlersHistory[currentBowler].runs += 1;
    updateScore();
    updateBowlingHistory();
    updateTargetInfo();
    saveMatchData();
}

function addExtras() {
    if (!matchStarted) {
        alert('Please set players and overs first!');
        return;
    }

    if (!currentBowler) {
        alert('Please set a bowler first!');
        return;
    }

    const extras = parseInt(prompt("Enter extras (wides/no-balls/byes/leg-byes):", "1"));
    if (!isNaN(extras)) {
        totalScore += extras;
        bowlersHistory[currentBowler].runs += extras;
        updateScore();
        updateBowlingHistory();
        updateTargetInfo();
        saveMatchData();
    }
}

function addWicket() {
    if (!matchStarted || !currentBowler) {
        alert('Please ensure match is started and bowler is set!');
        return;
    }

    if (wickets < 9) {
        const outBatsman = document.getElementById('current-striker').textContent;
        batsmenHistory[outBatsman].status = 'Out';
        batsmenHistory[outBatsman].balls += 1;
        batsmenHistory[outBatsman].outBy = currentBowler; // Add bowler who took the wicket

        bowlersHistory[currentBowler].wickets += 1;
        bowlersHistory[currentBowler].balls += 1;

        const newBatsman = prompt("Enter new batsman's name:");
        if (newBatsman) {
            batsmenHistory[newBatsman] = {
                runs: 0,
                balls: 0,
                status: 'Batting',
                outBy: ''
            };
            document.getElementById('current-striker').textContent = newBatsman;
            strikerScore = 0;
        }

        wickets++;
        balls++;
        updateScore();
        updateBattingHistory();
        updateBowlingHistory();
        updateTargetInfo();
        saveMatchData();

        if (balls % 6 === 0) {
            rotateStrike();
            promptNewBowler();
        }
    } else {
        wickets++;
        updateScore();
        if (isSecondInning) {
            handleMatchCompletion('Match Complete! First innings team wins!');
        } else {
            document.getElementById('new-inning-btn').style.display = 'block';
            alert('Innings Complete! All Out!');
        }
    }
}

function rotateStrike() {
    const tempName = document.getElementById('current-striker').textContent;
    const tempScore = strikerScore;

    document.getElementById('current-striker').textContent = document.getElementById('current-non-striker').textContent;
    strikerScore = nonStrikerScore;

    document.getElementById('current-non-striker').textContent = tempName;
    nonStrikerScore = tempScore;

    updateScore();
}

function updateScore() {
    document.getElementById('total-score').textContent = totalScore;
    document.getElementById('wickets').textContent = wickets;
    document.getElementById('overs').textContent = Math.floor(balls / 6) + '.' + (balls % 6);
    document.getElementById('striker-score').textContent = strikerScore;
    document.getElementById('non-striker-score').textContent = nonStrikerScore;

    // Add animation to score display
    const scoreElement = document.getElementById('total-score').parentElement;
    scoreElement.classList.remove('score-update');
    void scoreElement.offsetWidth; // Trigger reflow
    scoreElement.classList.add('score-update');
}

function updateBattingHistory() {
    if (!isSecondInning) {
        // Update first innings batting
        const historyTable = document.getElementById('batting-history');
        updateBattingTable(historyTable, batsmenHistory);
    } else {
        // Update both innings batting
        const firstInningsTable = document.getElementById('first-innings-batting');
        const secondInningsTable = document.getElementById('second-innings-batting');
        updateBattingTable(firstInningsTable, firstInningBattingHistory);
        updateBattingTable(secondInningsTable, batsmenHistory);
    }
}

function updateBowlingHistory() {
    if (!isSecondInning) {
        // Update first innings bowling
        const historyTable = document.getElementById('bowling-history');
        updateBowlingTable(historyTable, bowlersHistory);
    } else {
        // Update both innings bowling
        const firstInningsTable = document.getElementById('first-innings-bowling');
        const secondInningsTable = document.getElementById('second-innings-bowling');
        updateBowlingTable(firstInningsTable, firstInningBowlingHistory);
        updateBowlingTable(secondInningsTable, bowlersHistory);
    }
}

// Helper functions for updating tables
function updateBattingTable(table, history) {
    if (!table) return;
    table.innerHTML = '';
    for (const [batsman, stats] of Object.entries(history)) {
        const row = table.insertRow();
        row.insertCell(0).textContent = batsman;
        row.insertCell(1).textContent = stats.runs;
        row.insertCell(2).textContent = stats.balls;
        row.insertCell(3).textContent = stats.status;
        row.insertCell(4).textContent = stats.outBy || '-';
    }
}

function updateBowlingTable(table, history) {
    if (!table) return;
    table.innerHTML = '';
    for (const [bowler, stats] of Object.entries(history)) {
        const overs = Math.floor(stats.balls / 6) + '.' + (stats.balls % 6);
        const row = table.insertRow();
        row.insertCell(0).textContent = bowler;
        row.insertCell(1).textContent = overs;
        row.insertCell(2).textContent = stats.runs;
        row.insertCell(3).textContent = stats.wickets;
    }
}

// Add function to update target information
function updateTargetInfo() {
    if (isSecondInning) {
        const targetInfo = document.getElementById('target-info');
        const remainingRuns = (firstInningScore + 1) - totalScore;
        const remainingBalls = (totalOvers * 6) - balls;

        if (remainingRuns <= 0) {
            targetInfo.innerHTML = 'Target Achieved!';
        } else {
            targetInfo.innerHTML = `Target: ${firstInningScore + 1}<br>
                                  Need ${remainingRuns} runs from ${remainingBalls} balls`;
        }
        targetInfo.style.display = 'block';
    }
}

// Add hover effect for buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mouseover', function () {
        this.style.transform = 'translateY(-2px)';
    });
    button.addEventListener('mouseout', function () {
        this.style.transform = 'translateY(0)';
    });
});

// Add auto-save feature for browser close/refresh
window.addEventListener('beforeunload', function () {
    saveMatchData();
});

// Add auto-load feature when page loads
window.addEventListener('load', function () {
    const loaded = loadMatchData();
    if (loaded) {
        console.log('Previous match data restored');
    }
});

// Add function to check if there's a saved match
function hasSavedMatch() {
    return localStorage.getItem('cricketMatchData') !== null;
}

// Add function to show resume match option
function showResumeOption() {
    if (hasSavedMatch()) {
        const lastUpdated = new Date(localStorage.getItem('lastUpdated'));
        const resumeOption = confirm(
            `There's a saved match from ${lastUpdated.toLocaleString()}\n` +
            'Would you like to resume it?'
        );
        if (resumeOption) {
            loadMatchData();
        } else {
            clearMatchData();
        }
    }
}

// Call this when page loads
window.addEventListener('load', showResumeOption);

// Function to toggle match history visibility
function toggleMatchHistory() {
    const historySection = document.getElementById('history-section');
    const showHistoryBtn = document.getElementById('show-history-btn');

    if (historySection.style.display === 'none') {
        historySection.style.display = 'block';
        showHistoryBtn.textContent = 'Hide Previous Innings';
        updateBattingHistory();
        updateBowlingHistory();
    } else {
        historySection.style.display = 'none';
        showHistoryBtn.textContent = 'Show Previous Innings';
    }
}

// Add confirmation before starting new match
function confirmNewMatch() {
    if (confirm('Are you sure you want to start a new match? All current match data will be lost.')) {
        startNewMatch();
    }
}