// Game constants
const GRID_SIZE = 4;
const CELL_SIZE = 85;
const CELL_GAP = 15;

// Game state
let grid = [];
let score = 0;
let bestScore = 0;
let moves = 0;
let gameWon = false;
let gameOver = false;
let moveHistory = [];
let canUndo = false;

// DOM elements
const gridContainer = document.getElementById('grid');
const scoreElement = document.getElementById('score');
const bestElement = document.getElementById('best');
const movesElement = document.getElementById('moves');
const gameOverlay = document.getElementById('gameOverlay');
const winOverlay = document.getElementById('winOverlay');

// Initialize the game
function initGame() {
    loadBestScore();
    createGrid();
    addInitialTiles();
    updateDisplay();
    setupEventListeners();
}

// Create the grid structure
function createGrid() {
    gridContainer.innerHTML = '';
    grid = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
        grid[row] = [];
        for (let col = 0; col < GRID_SIZE; col++) {
            // Create grid cell
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.gridRow = row + 1;
            cell.style.gridColumn = col + 1;
            gridContainer.appendChild(cell);
            
            grid[row][col] = 0;
        }
    }
}

// Add initial tiles
function addInitialTiles() {
    addRandomTile();
    addRandomTile();
}

// Add a random tile (2 or 4)
function addRandomTile() {
    const emptyCells = [];
    
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === 0) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const value = Math.random() < 0.9 ? 2 : 4;
        grid[randomCell.row][randomCell.col] = value;
        createTile(randomCell.row, randomCell.col, value);
    }
}

// Create a tile element
function createTile(row, col, value) {
    const tile = document.createElement('div');
    tile.className = `tile tile-${value}`;
    tile.textContent = value;
    tile.style.gridRow = row + 1;
    tile.style.gridColumn = col + 1;
    tile.dataset.row = row;
    tile.dataset.col = col;
    tile.dataset.value = value;
    
    gridContainer.appendChild(tile);
}

// Move tiles in a direction
function moveTiles(direction) {
    if (gameOver) return false;
    
    // Save current state for undo
    saveState();
    
    let moved = false;
    const oldGrid = JSON.parse(JSON.stringify(grid));
    
    switch (direction) {
        case 'up':
            moved = moveUp();
            break;
        case 'down':
            moved = moveDown();
            break;
        case 'left':
            moved = moveLeft();
            break;
        case 'right':
            moved = moveRight();
            break;
    }
    
    if (moved) {
        moves++;
        addRandomTile();
        updateDisplay();
        checkGameState();
        canUndo = true;
    }
    
    return moved;
}

// Move tiles up
function moveUp() {
    let moved = false;
    
    for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        
        // Collect non-zero values
        for (let row = 0; row < GRID_SIZE; row++) {
            if (grid[row][col] !== 0) {
                column.push(grid[row][col]);
            }
        }
        
        // Merge adjacent equal values
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                score += column[i];
                column.splice(i + 1, 1);
            }
        }
        
        // Fill with zeros
        while (column.length < GRID_SIZE) {
            column.push(0);
        }
        
        // Update grid and check if moved
        for (let row = 0; row < GRID_SIZE; row++) {
            if (grid[row][col] !== column[row]) {
                moved = true;
            }
            grid[row][col] = column[row];
        }
    }
    
    if (moved) {
        updateTiles();
    }
    
    return moved;
}

// Move tiles down
function moveDown() {
    let moved = false;
    
    for (let col = 0; col < GRID_SIZE; col++) {
        const column = [];
        
        // Collect non-zero values
        for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (grid[row][col] !== 0) {
                column.push(grid[row][col]);
            }
        }
        
        // Merge adjacent equal values
        for (let i = 0; i < column.length - 1; i++) {
            if (column[i] === column[i + 1]) {
                column[i] *= 2;
                score += column[i];
                column.splice(i + 1, 1);
            }
        }
        
        // Fill with zeros
        while (column.length < GRID_SIZE) {
            column.push(0);
        }
        
        // Update grid and check if moved
        for (let row = 0; row < GRID_SIZE; row++) {
            if (grid[GRID_SIZE - 1 - row][col] !== column[row]) {
                moved = true;
            }
            grid[GRID_SIZE - 1 - row][col] = column[row];
        }
    }
    
    if (moved) {
        updateTiles();
    }
    
    return moved;
}

// Move tiles left
function moveLeft() {
    let moved = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        const rowArray = [];
        
        // Collect non-zero values
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] !== 0) {
                rowArray.push(grid[row][col]);
            }
        }
        
        // Merge adjacent equal values
        for (let i = 0; i < rowArray.length - 1; i++) {
            if (rowArray[i] === rowArray[i + 1]) {
                rowArray[i] *= 2;
                score += rowArray[i];
                rowArray.splice(i + 1, 1);
            }
        }
        
        // Fill with zeros
        while (rowArray.length < GRID_SIZE) {
            rowArray.push(0);
        }
        
        // Update grid and check if moved
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] !== rowArray[col]) {
                moved = true;
            }
            grid[row][col] = rowArray[col];
        }
    }
    
    if (moved) {
        updateTiles();
    }
    
    return moved;
}

