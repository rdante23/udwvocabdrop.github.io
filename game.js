// Game variables
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

let wordLists = {};
let currentWordList = [];
let scores = [0, 0, 0, 0];
let currentWord = '';
let previousWord = '';
let wordElement = null;
let animationId = null;
let wordY = 0;
let wordX = 0;
let xDirection = 1;
let wordSpeedY = 1.5;
let wordSpeedX = 0.75;
let isPaused = false;
let gameActive = false;
let gameTimer = null;
let timeLeft = 60;
let musicPlaying = false;

// Load word lists from JSON file
async function loadWordLists() {
    try {
        const response = await fetch('words/wordlists.json');
        wordLists = await response.json();
        console.log('Word lists loaded successfully');
    } catch (error) {
        console.error('Error loading word lists:', error);
        // Fallback to default word lists if loading fails
        wordLists = {
            1: ["cat", "dog", "sun", "hat", "pen", "box", "red", "leg", "eye", "arm"],
            2: ["apple", "house", "water", "queen", "juice", "train", "frog", "kite"],
            3: ["orange", "garden", "rabbit", "window", "butter", "yellow", "jacket"],
            4: ["elephant", "computer", "birthday", "mountain", "hospital", "friendly"],
            5: ["adventure", "beautiful", "dangerous", "education", "furniture"],
            6: ["government", "helicopter", "immediately", "knowledge", "laboratory"],
            7: ["magnificent", "neighborhood", "opportunity", "photograph", "qualification"],
            8: ["revolution", "significant", "temperature", "university", "vegetarian"],
            9: ["accommodation", "communication", "determination", "entertainment", "frustration"]
        };
    }
}

// Initialize the game
async function initGame() {
    await loadWordLists();
    
    // Set up button event listeners
    pauseBtn.addEventListener('click', togglePause);
    quitBtn.addEventListener('click', showGameOver);
    
    playerBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => playerGuess(index));
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                playerGuess(index);
            }
        });
    });

    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const level = parseInt(btn.dataset.level);
            startGame(level);
        });
    });

    playAgainBtn.addEventListener('click', () => {
        resetGame();
    });

    exitGameBtn.addEventListener('click', () => {
        resetGame();
    });

    // Initialize UI
    timerContainer.style.display = 'none';
    controlsInfo.style.display = 'none';
    
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (wordElement) {
            const buttonArea = 120;
            const maxWidth = window.innerWidth - wordElement.offsetWidth - buttonArea;
            wordX = Math.min(wordX, maxWidth);
            wordElement.style.left = wordX + 'px';
        }
    });
}

// [Rest of your game functions remain the same as in your original code]
// getRandomWord, createNewWord, animateWord, togglePause, playerGuess, 
// startTimer, showGameOver, startGame, resetGame, handleKeyDown

// Start the game
initGame();