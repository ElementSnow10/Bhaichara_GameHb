class RacingBikeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.startScreen = document.getElementById('startScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        
        // Game state
        this.gameRunning = false;
        this.gameOver = false;
        this.score = 0;
        this.distance = 0;
        this.speed = 0;
        this.maxSpeed = 200;
        this.acceleration = 0.5;
        this.deceleration = 0.3;
        
        // Bike properties
        this.bike = {
            x: 100,
            y: 400,
            width: 60,
            height: 30,
            velocityY: 0,
            onGround: true,
            leanAngle: 0,
            boost: 100,
            maxBoost: 100
        };
        
        // Game objects
        this.obstacles = [];
        this.fuelCans = [];
        this.particles = [];
        this.backgroundLayers = [];
        
        // Game settings
        this.gravity = 0.8;
        this.groundLevel = 450;
        this.obstacleSpeed = 3;
        this.spawnRate = 0.02;
        this.fuelSpawnRate = 0.005;
        
        // Input handling
        this.keys = {};
        this.setupEventListeners();
        this.setupBackgroundLayers();
        
        // Start the game loop
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            if (y < this.canvas.height / 2) {
                this.keys['ArrowUp'] = true;
            } else if (y > this.canvas.height / 2) {
                this.keys['ArrowDown'] = true;
            }
            
            if (x < this.canvas.width / 2) {
                this.keys['ArrowLeft'] = true;
            } else if (x > this.canvas.width / 2) {
                this.keys['ArrowRight'] = true;
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.keys['ArrowUp'] = false;
            this.keys['ArrowDown'] = false;
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
        });
    }
    
    setupBackgroundLayers() {
        // Create parallax background layers
        for (let i = 0; i < 3; i++) {
            this.backgroundLayers.push({
                x: 0,
                speed: (i + 1) * 0.5,
                elements: this.generateBackgroundElements(i)
            });
        }
    }
    
    generateBackgroundElements(layerIndex) {
        const elements = [];
        const count = 10 + layerIndex * 5;
        
        for (let i = 0; i < count; i++) {
            elements.push({
                x: Math.random() * this.canvas.width * 2,
                y: Math.random() * this.canvas.height,
                width: 20 + Math.random() * 80,
                height: 20 + Math.random() * 60,
                type: layerIndex === 0 ? 'building' : layerIndex === 1 ? 'tree' : 'cloud'
            });
        }
        
        return elements;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameOver = false;
        this.score = 0;
        this.distance = 0;
        this.speed = 0;
        this.bike.boost = this.bike.maxBoost;
        this.obstacles = [];
        this.fuelCans = [];
        this.particles = [];
        this.gameOverlay.style.display = 'none';
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalDistance').textContent = this.distance;
        this.gameOverScreen.style.display = 'block';
        this.startScreen.style.display = 'none';
        this.gameOverlay.style.display = 'flex';
    }
    
    updateBike() {
        // Handle input
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            if (this.bike.onGround) {
                this.bike.velocityY = -15;
                this.bike.onGround = false;
            }
        }
        
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.bike.velocityY += 0.5;
        }
        
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.bike.x = Math.max(50, this.bike.x - 5);
            this.bike.leanAngle = -15;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.bike.x = Math.min(this.canvas.width - 110, this.bike.x + 5);
            this.bike.leanAngle = 15;
        } else {
            this.bike.leanAngle *= 0.9;
        }
        
        // Boost
        if ((this.keys['Space'] || this.keys['KeyW']) && this.bike.boost > 0) {
            this.speed = Math.min(this.maxSpeed, this.speed + this.acceleration * 2);
            this.bike.boost = Math.max(0, this.bike.boost - 0.5);
            this.createBoostParticles();
        } else {
            this.speed = Math.max(0, this.speed - this.deceleration);
        }
        
        // Apply physics
        if (!this.bike.onGround) {
            this.bike.velocityY += this.gravity;
        }
        
        this.bike.y += this.bike.velocityY;
        
        // Ground collision
        if (this.bike.y >= this.groundLevel) {
            this.bike.y = this.groundLevel;
            this.bike.velocityY = 0;
            this.bike.onGround = true;
        }
        
        // Boost regeneration
        if (this.bike.boost < this.bike.maxBoost) {
            this.bike.boost += 0.1;
        }
    }
    
    updateObstacles() {
        // Spawn obstacles
        if (Math.random() < this.spawnRate) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.groundLevel - Math.random() * 100,
                width: 30 + Math.random() * 40,
                height: 30 + Math.random() * 70,
                type: Math.random() < 0.3 ? 'barrier' : 'rock'
            });
        }
        
        // Spawn fuel cans
        if (Math.random() < this.fuelSpawnRate) {
            this.fuelCans.push({
                x: this.canvas.width,
                y: this.groundLevel - 50 - Math.random() * 200,
                width: 20,
                height: 30,
                collected: false
            });
        }
        
        // Update obstacles
        this.obstacles.forEach((obstacle, index) => {
            obstacle.x -= this.obstacleSpeed + this.speed * 0.1;
            
            // Remove off-screen obstacles
            if (obstacle.x + obstacle.width < 0) {
                this.obstacles.splice(index, 1);
                this.score += 10;
            }
        });
        
        // Update fuel cans
        this.fuelCans.forEach((fuel, index) => {
            fuel.x -= this.obstacleSpeed + this.speed * 0.1;
            
            // Remove off-screen fuel
            if (fuel.x + fuel.width < 0) {
                this.fuelCans.splice(index, 1);
            }
        });
    }
    
    checkCollisions() {
        // Obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(this.bike, obstacle)) {
                this.gameOver();
            }
        });
        
        // Fuel collection
        this.fuelCans.forEach((fuel, index) => {
            if (!fuel.collected && this.isColliding(this.bike, fuel)) {
                fuel.collected = true;
                this.bike.boost = Math.min(this.bike.maxBoost, this.bike.boost + 30);
                this.score += 50;
                this.createFuelParticles(fuel.x, fuel.y);
                this.fuelCans.splice(index, 1);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    createBoostParticles() {
        for (let i = 0; i < 3; i++) {
            this.particles.push({
                x: this.bike.x + this.bike.width,
                y: this.bike.y + this.bike.height / 2,
                vx: -Math.random() * 3 - 2,
                vy: (Math.random() - 0.5) * 2,
                life: 20,
                color: '#ff6b6b'
            });
        }
    }
    
    createFuelParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + Math.random() * 20,
                y: y + Math.random() * 30,
                vx: (Math.random() - 0.5) * 4,
                vy: -Math.random() * 3 - 2,
                life: 30,
                color: '#4ecdc4'
            });
        }
    }
    
    updateBackground() {
        this.backgroundLayers.forEach(layer => {
            layer.x -= layer.speed;
            if (layer.x <= -this.canvas.width) {
                layer.x = 0;
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw ground
        this.drawGround();
        
        // Draw obstacles
        this.drawObstacles();
        
        // Draw fuel cans
        this.drawFuelCans();
        
        // Draw bike
        this.drawBike();
        
        // Draw particles
        this.drawParticles();
        
        // Draw UI
        this.drawUI();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background elements
        this.backgroundLayers.forEach(layer => {
            layer.elements.forEach(element => {
                this.ctx.save();
                this.ctx.translate(element.x + layer.x, element.y);
                
                if (element.type === 'building') {
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.fillRect(0, 0, element.width, element.height);
                    // Windows
                    this.ctx.fillStyle = '#f39c12';
                    for (let i = 0; i < element.width; i += 15) {
                        for (let j = 0; j < element.height; j += 20) {
                            this.ctx.fillRect(i + 5, j + 5, 8, 8);
                        }
                    }
                } else if (element.type === 'tree') {
                    this.ctx.fillStyle = '#27ae60';
                    this.ctx.beginPath();
                    this.ctx.arc(element.width/2, element.height/2, element.width/2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.fillStyle = '#8B4513';
                    this.ctx.fillRect(element.width/2 - 5, element.height/2, 10, element.height/2);
                } else if (element.type === 'cloud') {
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    this.ctx.beginPath();
                    this.ctx.arc(element.width/2, element.height/2, element.width/3, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.restore();
            });
        });
    }
    
    drawGround() {
        // Ground
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundLevel, this.canvas.width, this.canvas.height - this.groundLevel);
        
        // Road lines
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 20]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundLevel + 10);
        this.ctx.lineTo(this.canvas.width, this.groundLevel + 10);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'barrier') {
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                // Warning stripes
                this.ctx.fillStyle = '#ffffff';
                for (let i = 0; i < obstacle.width; i += 10) {
                    this.ctx.fillRect(obstacle.x + i, obstacle.y, 5, obstacle.height);
                }
            } else {
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    }
    
    drawFuelCans() {
        this.fuelCans.forEach(fuel => {
            if (!fuel.collected) {
                // Fuel can body
                this.ctx.fillStyle = '#f39c12';
                this.ctx.fillRect(fuel.x, fuel.y, fuel.width, fuel.height);
                
                // Fuel can top
                this.ctx.fillStyle = '#e67e22';
                this.ctx.fillRect(fuel.x - 2, fuel.y - 5, fuel.width + 4, 5);
                
                // Fuel symbol
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText('⛽', fuel.x + 5, fuel.y + 20);
            }
        });
    }
    
    drawBike() {
        this.ctx.save();
        this.ctx.translate(this.bike.x + this.bike.width/2, this.bike.y + this.bike.height/2);
        this.ctx.rotate(this.bike.leanAngle * Math.PI / 180);
        
        // Bike body
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(-this.bike.width/2, -this.bike.height/2, this.bike.width, this.bike.height);
        
        // Bike details
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(-this.bike.width/2 + 5, -this.bike.height/2 + 5, this.bike.width - 10, this.bike.height - 10);
        
        // Wheels
        this.ctx.fillStyle = '#34495e';
        this.ctx.beginPath();
        this.ctx.arc(-this.bike.width/2 + 10, this.bike.height/2 + 5, 8, 0, Math.PI * 2);
        this.ctx.arc(this.bike.width/2 - 10, this.bike.height/2 + 5, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Handlebar
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(-this.bike.width/2, -this.bike.height/2 - 5);
        this.ctx.lineTo(this.bike.width/2, -this.bike.height/2 - 5);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Boost effect
        if (this.bike.boost < this.bike.maxBoost) {
            this.ctx.fillStyle = `rgba(255, 107, 107, ${0.3 + (this.bike.boost / this.bike.maxBoost) * 0.4})`;
            this.ctx.fillRect(this.bike.x - 10, this.bike.y - 10, this.bike.width + 20, this.bike.height + 20);
        }
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    drawUI() {
        // Boost bar
        const boostBarWidth = 200;
        const boostBarHeight = 20;
        const boostBarX = 20;
        const boostBarY = 20;
        
        // Background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(boostBarX, boostBarY, boostBarWidth, boostBarHeight);
        
        // Boost level
        const boostPercentage = this.bike.boost / this.bike.maxBoost;
        this.ctx.fillStyle = boostPercentage > 0.5 ? '#4ecdc4' : boostPercentage > 0.2 ? '#f39c12' : '#e74c3c';
        this.ctx.fillRect(boostBarX, boostBarY, boostBarWidth * boostPercentage, boostBarHeight);
        
        // Border
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(boostBarX, boostBarY, boostBarWidth, boostBarHeight);
        
        // Text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('BOOST', boostBarX + 5, boostBarY + 15);
    }
    
    update() {
        if (!this.gameRunning) return;
        
        this.updateBike();
        this.updateObstacles();
        this.checkCollisions();
        this.updateParticles();
        this.updateBackground();
        
        // Update game stats
        this.distance += this.speed * 0.1;
        this.score += this.speed * 0.01;
        
        // Update UI
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('distance').textContent = Math.floor(this.distance);
        document.getElementById('speed').textContent = Math.floor(this.speed);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new RacingBikeGame();
});
