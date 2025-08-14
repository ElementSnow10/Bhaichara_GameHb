// Game constants
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const PLAYER_WIDTH = 60;
const PLAYER_HEIGHT = 20;
const BLOCK_SIZE = 30;
const ZONE_HEIGHT = 40;

// Colors
const COLORS = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    yellow: '#f1c40f'
};

// Game state
let canvas, ctx;
let gameRunning = false;
let gamePaused = false;
let score = 0;
let level = 1;
let lives = 3;
let combo = 0;
let highScore = 0;

// Player
let player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: 5
};

// Game objects
let blocks = [];
let zones = [];
let particles = [];
let powerUps = [];

// Power-up states
let slowMotion = false;
let autoGuide = false;
let shield = false;
let powerUpTimer = 0;

// Initialize the game
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    loadHighScore();
    createZones();
    setupEventListeners();
    startGame();
}

// Create color zones at the bottom
function createZones() {
    const zoneWidth = CANVAS_WIDTH / 4;
    const zoneY = CANVAS_HEIGHT - ZONE_HEIGHT - 10;
    
    zones = [
        { x: 0, y: zoneY, width: zoneWidth, height: ZONE_HEIGHT, color: 'red' },
        { x: zoneWidth, y: zoneY, width: zoneWidth, height: ZONE_HEIGHT, color: 'blue' },
        { x: zoneWidth * 2, y: zoneY, width: zoneWidth, height: ZONE_HEIGHT, color: 'green' },
        { x: zoneWidth * 3, y: zoneY, width: zoneWidth, height: ZONE_HEIGHT, color: 'yellow' }
    ];
}

// Start the game
function startGame() {
    gameRunning = true;
    gamePaused = false;
    score = 0;
    level = 1;
    lives = 3;
    combo = 0;
    blocks = [];
    particles = [];
    powerUps = [];
    
    updateDisplay();
    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameRunning || gamePaused) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    update();
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    updateBlocks();
    updateParticles();
    updatePowerUps();
    updatePlayer();
    checkCollisions();
    spawnBlocks();
    updatePowerUpTimers();
}

// Update falling blocks
function updateBlocks() {
    const speed = slowMotion ? 1 : 2 + level * 0.5;
    
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];
        block.y += speed;
        
        // Remove blocks that fall off screen
        if (block.y > CANVAS_HEIGHT + BLOCK_SIZE) {
            blocks.splice(i, 1);
            loseLife();
        }
    }
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Update power-ups
function updatePowerUps() {
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        powerUp.y += 2;
        
        if (powerUp.y > CANVAS_HEIGHT + 30) {
            powerUps.splice(i, 1);
        }
    }
}

// Update player position
function updatePlayer() {
    if (autoGuide && blocks.length > 0) {
        // Find the closest block and guide towards it
        let closestBlock = null;
        let minDistance = Infinity;
        
        for (const block of blocks) {
            if (block.y > CANVAS_HEIGHT / 2) {
                const distance = Math.abs(block.x - player.x);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestBlock = block;
                }
            }
        }
        
        if (closestBlock) {
            const targetX = closestBlock.x - PLAYER_WIDTH / 2 + BLOCK_SIZE / 2;
            if (player.x < targetX - 5) {
                player.x += player.speed;
            } else if (player.x > targetX + 5) {
                player.x -= player.speed;
            }
        }
    }
    
    // Keep player within bounds
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_WIDTH, player.x));
}

// Check collisions
function checkCollisions() {
    // Check block-zone collisions
    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];
        
        for (const zone of zones) {
            if (block.y + BLOCK_SIZE >= zone.y && 
                block.y <= zone.y + zone.height &&
                block.x + BLOCK_SIZE >= zone.x && 
                block.x <= zone.x + zone.width) {
                
                if (block.color === zone.color) {
                    // Correct match
                    score += 10 * (1 + combo * 0.5);
                    combo++;
                    createParticles(block.x + BLOCK_SIZE / 2, block.y + BLOCK_SIZE / 2, block.color);
                    blocks.splice(i, 1);
                    break;
                } else {
                    // Wrong match
                    if (!shield) {
                        loseLife();
                    }
                    combo = 0;
                    blocks.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    // Check player-powerup collisions
    for (let i = powerUps.length - 1; i >= 0; i--) {
        const powerUp = powerUps[i];
        
        if (player.x < powerUp.x + 30 && 
            player.x + PLAYER_WIDTH > powerUp.x &&
            player.y < powerUp.y + 30 && 
            player.y + PLAYER_HEIGHT > powerUp.y) {
            
            activatePowerUp(powerUp.type);
            powerUps.splice(i, 1);
        }
    }
}

// Spawn new blocks
function spawnBlocks() {
    if (Math.random() < 0.02 + level * 0.005) {
        const colors = Object.keys(COLORS);
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomX = Math.random() * (CANVAS_WIDTH - BLOCK_SIZE);
        
        blocks.push({
            x: randomX,
            y: -BLOCK_SIZE,
            width: BLOCK_SIZE,
            height: BLOCK_SIZE,
            color: randomColor
        });
    }
    
    // Spawn power-ups occasionally
    if (Math.random() < 0.001) {
        const powerUpTypes = ['slowMotion', 'autoGuide', 'shield'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        const randomX = Math.random() * (CANVAS_WIDTH - 30);
        
        powerUps.push({
            x: randomX,
            y: -30,
            width: 30,
            height: 30,
            type: randomType
        });
    }
}

// Create particle effects
function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: color
        });
    }
}

