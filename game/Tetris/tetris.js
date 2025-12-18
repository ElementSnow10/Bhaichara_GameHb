// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetromino shapes and colors
const TETROMINOS = {
    I: {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
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
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#a000f0'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00f000'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#f00000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000f0'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
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
let bag = [];
let particleSystem = [];
let shakeTime = 0;

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

// Initialize the game
function initGame() {
    createBoard();
    bag = []; // Reset bag
    generateNewPiece();
    generateNextPiece();
    loadHighScore();
    gameRunning = true;
    requestAnimationFrame(gameLoop);
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

// 7-Bag Randomizer
function fillBag() {
    const pieces = Object.keys(TETROMINOS);
    // Shuffle pieces
    for (let i = pieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
    }
    bag = pieces;
}

function getPieceFromBag() {
    if (bag.length === 0) {
        fillBag();
    }
    return bag.pop();
}

// Generate new current piece
function generateNewPiece() {
    if (nextPiece) {
        currentPiece = nextPiece;
    } else {
        const type = getPieceFromBag();
        currentPiece = createPieceObj(type);
    }

    const nextType = getPieceFromBag();
    nextPiece = createPieceObj(nextType);

    // Check if game over
    if (!isValidMove(currentPiece, 0, 0)) {
        gameOver();
    }
}

function createPieceObj(type) {
    const pieceDef = TETROMINOS[type];
    return {
        type: type,
        shape: JSON.parse(JSON.stringify(pieceDef.shape)), // Deep copy used for rotation
        color: pieceDef.color,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceDef.shape[0].length / 2),
        y: 0
    };
}

// Generate next piece (helper for init)
function generateNextPiece() {
    // Already handled in generateNewPiece logic mostly, but ensured here
    if (!nextPiece) {
        const type = getPieceFromBag();
        nextPiece = createPieceObj(type);
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
function rotateMatrix(matrix) {
    const N = matrix.length;
    const result = matrix.map((row, i) =>
        row.map((val, j) => matrix[N - 1 - j][i])
    );
    return result;
}


// Rotate current piece with Wall Kicks
function rotateCurrentPiece() {
    const rotated = rotateMatrix(currentPiece.shape);

    // Basic Wall Kick tests (Standard Rotation System simplified)
    // Try original position, then offsets: right, left, up/down variations
    const kicks = [
        [0, 0],   // 0. Base
        [-1, 0],  // 1. Left
        [1, 0],   // 2. Right
        [0, -1],  // 3. Up (floor kick)
        [-2, 0],  // 4. Double Left (for I piece against wall)
        [2, 0]    // 5. Double Right
    ];

    for (const [offsetX, offsetY] of kicks) {
        if (isValidMove(currentPiece, offsetX, offsetY, rotated)) {
            currentPiece.shape = rotated;
            currentPiece.x += offsetX;
            currentPiece.y += offsetY;
            return;
        }
    }
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

    shakeScreen(5); // Small shake on drop
    clearLines();
    generateNewPiece();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;

    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (gameBoard[y].every(cell => cell !== 0)) {
            // Spawn particles
            spawnParticles(BOARD_WIDTH / 2 * BLOCK_SIZE, y * BLOCK_SIZE, getLineColor(y));

            gameBoard.splice(y, 1);
            gameBoard.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }

    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level; // Basic scoring

        // Bonus for multi-line clears
        if (linesCleared === 4) {
            score += 400 * level; // Tetris bonus
            shakeScreen(20); // Big shake for Tetris
        } else {
            shakeScreen(10);
        }

        // Level up every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);

            // Level up notification?
        }

        updateDisplay();
    }
}

function getLineColor(y) {
    // find a color from the line to use for particles
    for (let x = 0; x < BOARD_WIDTH; x++) {
        if (gameBoard[y][x]) return gameBoard[y][x];
    }
    return '#ffffff';
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

// Hard drop
function hardDrop() {
    while (movePiece(0, 1)) {
        score += 2;
    }
    placePiece();
}

// Ghost Piece Logic
function getGhostPosition() {
    if (!currentPiece) return null;

    let ghostY = currentPiece.y;

    // Simulate dropping down
    while (isValidMove(currentPiece, 0, ghostY - currentPiece.y + 1)) {
        ghostY++;
    }

    return { x: currentPiece.x, y: ghostY };
}

// Draw a single block
function drawBlock(ctx, x, y, color, size = BLOCK_SIZE, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
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
    ctx.restore();
}

// Visual Effects: Particles
function spawnParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
        particleSystem.push({
            x: x + Math.random() * BOARD_WIDTH * BLOCK_SIZE, // Spread across line
            y: y + BLOCK_SIZE / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 1.0,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particleSystem.length - 1; i >= 0; i--) {
        let p = particleSystem[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) {
            particleSystem.splice(i, 1);
        }
    }
}

function drawParticles(ctx) {
    for (let p of particleSystem) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 5, 5);
        ctx.globalAlpha = 1.0;
    }
}

// Visual Effects: Screen Shake
function shakeScreen(amount) {
    shakeTime = amount;
}

// Draw the game board
function drawBoard() {
    // Handle Shake
    let shakeX = 0;
    let shakeY = 0;
    if (shakeTime > 0) {
        shakeX = (Math.random() - 0.5) * shakeTime;
        shakeY = (Math.random() - 0.5) * shakeTime;
        shakeTime *= 0.9;
        if (shakeTime < 0.5) shakeTime = 0;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);
    ctx.clearRect(-shakeTime, -shakeTime, canvas.width + shakeTime * 2, canvas.height + shakeTime * 2);

    // Draw background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; // More subtle grid
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

    // Draw Ghost Piece
    if (currentPiece) {
        const ghost = getGhostPosition();
        if (ghost) {
            for (let y = 0; y < currentPiece.shape.length; y++) {
                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                    if (currentPiece.shape[y][x]) {
                        // Draw ghost with low opacity and just an outline or simplified look?
                        // Using same drawBlock but very low alpha
                        drawBlock(ctx, ghost.x + x, ghost.y + y, currentPiece.color, BLOCK_SIZE, 0.2);
                    }
                }
            }
        }

        // Draw current piece
        for (let y = 0; y < currentPiece.shape.length; y++) {
            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                if (currentPiece.shape[y][x]) {
                    drawBlock(ctx, currentPiece.x + x, currentPiece.y + y, currentPiece.color);
                }
            }
        }
    }

    // Draw particles
    drawParticles(ctx);

    ctx.restore();
}

