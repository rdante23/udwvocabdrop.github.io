// Game Elements
const gameContainer = document.getElementById('game-container');
const scoreDisplays = [
    document.getElementById('score1'),
    document.getElementById('score2'),
    document.getElementById('score3'),
    document.getElementById('score4')
];
const finalScoreDisplays = [
    document.getElementById('final-score1'),
    document.getElementById('final-score2'),
    document.getElementById('final-score3'),
    document.getElementById('final-score4')
];
const pauseIndicator = document.getElementById('pause-indicator');
const pauseBtn = document.getElementById('pause-btn');
const quitBtn = document.getElementById('quit-btn');
const playerBtns = [
    document.getElementById('player1-btn'),
    document.getElementById('player2-btn'),
    document.getElementById('player3-btn'),
    document.getElementById('player4-btn')
];
const levelSelection = document.getElementById('level-selection');
const levelBtns = document.querySelectorAll('.level-btn');
const gameOverScreen = document.getElementById('game-over');
const winnerDisplay = document.getElementById('winner-display');
const playAgainBtn = document.getElementById('play-again-btn');
const exitGameBtn = document.getElementById('exit-game-btn');
const timerContainer = document.getElementById('timer-container');
const timerDisplay = document.getElementById('timer');
const scoreSound = document.getElementById('score-sound');
const gameOverSound = document.getElementById('game-over-sound');
const backgroundMusic = document.getElementById('background-music');
const controlsInfo = document.getElementById('controls-info');

// Game State
const gameState = {
    wordLists: {
        1: ["cat", "dog", "sun", "hat", "pen", "box", "red", "leg", "eye", "arm"],
        2: ["apple", "house", "water", "queen", "juice", "train", "frog", "kite"],
        3: ["orange", "garden", "rabbit", "window", "butter", "yellow", "jacket"],
        4: ["elephant", "computer", "birthday", "mountain", "hospital", "friendly"],
        5: ["adventure", "beautiful", "dangerous", "education", "furniture"],
        6: ["government", "helicopter", "immediately", "knowledge", "laboratory"],
        7: ["magnificent", "neighborhood", "opportunity", "photograph", "qualification"],
        8: ["revolution", "significant", "temperature", "university", "vegetarian"],
        9: ["accommodation", "communication", "determination", "entertainment", "frustration"]
    },
    currentWordList: [],
    scores: [0, 0, 0, 0],
    currentWord: '',
    previousWord: '',
    wordElement: null,
    animationId: null,
    wordY: 0,
    wordX: 0,
    xDirection: 1,
    wordSpeedY: 1.5,
    wordSpeedX: 0.75,
    isPaused: false,
    gameActive: false,
    gameTimer: null,
    timeLeft: 60,
    musicPlaying: false
};

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadWordLists();
        setupEventListeners();
        initializeUI();
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Game initialization failed:', error);
    }
});

// Load word lists from JSON file
async function loadWordLists() {
    try {
        const response = await fetch('words/wordlists.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const loadedLists = await response.json();
        gameState.wordLists = {...gameState.wordLists, ...loadedLists};
        console.log('Word lists loaded:', gameState.wordLists);
    } catch (error) {
        console.warn('Using default word lists due to error:', error.message);
    }
}

function setupEventListeners() {
    // Button event listeners
    pauseBtn.addEventListener('click', togglePause);
    quitBtn.addEventListener('click', showGameOver);
    playAgainBtn.addEventListener('click', resetGame);
    exitGameBtn.addEventListener('click', resetGame);

    // Player buttons
    playerBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => playerGuess(index));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') playerGuess(index);
        });
    });

    // Level selection buttons
    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = parseInt(btn.dataset.level);
            if (level in gameState.wordLists) {
                startGame(level);
            } else {
                console.error('Invalid level selected:', level);
            }
        });
    });

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleWindowResize);
}

function initializeUI() {
    timerContainer.style.display = 'none';
    controlsInfo.style.display = 'none';
    gameOverScreen.style.display = 'none';
    pauseIndicator.style.display = 'none';
    levelSelection.style.display = 'flex';
}

function startGame(level) {
    console.log(`Starting game with level ${level}`);
    
    // Set up game state
    gameState.currentWordList = gameState.wordLists[level];
    gameState.previousWord = '';
    gameState.scores = [0, 0, 0, 0];
    gameState.gameActive = true;
    gameState.timeLeft = 60;

    // Update UI
    scoreDisplays.forEach(display => display.textContent = '0');
    levelSelection.style.display = 'none';
    timerContainer.style.display = 'block';
    controlsInfo.style.display = 'block';
    timerDisplay.textContent = gameState.timeLeft;

    // Set difficulty
    if (level <= 3) {
        gameState.wordSpeedY = 1.5;
        gameState.wordSpeedX = 0.75;
    } else if (level <= 6) {
        gameState.wordSpeedY = 2.25;
        gameState.wordSpeedX = 1.1;
    } else {
        gameState.wordSpeedY = 3.0;
        gameState.wordSpeedX = 1.5;
    }

    // Start game elements
    startBackgroundMusic();
    startTimer();
    createNewWord();
}

