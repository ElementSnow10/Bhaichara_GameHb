// User Management System
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('flappyBirdUsers')) || {};
        this.currentUser = null;
        this.leaderboard = JSON.parse(localStorage.getItem('flappyBirdLeaderboard')) || [];
    }

    register(username, password) {
        if (this.users[username]) {
            return { success: false, message: 'Username already exists!' };
        }
        
        if (username.length < 3) {
            return { success: false, message: 'Username must be at least 3 characters!' };
        }
        
        if (password.length < 4) {
            return { success: false, message: 'Password must be at least 4 characters!' };
        }

        this.users[username] = {
            password: password,
            bestScore: 0,
            gamesPlayed: 0,
            totalScore: 0,
            createdAt: new Date().toISOString()
        };
        
        this.saveUsers();
        return { success: true, message: 'Registration successful! Please login.' };
    }

    login(username, password) {
        if (!this.users[username]) {
            return { success: false, message: 'Username not found!' };
        }
        
        if (this.users[username].password !== password) {
            return { success: false, message: 'Incorrect password!' };
        }

        this.currentUser = username;
        localStorage.setItem('flappyBirdCurrentUser', username);
        return { success: true, message: 'Login successful!' };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('flappyBirdCurrentUser');
    }

    async updateScore(score) {
        if (!this.currentUser) return;
        
        const user = this.users[this.currentUser];
        user.gamesPlayed++;
        user.totalScore += score*score;
        
        if (score > user.bestScore) {
            user.bestScore = score;
            this.updateLeaderboard(this.currentUser, score);
            try {
                if (window.globalLeaderboardService) {
                    await window.globalLeaderboardService.submitScore(this.currentUser, score);
                }
            } catch (_) {}
        }
        
        this.saveUsers();
    }

    updateLeaderboard(username, score) {
        this.leaderboard = this.leaderboard.filter(entry => entry.username !== username);
        
        this.leaderboard.push({
            username: username,
            score: score,
            date: new Date().toISOString()
        });
        
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 100);
        
        localStorage.setItem('flappyBirdLeaderboard', JSON.stringify(this.leaderboard));
    }

    getCurrentUserBestScore() {
        if (!this.currentUser) return 0;
        return this.users[this.currentUser].bestScore;
    }

    getLeaderboard(type = 'global') {
        if (type === 'personal' && this.currentUser) {
            return this.leaderboard.filter(entry => entry.username === this.currentUser);
        }
        return this.leaderboard;
    }

    saveUsers() {
        localStorage.setItem('flappyBirdUsers', JSON.stringify(this.users));
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Global Leaderboard Backend (Firestore)
class GlobalLeaderboardService {
    constructor(firestore) {
        this.db = firestore;
        this.collectionName = 'flappyBirdGlobalScores';
    }

    async submitScore(username, score) {
        if (!username || typeof score !== 'number') return;
        const docRef = this.db.collection(this.collectionName).doc(username);
        await this.db.runTransaction(async (tx) => {
            const doc = await tx.get(docRef);
            if (!doc.exists) {
                tx.set(docRef, {
                    username: username,
                    bestScore: score,
                    updatedAt: Date.now(),
                });
            } else {
                const current = doc.data();
                const newBest = Math.max(current.bestScore || 0, score);
                if (newBest !== (current.bestScore || 0)) {
                    tx.update(docRef, { bestScore: newBest, updatedAt: Date.now() });
                } else {
                    tx.update(docRef, { updatedAt: Date.now() });
                }
            }
        });
    }

    async fetchTopScores(limit = 100) {
        const snapshot = await this.db
            .collection(this.collectionName)
            .orderBy('bestScore', 'desc')
            .limit(limit)
            .get();
        const results = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            results.push({ username: data.username, score: data.bestScore });
        });
        return results;
    }
}

// Leaderboard Manager
class LeaderboardManager {
    constructor(userManager) {
        this.userManager = userManager;
        this.modal = document.getElementById('leaderboardModal');
        this.list = document.getElementById('leaderboardList');
        this.tabs = document.querySelectorAll('.tab-btn');
        this.currentTab = 'global';
        
        this.setupEventListeners();
        this.globalEntries = [];
        this.isUsingGlobal = false;
    }

