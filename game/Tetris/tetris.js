// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetromino shapes and colors
const TETROMINOS = {
    I: {
        shape: [
            [1, 1, 1, 1]
        ],
        color: '#00f5ff'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffff00'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#a000f0'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#00f000'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#f00000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#0000f0'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#f0a000'
    }
};

// Game state
let gameBoard = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let dropTime = 0;
let dropInterval = 1000;
let lastTime = 0;

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// Initialize the game
function initGame() {
    createBoard();
    generateNewPiece();
    generateNextPiece();
    loadHighScore();
    gameRunning = true;
    gameLoop();
}

// Create empty game board
function createBoard() {
    gameBoard = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        gameBoard[y] = [];
        for (let x = 0; x < BOARD_WIDTH; x++) {
            gameBoard[y][x] = 0;
        }
    }
}

// Generate a random tetromino
function generatePiece() {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
        type: randomPiece,
        shape: TETROMINOS[randomPiece].shape,
        color: TETROMINOS[randomPiece].color,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(TETROMINOS[randomPiece].shape[0].length / 2),
        y: 0
    };
}

// Generate new current piece
function generateNewPiece() {
    currentPiece = nextPiece || generatePiece();
    nextPiece = generatePiece();
    
    // Check if game over
    if (!isValidMove(currentPiece, 0, 0)) {
        gameOver();
    }
}

// Generate next piece
function generateNextPiece() {
    if (!nextPiece) {
        nextPiece = generatePiece();
    }
}

// Check if a move is valid
function isValidMove(piece, deltaX, deltaY, newShape = null) {
    const shape = newShape || piece.shape;
    const newX = piece.x + deltaX;
    const newY = piece.y + deltaY;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardX = newX + x;
                const boardY = newY + y;
                
                if (boardX < 0 || boardX >= BOARD_WIDTH || 
                    boardY >= BOARD_HEIGHT || 
                    (boardY >= 0 && gameBoard[boardY][boardX])) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Rotate piece
function rotatePiece(piece) {
    const rotated = [];
    const shape = piece.shape;
    
    for (let x = 0; x < shape[0].length; x++) {
        rotated[x] = [];
        for (let y = shape.length - 1; y >= 0; y--) {
            rotated[x][shape.length - 1 - y] = shape[y][x];
        }
    }
    
    return rotated;
}

// Place piece on board
function placePiece() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const boardY = currentPiece.y + y;
                const boardX = currentPiece.x + x;
                if (boardY >= 0) {
                    gameBoard[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
    
    clearLines();
    generateNewPiece();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (gameBoard[y].every(cell => cell !== 0)) {
            gameBoard.splice(y, 1);
            gameBoard.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        
        // Level up every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
        
        updateDisplay();
    }
}

// Move piece
function movePiece(deltaX, deltaY) {
    if (isValidMove(currentPiece, deltaX, deltaY)) {
        currentPiece.x += deltaX;
        currentPiece.y += deltaY;
        return true;
    }
    return false;
}

// Rotate current piece
function rotateCurrentPiece() {
    const rotated = rotatePiece(currentPiece);
    if (isValidMove(currentPiece, 0, 0, rotated)) {
        currentPiece.shape = rotated;
    }
}

// Hard drop
function hardDrop() {
    while (movePiece(0, 1)) {
        score += 2;
    }
    placePiece();
}

// Draw a single block
function drawBlock(ctx, x, y, color, size = BLOCK_SIZE) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    
    // Add highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * size, y * size, size, 2);
    ctx.fillRect(x * size, y * size, 2, size);
    
    // Add shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * size + size - 2, y * size, 2, size);
    ctx.fillRect(x * size, y * size + size - 2, size, 2);
}

// Draw the game board
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * BLOCK_SIZE, 0);
        ctx.lineTo(x * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * BLOCK_SIZE);
        ctx.lineTo(canvas.width, y * BLOCK_SIZE);
        ctx.stroke();
    }
    
    // Draw placed pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (gameBoard[y][x]) {
                drawBlock(ctx, x, y, gameBoard[y][x]);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            }
        }
    }
}