// Move tiles right
function moveRight() {
    let moved = false;
    
    for (let row = 0; row < GRID_SIZE; row++) {
        const rowArray = [];
        
        // Collect non-zero values
        for (let col = GRID_SIZE - 1; col >= 0; col--) {
            if (grid[row][col] !== 0) {
                rowArray.push(grid[row][col]);
            }
        }
        
        // Merge adjacent equal values
        for (let i = 0; i < rowArray.length - 1; i++) {
            if (rowArray[i] === rowArray[i + 1]) {
                rowArray[i] *= 2;
                score += rowArray[i];
                rowArray.splice(i + 1, 1);
            }
        }
        
        // Fill with zeros
        while (rowArray.length < GRID_SIZE) {
            rowArray.push(0);
        }
        
        // Update grid and check if moved
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][GRID_SIZE - 1 - col] !== rowArray[col]) {
                moved = true;
            }
            grid[row][GRID_SIZE - 1 - col] = rowArray[col];
        }
    }
    
    if (moved) {
        updateTiles();
    }
    
    return moved;
}

// Update tile elements to match grid
function updateTiles() {
    // Remove all existing tiles
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => tile.remove());
    
    // Create new tiles based on grid
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] !== 0) {
                createTile(row, col, grid[row][col]);
            }
        }
    }
}

// Check game state (win/lose)
function checkGameState() {
    // Check for win
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === 2048 && !gameWon) {
                gameWon = true;
                showWinScreen();
            }
        }
    }
    
    // Check for game over
    if (isGameOver()) {
        gameOver = true;
        showGameOverScreen();
    }
    
    // Update achievements
    updateAchievements();
}

// Check if game is over
function isGameOver() {
    // Check if there are empty cells
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] === 0) {
                return false;
            }
        }
    }
    
    // Check if any moves are possible
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            const currentValue = grid[row][col];
            
            // Check right neighbor
            if (col < GRID_SIZE - 1 && grid[row][col + 1] === currentValue) {
                return false;
            }
            
            // Check bottom neighbor
            if (row < GRID_SIZE - 1 && grid[row + 1][col] === currentValue) {
                return false;
            }
        }
    }
    
    return true;
}

// Show win screen
function showWinScreen() {
    winOverlay.classList.add('active');
}

// Show game over screen
function showGameOverScreen() {
    gameOverlay.classList.add('active');
}

// Continue game after winning
function continueGame() {
    winOverlay.classList.remove('active');
}

// Restart game
function restartGame() {
    gameWon = false;
    gameOver = false;
    score = 0;
    moves = 0;
    canUndo = false;
    moveHistory = [];
    
    gameOverlay.classList.remove('active');
    winOverlay.classList.remove('active');
    
    createGrid();
    addInitialTiles();
    updateDisplay();
    updateAchievements();
}

// Save current state for undo
function saveState() {
    moveHistory.push({
        grid: JSON.parse(JSON.stringify(grid)),
        score: score,
        moves: moves
    });
    
    // Keep only last 10 moves
    if (moveHistory.length > 10) {
        moveHistory.shift();
    }
}

// Undo last move
function undoMove() {
    if (moveHistory.length > 0 && canUndo) {
        const lastState = moveHistory.pop();
        grid = lastState.grid;
        score = lastState.score;
        moves = lastState.moves;
        
        updateTiles();
        updateDisplay();
        
        if (moveHistory.length === 0) {
            canUndo = false;
        }
    }
}

// Update display
function updateDisplay() {
    scoreElement.textContent = score.toLocaleString();
    movesElement.textContent = moves.toLocaleString();
    
    if (score > bestScore) {
        bestScore = score;
        bestElement.textContent = bestScore.toLocaleString();
        saveBestScore();
    }
}

// Update achievements
function updateAchievements() {
    const achievements = document.querySelectorAll('.achievement');
    const maxTile = getMaxTile();
    
    achievements.forEach(achievement => {
        const tileValue = parseInt(achievement.dataset.tile);
        if (maxTile >= tileValue) {
            achievement.classList.add('unlocked');
        } else {
            achievement.classList.remove('unlocked');
        }
    });
}

// Get maximum tile value
function getMaxTile() {
    let max = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
            if (grid[row][col] > max) {
                max = grid[row][col];
            }
        }
    }
    return max;
}

// Save best score to localStorage
function saveBestScore() {
    localStorage.setItem('2048BestScore', bestScore);
}

// Load best score from localStorage
function loadBestScore() {
    const saved = localStorage.getItem('2048BestScore');
    bestScore = saved ? parseInt(saved) : 0;
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                moveTiles('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                moveTiles('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                moveTiles('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                moveTiles('right');
                break;
            case 'r':
            case 'R':
                restartGame();
                break;
            case 'u':
            case 'U':
                undoMove();
                break;
        }
    });
    
    // Touch controls
    let startX, startY, startTime;
    
    gridContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        startTime = Date.now();
    });
    
    gridContainer.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (!startX || !startY) return;
        
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const deltaTime = Date.now() - startTime;
        
        // Minimum swipe distance and time
        if (deltaTime < 500 && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    moveTiles('right');
                } else {
                    moveTiles('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    moveTiles('down');
                } else {
                    moveTiles('up');
                }
            }
        }
        
        startX = startY = null;
    });
    
    // Prevent context menu on right click
    gridContainer.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);
