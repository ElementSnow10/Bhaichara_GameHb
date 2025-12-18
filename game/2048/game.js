const GRID_SIZE = 4;
const CELL_SIZE = 95; // Must match CSS
const CELL_GAP = 15;  // Must match CSS

// State
let grid = []; // 4x4 array storing Tile objects or null
let score = 0;
let bestScore = localStorage.getItem('2048-best') || 0;
let gameOver = false;
let gameWon = false;

// DOM
const gridElement = document.getElementById('grid'); // Background grid
const tileContainer = document.getElementById('tile-container'); // Moving tiles
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMsg = document.getElementById('overlayMessage');

class Tile {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.element = document.createElement('div');
        this.element.classList.add('tile');
        this.element.classList.add('new-tile');
        this.element.dataset.val = value;
        this.element.textContent = value;
        tileContainer.appendChild(this.element);
        this.updatePosition();

        // Remove pop animation class after animation
        setTimeout(() => this.element.classList.remove('new-tile'), 200);
    }

    updatePosition() {
        const xPos = this.x * (CELL_SIZE + CELL_GAP);
        const yPos = this.y * (CELL_SIZE + CELL_GAP);
        this.element.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    setValue(newValue) {
        this.value = newValue;
        this.element.dataset.val = newValue;
        this.element.textContent = newValue;
        // Pulse animation
        this.element.classList.add('merged-tile');
        setTimeout(() => this.element.classList.remove('merged-tile'), 200);
    }

    remove() {
        // Wait for transition if needed, or remove immediately
        // For merge, we want to remove the 'old' tile immediately from DOM 
        // to avoid visual glitch, or fade it out. 
        // Simple approach: Remove immediately
        this.element.remove();
    }
}

function initGame() {
    tileContainer.innerHTML = '';
    grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    score = 0;
    gameOver = false;
    gameWon = false;
    overlay.classList.remove('active');
    updateScore();

    // Spawn 2 tiles
    spawnTile();
    spawnTile();
    setupInput();
}

function spawnTile() {
    const emptyCells = [];
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (!grid[x][y]) emptyCells.push({ x, y });
        }
    }

    if (emptyCells.length === 0) return;

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    grid[randomCell.x][randomCell.y] = new Tile(randomCell.x, randomCell.y, value);

    // Check game over
    if (emptyCells.length === 1 && !canMove()) {
        endGame(false);
    }
}

function updateScore() {
    scoreEl.textContent = score;
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('2048-best', bestScore);
    }
    bestEl.textContent = bestScore;
}

function canMove() {
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (!grid[x][y]) return true;
            const val = grid[x][y].value;
            // Check neighbors
            if (x < GRID_SIZE - 1 && grid[x + 1][y] && grid[x + 1][y].value === val) return true;
            if (y < GRID_SIZE - 1 && grid[x][y + 1] && grid[x][y + 1].value === val) return true;
        }
    }
    return false;
}

function endGame(won) {
    gameOver = true;
    overlayTitle.textContent = won ? "YOU WON!" : "GAME OVER";
    overlayMsg.textContent = won ? "2048 Unlocked!" : "Better luck next time.";
    overlay.classList.add('active');
}