// Activate power-up
function activatePowerUp(type) {
    switch (type) {
        case 'slowMotion':
            slowMotion = true;
            powerUpTimer = 300; // 5 seconds at 60fps
            break;
        case 'autoGuide':
            autoGuide = true;
            powerUpTimer = 300;
            break;
        case 'shield':
            shield = true;
            powerUpTimer = 300;
            break;
    }
}

// Update power-up timers
function updatePowerUpTimers() {
    if (powerUpTimer > 0) {
        powerUpTimer--;
        if (powerUpTimer === 0) {
            slowMotion = false;
            autoGuide = false;
            shield = false;
        }
    }
}

// Lose a life
function loseLife() {
    lives--;
    combo = 0;
    
    if (lives <= 0) {
        gameOver();
    }
    
    updateDisplay();
}

// Game over
function gameOver() {
    gameRunning = false;
    
    if (score > highScore) {
        highScore = score;
        saveHighScore();
    }
    
    document.getElementById('gameOverlay').classList.add('active');
}

// Render everything
function render() {
    // Clear canvas
    ctx.fillStyle = '#1a252f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw zones
    drawZones();
    
    // Draw blocks
    drawBlocks();
    
    // Draw player
    drawPlayer();
    
    // Draw particles
    drawParticles();
    
    // Draw power-ups
    drawPowerUps();
    
    // Draw power-up effects
    if (shield) {
        drawShield();
    }
}

// Draw color zones
function drawZones() {
    zones.forEach(zone => {
        ctx.fillStyle = COLORS[zone.color];
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        
        // Add glow effect
        ctx.shadowColor = COLORS[zone.color];
        ctx.shadowBlur = 10;
        ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
        ctx.shadowBlur = 0;
        
        // Add border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    });
}

// Draw falling blocks
function drawBlocks() {
    blocks.forEach(block => {
        ctx.fillStyle = COLORS[block.color];
        ctx.fillRect(block.x, block.y, block.width, block.height);
        
        // Add 3D effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(block.x, block.y, block.width, 3);
        ctx.fillRect(block.x, block.y, 3, block.height);
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(block.x + block.width - 3, block.y, 3, block.height);
        ctx.fillRect(block.x, block.y + block.height - 3, block.width, 3);
    });
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = shield ? '#f39c12' : '#ecf0f1';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Add glow effect
    ctx.shadowColor = shield ? '#f39c12' : '#ecf0f1';
    ctx.shadowBlur = 10;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;
    
    // Add border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x, player.y, player.width, player.height);
}

// Draw particles
function drawParticles() {
    particles.forEach(particle => {
        ctx.fillStyle = COLORS[particle.color];
        ctx.globalAlpha = particle.life / 30;
        ctx.fillRect(particle.x, particle.y, 4, 4);
        ctx.globalAlpha = 1;
    });
}

// Draw power-ups
function drawPowerUps() {
    powerUps.forEach(powerUp => {
        const icons = {
            slowMotion: '⚡',
            autoGuide: '🎯',
            shield: '💎'
        };
        
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(icons[powerUp.type], powerUp.x + 15, powerUp.y + 20);
    });
}

// Draw shield effect
function drawShield() {
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(player.x + PLAYER_WIDTH / 2, player.y + PLAYER_HEIGHT / 2, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('level').textContent = level;
    document.getElementById('lives').textContent = lives;
    document.getElementById('combo').textContent = combo;
    document.getElementById('highScore').textContent = highScore;
    
    // Level up every 100 points
    const newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
        level = newLevel;
    }
}

// Toggle pause
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (gamePaused) {
        pauseBtn.textContent = '▶️ Resume';
        document.getElementById('pauseOverlay').classList.add('active');
    } else {
        pauseBtn.textContent = '⏸️ Pause';
        document.getElementById('pauseOverlay').classList.remove('active');
    }
}

// Restart game
function restartGame() {
    document.getElementById('gameOverlay').classList.remove('active');
    document.getElementById('pauseOverlay').classList.remove('active');
    document.getElementById('pauseBtn').textContent = '⏸️ Pause';
    
    startGame();
}

// Save high score
function saveHighScore() {
    localStorage.setItem('colorBurstHighScore', highScore);
}

// Load high score
function loadHighScore() {
    const saved = localStorage.getItem('colorBurstHighScore');
    highScore = saved ? parseInt(saved) : 0;
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (!gameRunning || gamePaused) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                player.x -= player.speed;
                break;
            case 'ArrowRight':
                player.x += player.speed;
                break;
            case ' ':
                e.preventDefault();
                togglePause();
                break;
        }
    });
    
    // Touch controls
    let startX = 0;
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startX = touch.clientX;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!gameRunning || gamePaused) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - startX;
        const rect = canvas.getBoundingClientRect();
        const canvasX = touch.clientX - rect.left;
        
        player.x = canvasX - PLAYER_WIDTH / 2;
        startX = touch.clientX;
    });
    
    // Prevent context menu
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
}

// Initialize the game when the page loads
window.addEventListener('load', initGame);