    setupEventListeners() {
        const openBtn = document.getElementById('leaderboardBtn');
        const closeBtn = document.getElementById('closeLeaderboard');

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                this.showLeaderboard();
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideLeaderboard();
            });
        }

        if (this.tabs && this.tabs.length) {
            this.tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    this.switchTab(tab.dataset.tab);
                });
            });
        }

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.hideLeaderboard();
                }
            });
        }
    }

    async showLeaderboard() {
        if (this.modal) {
            this.modal.style.display = 'flex';
        }
        await this.refreshFromBackendIfAvailable();
        this.updateLeaderboard();
    }

    hideLeaderboard() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    async switchTab(tab) {
        this.currentTab = tab;
        this.tabs.forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`[data-tab="${tab}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        await this.refreshFromBackendIfAvailable();
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        const entries = this.isUsingGlobal && this.currentTab === 'global'
            ? this.globalEntries
            : this.userManager.getLeaderboard(this.currentTab);
        const currentUser = this.userManager.getCurrentUser();
        
        this.list.innerHTML = '';
        
        if (entries.length === 0) {
            this.list.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No scores yet!</p>';
            return;
        }

        entries.forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = 'leaderboard-entry';
            if (entry.username === currentUser) {
                entryElement.classList.add('current-user');
            }

            const rank = document.createElement('div');
            rank.className = 'rank';
            rank.textContent = `#${index + 1}`;

            const username = document.createElement('div');
            username.className = 'username';
            username.textContent = entry.username;

            const score = document.createElement('div');
            score.className = 'score-value';
            score.textContent = entry.score;

            entryElement.appendChild(rank);
            entryElement.appendChild(username);
            entryElement.appendChild(score);
            this.list.appendChild(entryElement);
        });
    }

    async refreshFromBackendIfAvailable() {
        try {
            if (window.globalLeaderboardService && this.currentTab === 'global') {
                this.isUsingGlobal = true;
                this.globalEntries = await window.globalLeaderboardService.fetchTopScores(100);
            } else {
                this.isUsingGlobal = false;
            }
        } catch (_) {
            this.isUsingGlobal = false;
        }
    }
}

// Login Manager
class LoginManager {
    constructor(userManager, game) {
        this.userManager = userManager;
        this.game = game;
        this.loginScreen = document.getElementById('loginScreen');
        this.gameContainer = document.getElementById('gameContainer');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.registerBtn = document.getElementById('registerBtn');
        this.loginMessage = document.getElementById('loginMessage');
        this.currentUserSpan = document.getElementById('currentUser');
        this.logoutBtn = document.getElementById('logoutBtn');
        
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    setupEventListeners() {
        this.loginBtn.addEventListener('click', () => this.handleLogin());
        this.registerBtn.addEventListener('click', () => this.handleRegister());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());

        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.passwordInput.focus();
            }
        });
    }

    handleLogin() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        if (!username || !password) {
            this.showMessage('Please enter both username and password!', 'error');
            return;
        }

        const result = this.userManager.login(username, password);
        this.showMessage(result.message, result.success ? 'success' : 'error');

        if (result.success) {
            setTimeout(() => {
                this.showGame();
            }, 1000);
        }
    }

    handleRegister() {
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        if (!username || !password) {
            this.showMessage('Please enter both username and password!', 'error');
            return;
        }

        const result = this.userManager.register(username, password);
        this.showMessage(result.message, result.success ? 'success' : 'error');

        if (result.success) {
            this.usernameInput.value = '';
            this.passwordInput.value = '';
        }
    }

    handleLogout() {
        this.userManager.logout();
        this.showLogin();
    }

    showMessage(message, type) {
        this.loginMessage.textContent = message;
        this.loginMessage.className = `login-message ${type}`;
    }

    showGame() {
        this.loginScreen.style.display = 'none';
        this.gameContainer.style.display = 'block';
        this.currentUserSpan.textContent = this.userManager.getCurrentUser();
        // Ensure UI is in a good state after login and start playing
        if (this.game && typeof this.game.updateBestScore === 'function') {
            this.game.updateBestScore();
        }
        if (this.game && typeof this.game.startGame === 'function') {
            this.game.startGame();
        }
        // Focus game area
        try {
            this.gameContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (_) {}
    }

    showLogin() {
        this.loginScreen.style.display = 'flex';
        this.gameContainer.style.display = 'none';
        this.usernameInput.value = '';
        this.passwordInput.value = '';
        this.loginMessage.textContent = '';
        this.loginMessage.className = 'login-message';
    }

    checkLoginStatus() {
        const savedUser = localStorage.getItem('flappyBirdCurrentUser');
        if (savedUser && this.userManager.users[savedUser]) {
            this.userManager.currentUser = savedUser;
            this.showGame();
        } else {
            this.showLogin();
        }
    }
}