// Logic: Move & Merge
// Directions: 0:Up, 1:Right, 2:Down, 3:Left
async function move(direction) {
    if (gameOver) return;

    let moved = false;
    const mergedTiles = []; // Track merged positions this turn to prevent double merge

    const traverseX = direction === 1 ? [3, 2, 1, 0] : [0, 1, 2, 3];
    const traverseY = direction === 2 ? [3, 2, 1, 0] : [0, 1, 2, 3];

    // Helper to get vector
    const vector = { x: 0, y: 0 };
    if (direction === 0) vector.y = -1; // Up
    if (direction === 2) vector.y = 1;  // Down
    if (direction === 3) vector.x = -1; // Left
    if (direction === 1) vector.x = 1;  // Right

    // We need to iterate in the correct order to push tiles
    // If moving Right (x+), iterate x from 3 to 0
    // If moving Down (y+), iterate y from 3 to 0

    // Logic Loop
    for (const x of traverseX) {
        for (const y of traverseY) {
            const tile = grid[x][y];
            if (!tile) continue;

            let nextX = x;
            let nextY = y;
            let dist = 0;

            // Project forward
            while (true) {
                const checkX = nextX + vector.x;
                const checkY = nextY + vector.y;

                // Bounds check
                if (checkX < 0 || checkX >= GRID_SIZE || checkY < 0 || checkY >= GRID_SIZE) break;

                const neighbor = grid[checkX][checkY];
                if (!neighbor) {
                    // Empty, move into it
                    nextX = checkX;
                    nextY = checkY;
                    dist++;
                } else if (neighbor.value === tile.value && !mergedTiles.includes(neighbor)) {
                    // Merge!
                    nextX = checkX;
                    nextY = checkY;
                    dist++;
                    break; // Stop after finding merge target
                } else {
                    // Blocked
                    break;
                }
            }

            if (dist > 0) {
                moved = true;

                const targetTile = grid[nextX][nextY];

                if (targetTile) {
                    // MERGE
                    // 1. Move current tile visually to target
                    tile.x = nextX;
                    tile.y = nextY;
                    tile.updatePosition();

                    // 2. Wait for animation then update logic? 
                    // To keep it snappy (150ms), we update logic immediately but handle DOM removal carefully.

                    // We remove the old DOM element of the 'target' immediately? No, we merge INTO it.
                    // Actually, usually you move 'tile' to 'target', then remove 'tile' and upgrade 'target'.

                    // Let's discard 'tile' (current) and keep 'target' (destination), updating target's value
                    // But visually, 'tile' needs to slide INTO 'target'.

                    // Wait for slide (pseudo-async purely visual)
                    grid[x][y] = null; // Remove from old slot

                    // Note: targetTile is already in grid[nextX][nextY].
                    // We need to mark it as merged so it doesn't merge again this turn
                    mergedTiles.push(targetTile);

                    // Visual Hack: 
                    // The 'tile' slides ON TOP of 'targetTile'.
                    tile.element.style.zIndex = 100;

                    setTimeout(() => {
                        tile.remove(); // Remove the slider
                        targetTile.setValue(targetTile.value * 2);
                        score += targetTile.value;
                        updateScore();
                        if (targetTile.value === 2048 && !gameWon) {
                            gameWon = true;
                            endGame(true);
                        }
                    }, 150);

                } else {
                    // MOVE into empty
                    grid[x][y] = null;
                    grid[nextX][nextY] = tile;
                    tile.x = nextX;
                    tile.y = nextY;
                    tile.updatePosition();
                }
            }
        }
    }

    if (moved) {
        // Wait for animation to finish slightly before spawning new tile?
        // Or spawn immediately? Standard is slightly after move starts.
        setTimeout(() => {
            spawnTile();
            if (!canMove() && !gameWon) endGame(false);
        }, 150);
    }
}

function setupInput() {
    window.addEventListener('keydown', handleKey);
    let startX, startY;

    // Swipe
    document.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        e.preventDefault(); // Lock scroll
    }, { passive: false });

    document.addEventListener('touchend', e => {
        if (!startX || !startY) return;
        const dx = e.changedTouches[0].clientX - startX;
        const dy = e.changedTouches[0].clientY - startY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        if (Math.max(absDx, absDy) > 30) {
            if (absDx > absDy) {
                move(dx > 0 ? 1 : 3);
            } else {
                move(dy > 0 ? 2 : 0);
            }
        }
        startX = null;
        startY = null;
    });
}

function handleKey(e) {
    if (gameOver) return;
    switch (e.key) {
        case 'ArrowUp': move(0); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': move(2); break;
        case 'ArrowLeft': move(3); break;
    }
}

// Global functions for buttons
window.restartGame = initGame;

// Start
initGame();