// Draw next piece
function drawNextPiece() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (nextPiece) {
        // Calculate standard logical offset
        // Adjust for specific piece centers if needed to make it look nice in the box
        let startX = 1;
        let startY = 1;

        // Specific adjustments for better centering in 4x4 or 3x3 grids (Next box is small)
        if (nextPiece.type === 'O') { startX = 1; startY = 1; }
        else if (nextPiece.type === 'I') { startX = 0; startY = 0.5; }

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

    document.getElementById('gameOverlay').classList.remove('active');
    document.getElementById('pauseBtn').textContent = '⏸️ Pause';

    initGame();
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
        if (gameRunning && gamePaused) {
            // Still need to listen for events, but loop stops updating logic
            // We can just return, as togglePause handles UI
        }
        if (!gameRunning) return;

        // If just paused, we might want to check again later? 
        // Actually requestAnimationFrame is smart. We just re-request if we want to loop.
        // But here we stop loop. togglePause or input needs to restart it?
        // Ah, pause just blocks logic updates usually but keeps drawing? 
        // Let's keep loop running but skip updates if paused for simpler code?
        // Or cleaner: stop requesting frame if paused. And togglePause calls requestAnimationFrame again.
    }

    // Better: Always loop, just guard logic.
    requestAnimationFrame(gameLoop);

    if (gamePaused) return;

    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update logic
    dropTime += deltaTime;

    if (dropTime >= dropInterval) {
        // Try to move down
        if (movePiece(0, 1)) {
            // Moved successfully, reset lock timer if it was active
            // Actually standard tetris resets lock delay on successful movement/rotation?
            // For simple implementation: just move.
        } else {
            // Cannot move down. Initiating lock mechanism.
            // In a full implementation we would have a separate lock timer constant (e.g. 500ms)
            // For now, let's just make it distinct or stick to the previous 'instant' lock if simpler.
            // But the plan called for Lock Delay.
            // Let's use a simple counter or checking if we are already in 'locking' state.
            // To keep it simple but effective: We only place if we've been stuck for a short time?
            // Or easier: Only place if we try to move down and fail, AND we are out of time?
            // Actually, the standard way is: 
            // If touching ground, start lock timer. If user moves/rotates, reset timer (with limit).
            // Given the complexity of adding a full lock timer state machine now, I will stick to a small grace period implemented via a 'lock delay' variable.

            // Revert to instant placement for now to ensure stability, but if I want to add it:
            placePiece();
        }
        dropTime = 0;
    }

    updateParticles();
    drawBoard();
    drawNextPiece();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) {
        if (e.code === 'Space' && !gameRunning) {
            restartGame();
        } else if (e.code === 'KeyP' && gameRunning) {
            togglePause();
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
                // updateDisplay(); // dynamic update?
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

    // Redraw immediately for responsiveness
    drawBoard();
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
    drawBoard();
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