// Main Game Class
class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'menu';
        this.score = 0;
        
        // Bird properties
        this.bird = {
            x: 150,
            y: this.height / 2,
            width: 40,
            height: 30,
            velocity: 0,
            gravity: 0.3,
            jumpPower: -5,
            rotation: 0
        };
        
        // Pipe properties
        this.pipes = [];
        this.pipeWidth = 80;
        this.pipeGap = 220;
        this.pipeSpacing = 320;
        this.pipeSpeed = 2.5;
        this.basePipeSpeed = 2.5;
        this.maxPipeSpeed = 8.0;
        this.speedIncreaseRate = 0.1;
        
        // Background elements
        this.clouds = [];
        this.groundY = this.height - 100;
        
        // Animation
        this.animationId = null;
        this.frameCount = 0;
        
        // UI elements
        this.scoreElement = document.getElementById('score');
        this.bestScoreElement = document.getElementById('best-score');
        this.finalScoreElement = document.getElementById('finalScore');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameOverElement = document.getElementById('gameOver');
        this.playAgainBtn = document.getElementById('playAgainBtn');

        // Initialize managers (after UI elements are ready)
        this.userManager = new UserManager();
        this.leaderboardManager = new LeaderboardManager(this.userManager);
        this.loginManager = new LoginManager(this.userManager, this);

        this.init();
    }
    
    init() {
        this.updateBestScore();
        this.createClouds();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState === 'playing') {
                e.preventDefault();
                this.jump();
            } else if (e.code === 'KeyR') {
                this.restart();
            }
        });
        
        if (this.canvas) {
            this.canvas.addEventListener('click', () => {
                if (this.gameState === 'playing') {
                    this.jump();
                }
            });
        }
        
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.startGame());
        if (this.restartBtn) this.restartBtn.addEventListener('click', () => this.restart());
        if (this.playAgainBtn) this.playAgainBtn.addEventListener('click', () => this.restart());
    }
    
    startGame() {
        if (!this.userManager.isLoggedIn()) {
            if (this.loginManager && typeof this.loginManager.showLogin === 'function') {
                this.loginManager.showLogin();
            } else {
                alert('Please login to play!');
            }
            return;
        }
        
        this.gameState = 'playing';
        this.score = 0;
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.pipeSpeed = this.basePipeSpeed;
        this.createInitialPipes();
        this.startBtn.style.display = 'none';
        this.restartBtn.style.display = 'inline-block';
        this.gameOverElement.style.display = 'none';
        this.updateScore();
    }
    
    restart() {
        this.gameState = 'menu';
        this.score = 0;
        this.bird.y = this.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipes = [];
        this.pipeSpeed = this.basePipeSpeed;
        this.startBtn.style.display = 'inline-block';
        this.restartBtn.style.display = 'none';
        this.gameOverElement.style.display = 'none';
        this.updateScore();
    }
    
    jump() {
        if (this.gameState === 'playing') {
            this.bird.velocity = this.bird.jumpPower;
            this.bird.rotation = -25;
        }
    }
    
    createClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: Math.random() * 200 + 50,
                width: Math.random() * 100 + 50,
                height: Math.random() * 40 + 20,
                speed: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    createInitialPipes() {
        for (let i = 0; i < 3; i++) {
            this.createPipe(this.width + i * this.pipeSpacing);
        }
    }
    
    createPipe(x) {
        const gapY = Math.random() * (this.height - this.pipeGap - 200) + 100;
        this.pipes.push({
            x: x,
            topHeight: gapY,
            bottomY: gapY + this.pipeGap,
            passed: false
        });
    }
    
    update() {
        this.frameCount++;
        
        if (this.gameState === 'playing') {
            // Increase speed based on score
            this.updateGameSpeed();
            
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;
            this.bird.rotation = Math.min(90, this.bird.rotation + 2);
            
            this.pipes.forEach(pipe => {
                pipe.x -= this.pipeSpeed;
                
                if (!pipe.passed && pipe.x + this.pipeWidth < this.bird.x) {
                    pipe.passed = true;
                    this.score++;
                    this.updateScore();
                }
            });
            
            this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > 0);
            
            if (this.pipes.length === 0 || 
                this.pipes[this.pipes.length - 1].x < this.width - this.pipeSpacing) {
                this.createPipe(this.width);
            }
            
            this.clouds.forEach(cloud => {
                cloud.x -= cloud.speed;
                if (cloud.x + cloud.width < 0) {
                    cloud.x = this.width;
                    cloud.y = Math.random() * 200 + 50;
                }
            });
            
            this.checkCollisions();
        }
    }
    
    updateGameSpeed() {
        // Increase pipe speed based on score
        const speedIncrease = this.score * this.speedIncreaseRate;
        this.pipeSpeed = Math.min(this.maxPipeSpeed, this.basePipeSpeed + speedIncrease);
        
        // Also increase cloud speed slightly for visual effect
        this.clouds.forEach(cloud => {
            cloud.speed = Math.min(2.0, 0.2 + (this.score * 0.02));
        });
    }
    
    checkCollisions() {
        if (this.bird.y + this.bird.height > this.groundY) {
            this.gameOver();
            return;
        }
        
        if (this.bird.y < 0) {
            this.gameOver();
            return;
        }
        
        this.pipes.forEach(pipe => {
            if (this.bird.x < pipe.x + this.pipeWidth &&
                this.bird.x + this.bird.width > pipe.x &&
                (this.bird.y < pipe.topHeight || 
                 this.bird.y + this.bird.height > pipe.bottomY)) {
                this.gameOver();
            }
        });
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        
        this.userManager.updateScore(this.score);
        this.updateBestScore();
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    updateBestScore() {
        const bestScore = this.userManager.getCurrentUserBestScore();
        this.bestScoreElement.textContent = bestScore;
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.drawClouds();
        this.drawPipes();
        this.drawGround();
        this.drawBird();
        this.drawUI();
    }
    
    drawClouds() {
        this.clouds.forEach(cloud => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 3, cloud.y, cloud.width / 4, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawPipes() {
        this.pipes.forEach(pipe => {
            this.ctx.fillStyle = '#2ECC71';
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.height - pipe.bottomY);
            
            this.ctx.fillStyle = '#27AE60';
            this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            this.ctx.fillRect(pipe.x + 5, 0, 10, pipe.topHeight);
            this.ctx.fillRect(pipe.x + 5, pipe.bottomY, 10, this.height - pipe.bottomY);
        });
    }
    
    drawGround() {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
        
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, this.groundY, this.width, 20);
        
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.width; i += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.groundY);
            this.ctx.lineTo(i, this.height);
            this.ctx.stroke();
        }
    }
    
    drawBird() {
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate(this.bird.rotation * Math.PI / 180);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, this.bird.width / 2, this.bird.height / 2, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFA500';
        this.ctx.beginPath();
        this.ctx.ellipse(-5, -5, 8, 12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(8, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(25, -3);
        this.ctx.lineTo(25, 3);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawUI() {
        if (this.gameState === 'menu') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '48px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('FLAPPY BIRD', this.width / 2, this.height / 2 - 50);
            
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.fillText('Click Start to Play!', this.width / 2, this.height / 2 + 50);
        }
        
        if (this.gameState === 'playing') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(10, 10, 200, 60);
            
            this.ctx.fillStyle = '#FFF';
            this.ctx.font = '24px "Press Start 2P"';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.score}`, 20, 40);
        }
    }
    
    gameLoop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize global leaderboard backend if credentials are provided
    try {
        if (window.firebase && window.firebaseConfig) {
            window.firebase.initializeApp(window.firebaseConfig);
            const firestore = window.firebase.firestore();
            window.globalLeaderboardService = new GlobalLeaderboardService(firestore);
        }
    } catch (_) {}

    new FlappyBird();
});
