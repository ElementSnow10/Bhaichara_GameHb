class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.player1Name = 'Player 1';
        this.player2Name = 'Player 2';
        this.player1Score = 0;
        this.player2Score = 0;
        
        // DOM elements
        this.playerSetup = document.getElementById('playerSetup');
        this.gameContainer = document.getElementById('gameContainer');
        this.player1NameInput = document.getElementById('player1Name');
        this.player2NameInput = document.getElementById('player2Name');
        this.startGameBtn = document.getElementById('startGameBtn');
        this.currentPlayerDisplay = document.getElementById('currentPlayer');
        this.player1Display = document.getElementById('player1Display');
        this.player2Display = document.getElementById('player2Display');
        this.player1ScoreDisplay = document.getElementById('player1Score');
        this.player2ScoreDisplay = document.getElementById('player2Score');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.gameResult = document.getElementById('gameResult');
        this.resultMessage = document.getElementById('resultMessage');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.backToSetupBtn = document.getElementById('backToSetupBtn');
        this.cells = document.querySelectorAll('.cell');
        
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // Setup screen events
        this.startGameBtn.addEventListener('click', () => this.startGame());
        
        // Game events
        this.cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
        
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.playAgainBtn.addEventListener('click', () => this.newGame());
        this.backToSetupBtn.addEventListener('click', () => this.backToSetup());
        
        // Enter key support for setup
        this.player1NameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.player2NameInput.focus();
        });
        
        this.player2NameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });
    }
    
    startGame() {
        // Get player names
        this.player1Name = this.player1NameInput.value.trim() || 'Player 1';
        this.player2Name = this.player2NameInput.value.trim() || 'Player 2';
        
        // Hide setup, show game
        this.playerSetup.style.display = 'none';
        this.gameContainer.style.display = 'block';
        
        // Update displays
        this.player1Display.textContent = this.player1Name;
        this.player2Display.textContent = this.player2Name;
        this.player1ScoreDisplay.textContent = this.player1Score;
        this.player2ScoreDisplay.textContent = this.player2Score;
        
        this.gameActive = true;
        this.updateDisplay();
    }
    
    backToSetup() {
        this.gameContainer.style.display = 'none';
        this.playerSetup.style.display = 'flex';
        this.gameResult.style.display = 'none';
    }
    
    handleCellClick(cell) {
        if (!this.gameActive) return;
        
        const index = parseInt(cell.dataset.index);
        
        if (this.board[index] !== '') return; // Cell already filled
        
        // Make move
        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // Check for win or draw
        if (this.checkWin()) {
            this.endGame('win');
        } else if (this.checkDraw()) {
            this.endGame('draw');
        } else {
            // Switch player
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateDisplay();
        }
    }
    
    checkWin() {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        for (let condition of winConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                // Highlight winning cells
                condition.forEach(index => {
                    this.cells[index].classList.add('winning');
                });
                return true;
            }
        }
        return false;
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    endGame(result) {
        this.gameActive = false;
        
        if (result === 'win') {
            const winner = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
            this.resultMessage.textContent = `${winner} Wins!`;
            
            // Update score
            if (this.currentPlayer === 'X') {
                this.player1Score++;
                this.player1ScoreDisplay.textContent = this.player1Score;
            } else {
                this.player2Score++;
                this.player2ScoreDisplay.textContent = this.player2Score;
            }
        } else {
            this.resultMessage.textContent = "It's a Draw!";
        }
        
        this.gameResult.style.display = 'block';
    }
    
    newGame() {
        // Reset board
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear cells
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning');
        });
        
        // Hide result
        this.gameResult.style.display = 'none';
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (this.gameActive) {
            const currentPlayerName = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
            this.currentPlayerDisplay.textContent = currentPlayerName;
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
