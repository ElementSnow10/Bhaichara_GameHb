class RedBallGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'playing';
        this.currentLevel = 1;
        this.score = 0;
        this.maxLevel = 5;
        
        // Player ball
        this.ball = {
            x: 50,
            y: this.height - 100,
            radius: 15,
            velocityX: 0,
            velocityY: 0,
            speed: 5,
            gravity: 0.5,
            friction: 0.8,
            jumpPower: -12,
            onGround: false
        };
        
        // Game objects
        this.platforms = [];
        this.obstacles = [];
        this.coins = [];
        this.goal = null;
        
        // Input handling
        this.keys = {};
        
        // UI elements
        this.currentLevelDisplay = document.getElementById('currentLevel');
        this.scoreDisplay = document.getElementById('score');
        this.restartBtn = document.getElementById('restartBtn');
        this.nextLevelBtn = document.getElementById('nextLevelBtn');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.nextLevelOverlayBtn = document.getElementById('nextLevelOverlayBtn');
        
        this.setupEventListeners();
        this.loadLevel(this.currentLevel);
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button events
        this.restartBtn.addEventListener('click', () => this.restartLevel());
        this.nextLevelBtn.addEventListener('click', () => this.nextLevel());
        this.playAgainBtn.addEventListener('click', () => this.restartLevel());
        this.nextLevelOverlayBtn.addEventListener('click', () => this.nextLevel());
    }
    
    loadLevel(level) {
        this.currentLevel = level;
        this.currentLevelDisplay.textContent = level;
        this.gameState = 'playing';
        this.hideOverlay();
        
        // Reset ball position
        this.ball.x = 50;
        this.ball.y = this.height - 100;
        this.ball.velocityX = 0;
        this.ball.velocityY = 0;
        
        // Clear arrays
        this.platforms = [];
        this.obstacles = [];
        this.coins = [];
        
        // Create level-specific content
        this.createLevel(level);
    }
    
    createLevel(level) {
        // Ground platform
        this.platforms.push({
            x: 0,
            y: this.height - 20,
            width: this.width,
            height: 20,
            type: 'ground'
        });
        
        // Level-specific layouts
        switch(level) {
            case 1:
                this.createLevel1();
                break;
            case 2:
                this.createLevel2();
                break;
            case 3:
                this.createLevel3();
                break;
            case 4:
                this.createLevel4();
                break;
            case 5:
                this.createLevel5();
                break;
        }
        
        // Add goal
        this.goal = {
            x: this.width - 80,
            y: this.height - 60,
            width: 40,
            height: 40,
            type: 'goal'
        };
    }
    
    createLevel1() {
        // Simple level with a few platforms and coins
        this.platforms.push(
            { x: 200, y: this.height - 120, width: 100, height: 20, type: 'platform' },
            { x: 400, y: this.height - 180, width: 100, height: 20, type: 'platform' },
            { x: 600, y: this.height - 140, width: 100, height: 20, type: 'platform' }
        );
        
        this.coins.push(
            { x: 250, y: this.height - 150, radius: 8, collected: false },
            { x: 450, y: this.height - 210, radius: 8, collected: false },
            { x: 650, y: this.height - 170, radius: 8, collected: false }
        );
    }
    
    createLevel2() {
        // More challenging with obstacles
        this.platforms.push(
            { x: 150, y: this.height - 100, width: 80, height: 20, type: 'platform' },
            { x: 350, y: this.height - 160, width: 80, height: 20, type: 'platform' },
            { x: 550, y: this.height - 120, width: 80, height: 20, type: 'platform' }
        );
        
        this.obstacles.push(
            { x: 300, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 500, y: this.height - 40, width: 20, height: 40, type: 'spike' }
        );
        
        this.coins.push(
            { x: 190, y: this.height - 130, radius: 8, collected: false },
            { x: 390, y: this.height - 190, radius: 8, collected: false },
            { x: 590, y: this.height - 150, radius: 8, collected: false }
        );
    }
    
    createLevel3() {
        // Moving platforms and more obstacles
        this.platforms.push(
            { x: 100, y: this.height - 120, width: 80, height: 20, type: 'platform' },
            { x: 300, y: this.height - 180, width: 80, height: 20, type: 'platform' },
            { x: 500, y: this.height - 140, width: 80, height: 20, type: 'platform' },
            { x: 700, y: this.height - 200, width: 80, height: 20, type: 'platform' }
        );
        
        this.obstacles.push(
            { x: 250, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 450, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 650, y: this.height - 40, width: 20, height: 40, type: 'spike' }
        );
        
        this.coins.push(
            { x: 140, y: this.height - 150, radius: 8, collected: false },
            { x: 340, y: this.height - 210, radius: 8, collected: false },
            { x: 540, y: this.height - 170, radius: 8, collected: false },
            { x: 740, y: this.height - 230, radius: 8, collected: false }
        );
    }
    
    createLevel4() {
        // Complex layout with narrow platforms
        this.platforms.push(
            { x: 120, y: this.height - 100, width: 60, height: 20, type: 'platform' },
            { x: 280, y: this.height - 160, width: 60, height: 20, type: 'platform' },
            { x: 440, y: this.height - 120, width: 60, height: 20, type: 'platform' },
            { x: 600, y: this.height - 180, width: 60, height: 20, type: 'platform' },
            { x: 760, y: this.height - 140, width: 60, height: 20, type: 'platform' }
        );
        
        this.obstacles.push(
            { x: 200, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 360, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 520, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 680, y: this.height - 40, width: 20, height: 40, type: 'spike' }
        );
        
        this.coins.push(
            { x: 150, y: this.height - 130, radius: 8, collected: false },
            { x: 310, y: this.height - 190, radius: 8, collected: false },
            { x: 470, y: this.height - 150, radius: 8, collected: false },
            { x: 630, y: this.height - 210, radius: 8, collected: false },
            { x: 790, y: this.height - 170, radius: 8, collected: false }
        );
    }
    
    createLevel5() {
        // Final challenging level
        this.platforms.push(
            { x: 80, y: this.height - 120, width: 70, height: 20, type: 'platform' },
            { x: 220, y: this.height - 180, width: 70, height: 20, type: 'platform' },
            { x: 360, y: this.height - 140, width: 70, height: 20, type: 'platform' },
            { x: 500, y: this.height - 200, width: 70, height: 20, type: 'platform' },
            { x: 640, y: this.height - 160, width: 70, height: 20, type: 'platform' },
            { x: 780, y: this.height - 120, width: 70, height: 20, type: 'platform' }
        );
        
        this.obstacles.push(
            { x: 160, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 300, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 440, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 580, y: this.height - 40, width: 20, height: 40, type: 'spike' },
            { x: 720, y: this.height - 40, width: 20, height: 40, type: 'spike' }
        );
        
        this.coins.push(
            { x: 115, y: this.height - 150, radius: 8, collected: false },
            { x: 255, y: this.height - 210, radius: 8, collected: false },
            { x: 395, y: this.height - 170, radius: 8, collected: false },
            { x: 535, y: this.height - 230, radius: 8, collected: false },
            { x: 675, y: this.height - 190, radius: 8, collected: false },
            { x: 815, y: this.height - 150, radius: 8, collected: false }
        );
    }
    
    handleInput() {
        // Horizontal movement
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.ball.velocityX = -this.ball.speed;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.ball.velocityX = this.ball.speed;
        } else {
            this.ball.velocityX *= this.ball.friction;
        }
        
        // Jumping
        if ((this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space']) && this.ball.onGround) {
            this.ball.velocityY = this.ball.jumpPower;
            this.ball.onGround = false;
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleInput();
        
        // Apply gravity
        this.ball.velocityY += this.ball.gravity;
        
        // Update position
        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;
        
        // Check collisions
        this.checkCollisions();
        
        // Check if ball fell off screen
        if (this.ball.y > this.height + 50) {
            this.restartLevel();
        }
        
        // Check if reached goal
        if (this.checkGoalCollision()) {
            this.levelComplete();
        }
    }
    
    checkCollisions() {
        this.ball.onGround = false;
        
        // Platform collisions
        for (let platform of this.platforms) {
            if (this.checkCollision(this.ball, platform)) {
                if (this.ball.velocityY > 0) {
                    // Landing on top
                    this.ball.y = platform.y - this.ball.radius;
                    this.ball.velocityY = 0;
                    this.ball.onGround = true;
                } else if (this.ball.velocityY < 0) {
                    // Hitting from below
                    this.ball.y = platform.y + platform.height + this.ball.radius;
                    this.ball.velocityY = 0;
                }
            }
        }
        
        // Obstacle collisions
        for (let obstacle of this.obstacles) {
            if (this.checkCollision(this.ball, obstacle)) {
                this.restartLevel();
                return;
            }
        }
        
        // Coin collisions
        for (let coin of this.coins) {
            if (!coin.collected && this.checkCoinCollision(this.ball, coin)) {
                coin.collected = true;
                this.score += 10;
                this.scoreDisplay.textContent = this.score;
            }
        }
        
        // Wall collisions
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.velocityX = 0;
        }
        if (this.ball.x + this.ball.radius > this.width) {
            this.ball.x = this.width - this.ball.radius;
            this.ball.velocityX = 0;
        }
    }
    
    checkCollision(ball, object) {
        return ball.x + ball.radius > object.x &&
               ball.x - ball.radius < object.x + object.width &&
               ball.y + ball.radius > object.y &&
               ball.y - ball.radius < object.y + object.height;
    }
    
    checkCoinCollision(ball, coin) {
        const dx = ball.x - coin.x;
        const dy = ball.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < ball.radius + coin.radius;
    }
    
    checkGoalCollision() {
        return this.checkCollision(this.ball, this.goal);
    }
    
    levelComplete() {
        this.gameState = 'complete';
        this.score += 50; // Bonus for completing level
        this.scoreDisplay.textContent = this.score;
        
        if (this.currentLevel < this.maxLevel) {
            this.showOverlay('Level Complete!', `Great job! You completed level ${this.currentLevel}.`, true);
        } else {
            this.showOverlay('Game Complete!', `Congratulations! You've completed all levels with a score of ${this.score}!`, false);
        }
    }
    
    showOverlay(title, message, showNextLevel) {
        this.overlayTitle.textContent = title;
        this.overlayMessage.textContent = message;
        this.gameOverlay.style.display = 'flex';
        this.nextLevelOverlayBtn.style.display = showNextLevel ? 'inline-block' : 'none';
    }
    
    hideOverlay() {
        this.gameOverlay.style.display = 'none';
    }
    
    nextLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.loadLevel(this.currentLevel + 1);
        }
    }
    
    restartLevel() {
        this.loadLevel(this.currentLevel);
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw platforms
        this.ctx.fillStyle = '#8B4513';
        for (let platform of this.platforms) {
            this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        }
        
        // Draw obstacles
        this.ctx.fillStyle = '#FF0000';
        for (let obstacle of this.obstacles) {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
        
        // Draw coins
        this.ctx.fillStyle = '#FFD700';
        for (let coin of this.coins) {
            if (!coin.collected) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Coin shine effect
                this.ctx.fillStyle = '#FFF';
                this.ctx.beginPath();
                this.ctx.arc(coin.x - 2, coin.y - 2, 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.fillStyle = '#FFD700';
            }
        }
        
        // Draw goal
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
        
        // Draw ball
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ball shine effect
        this.ctx.fillStyle = '#FF6666';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x - 3, this.ball.y - 3, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RedBallGame();
});