// Draw next piece
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const offsetX = (nextCanvas.width / BLOCK_SIZE - nextPiece.shape[0].length) / 2;
        const offsetY = (nextCanvas.height / BLOCK_SIZE - nextPiece.shape.length) / 2;
        
        for (let y = 0; y < nextPiece.shape.length; y++) {
            for (let x = 0; x < nextPiece.shape[y].length; x++) {
                if (nextPiece.shape[y][x]) {
                    drawBlock(nextCtx, offsetX + x, offsetY + y, nextPiece.color, BLOCK_SIZE);
                }
            }
        }
    }
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = score.toLocaleString();
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// Game over
function gameOver() {
    gameRunning = false;
    saveHighScore();
    
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');
    
    title.textContent = 'Game Over!';
    message.textContent = `Final Score: ${score.toLocaleString()}`;
    overlay.classList.add('active');
}

// Pause game
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (gamePaused) {
        pauseBtn.textContent = '▶️ Resume';
        const overlay = document.getElementById('gameOverlay');
        const title = document.getElementById('overlayTitle');
        const message = document.getElementById('overlayMessage');
        
        title.textContent = 'Paused';
        message.textContent = 'Press P to resume';
        overlay.classList.add('active');
    } else {
        pauseBtn.textContent = '⏸️ Pause';
        document.getElementById('gameOverlay').classList.remove('active');
    }
}

// Restart game
function restartGame() {
    gameBoard = [];
    currentPiece = null;
    nextPiece = null;
    score = 0;
    level = 1;
    lines = 0;
    gameRunning = true;
    gamePaused = false;
    dropTime = 0;
    dropInterval = 1000;
    
    document.getElementById('gameOverlay').classList.remove('active');
    document.getElementById('pauseBtn').textContent = '⏸️ Pause';
    
    createBoard();
    generateNewPiece();
    generateNextPiece();
    updateDisplay();
}

// Save high score
function saveHighScore() {
    const currentHigh = localStorage.getItem('tetrisHighScore') || 0;
    if (score > currentHigh) {
        localStorage.setItem('tetrisHighScore', score);
        document.getElementById('highScore').textContent = score.toLocaleString();
    }
}

// Load high score
function loadHighScore() {
    const highScore = localStorage.getItem('tetrisHighScore') || 0;
    document.getElementById('highScore').textContent = parseInt(highScore).toLocaleString();
}

// Game loop
function gameLoop(currentTime = 0) {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    dropTime += deltaTime;
    
    if (dropTime >= dropInterval) {
        if (!movePiece(0, 1)) {
            placePiece();
        }
        dropTime = 0;
    }
    
    drawBoard();
    drawNextPiece();
    
    requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) {
        if (e.code === 'Space') {
            restartGame();
        }
        return;
    }
    
    switch (e.code) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            if (movePiece(0, 1)) {
                score += 1;
            }
            break;
        case 'ArrowUp':
            rotateCurrentPiece();
            break;
        case 'Space':
            hardDrop();
            break;
        case 'KeyP':
            togglePause();
            break;
    }
    
    e.preventDefault();
});

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameRunning || gamePaused) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30) {
            movePiece(1, 0);
        } else if (deltaX < -30) {
            movePiece(-1, 0);
        }
    } else {
        if (deltaY > 30) {
            if (movePiece(0, 1)) {
                score += 1;
            }
        } else if (deltaY < -30) {
            rotateCurrentPiece();
        }
    }
});

// Double tap for hard drop
let lastTap = 0;
canvas.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    
    if (tapLength < 500 && tapLength > 0) {
        hardDrop();
    }
    lastTap = currentTime;
});

// Initialize the game when the page loads
window.addEventListener('load', () => {
    initGame();
});

// Handle window focus/blur for pause
window.addEventListener('blur', () => {
    if (gameRunning && !gamePaused) {
        togglePause();
    }
});