function createNewWord() {
    // Remove existing word if present
    if (gameState.wordElement) {
        gameContainer.removeChild(gameState.wordElement);
        cancelAnimationFrame(gameState.animationId);
    }

    // Create new word element
    gameState.currentWord = getRandomWord();
    gameState.wordElement = document.createElement('div');
    gameState.wordElement.className = 'falling-word';
    gameState.wordElement.textContent = gameState.currentWord;
    gameState.wordElement.setAttribute('aria-label', `Falling word: ${gameState.currentWord}`);

    // Position the word
    const buttonArea = 120;
    const maxWidth = window.innerWidth - gameState.wordElement.offsetWidth - buttonArea;
    gameState.wordX = Math.max(20, Math.floor(Math.random() * maxWidth));
    gameState.wordElement.style.left = `${gameState.wordX}px`;
    gameState.wordElement.style.top = '0px';
    gameState.wordY = 0;
    gameState.xDirection = Math.random() > 0.5 ? 1 : -1;

    gameContainer.appendChild(gameState.wordElement);
    
    if (!gameState.isPaused && gameState.gameActive) {
        animateWord();
    }
}

function getRandomWord() {
    let newWord;
    do {
        newWord = gameState.currentWordList[
            Math.floor(Math.random() * gameState.currentWordList.length)
        ];
    } while (newWord === gameState.previousWord && gameState.currentWordList.length > 1);
    
    gameState.previousWord = newWord;
    return newWord;
}

function animateWord() {
    if (gameState.isPaused || !gameState.gameActive) return;
    
    gameState.wordY += gameState.wordSpeedY;
    gameState.wordX += gameState.wordSpeedX * gameState.xDirection;
    
    // Calculate bounds to avoid button area
    const buttonArea = 120;
    const maxWidth = window.innerWidth - gameState.wordElement.offsetWidth - buttonArea;
    
    if (gameState.wordX <= 0 || gameState.wordX >= maxWidth) {
        gameState.xDirection *= -1;
        gameState.wordX = Math.max(0, Math.min(gameState.wordX, maxWidth));
    }
    
    gameState.wordElement.style.left = `${gameState.wordX}px`;
    gameState.wordElement.style.top = `${gameState.wordY}px`;
    
    if (gameState.wordY < window.innerHeight - 50) {
        gameState.animationId = requestAnimationFrame(animateWord);
    } else {
        createNewWord();
    }
}

function playerGuess(playerIndex) {
    if (gameState.isPaused || !gameState.gameActive) return;
    
    gameState.scores[playerIndex]++;
    scoreDisplays[playerIndex].textContent = gameState.scores[playerIndex];
    
    // Play sound effect
    scoreSound.currentTime = 0;
    scoreSound.play().catch(e => console.log("Score sound error:", e));
    
    // Visual feedback
    playerBtns[playerIndex].style.transform = 'scale(0.95)';
    setTimeout(() => {
        playerBtns[playerIndex].style.transform = 'scale(1)';
    }, 100);
    
    createNewWord();
}

function startTimer() {
    clearInterval(gameState.gameTimer);
    gameState.timeLeft = 60;
    timerDisplay.textContent = gameState.timeLeft;
    
    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        timerDisplay.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.gameTimer);
            showGameOver();
        }
    }, 1000);
}

function showGameOver() {
    gameState.gameActive = false;
    cancelAnimationFrame(gameState.animationId);
    clearInterval(gameState.gameTimer);
    backgroundMusic.pause();
    
    // Play game over sound
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(e => console.log("Game over sound error:", e));
    
    // Update final scores
    for (let i = 0; i < 4; i++) {
        finalScoreDisplays[i].textContent = gameState.scores[i];
    }
    
    // Determine winner(s)
    const maxScore = Math.max(...gameState.scores);
    const winners = gameState.scores.map((s, i) => s === maxScore ? i + 1 : null).filter(Boolean);
    
    if (winners.length === 1) {
        winnerDisplay.textContent = `Player ${winners[0]} Wins!`;
    } else {
        winnerDisplay.textContent = `Players ${winners.join(' & ')} Tie!`;
    }
    
    gameOverScreen.style.display = 'block';
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseIndicator.style.display = gameState.isPaused ? 'block' : 'none';
    pauseBtn.textContent = gameState.isPaused ? 'RESUME' : 'PAUSE';
    
    if (gameState.isPaused) {
        clearInterval(gameState.gameTimer);
        backgroundMusic.pause();
    } else if (gameState.gameActive) {
        startTimer();
        if (gameState.musicPlaying) {
            backgroundMusic.play();
        }
        if (gameState.wordElement) {
            animateWord();
        }
    }
}

function resetGame() {
    gameState.gameActive = false;
    cancelAnimationFrame(gameState.animationId);
    clearInterval(gameState.gameTimer);
    backgroundMusic.pause();
    gameState.musicPlaying = false;
    
    if (gameState.wordElement) {
        gameContainer.removeChild(gameState.wordElement);
        gameState.wordElement = null;
    }
    
    gameOverScreen.style.display = 'none';
    timerContainer.style.display = 'none';
    controlsInfo.style.display = 'none';
    levelSelection.style.display = 'flex';
}

function startBackgroundMusic() {
    backgroundMusic.currentTime = 0;
    backgroundMusic.play()
        .then(() => gameState.musicPlaying = true)
        .catch(e => {
            console.log("Background music error:", e);
            gameState.musicPlaying = false;
        });
}

function handleKeyDown(e) {
    if (!gameState.gameActive) return;
    
    switch(e.key.toLowerCase()) {
        case 'q': playerGuess(0); break;
        case 'w': playerGuess(1); break;
        case 'e': playerGuess(2); break;
        case 'r': playerGuess(3); break;
        case 'p': togglePause(); break;
        case 'escape': showGameOver(); break;
    }
}

function handleWindowResize() {
    if (gameState.wordElement) {
        const buttonArea = 120;
        const maxWidth = window.innerWidth - gameState.wordElement.offsetWidth - buttonArea;
        gameState.wordX = Math.min(gameState.wordX, maxWidth);
        gameState.wordElement.style.left = `${gameState.wordX}px`;
    }
}
