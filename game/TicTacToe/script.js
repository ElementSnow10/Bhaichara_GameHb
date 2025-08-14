class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = { X: 0, O: 0 };
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];
        
        this.initializeGame();
    }

    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.turnIndicator = document.querySelector('.turn-indicator');
        this.gameStatus = document.getElementById('gameStatus');
        this.playerElements = document.querySelectorAll('.player');
        this.scoreElements = document.querySelectorAll('.player-score');
        this.modal = document.getElementById('winModal');
        this.winMessage = document.getElementById('winMessage');
        
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Cell click events
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.makeMove(index);
            });
        });

        // Button events
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('resetScoreBtn').addEventListener('click', () => {
            this.resetScore();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideModal();
            this.newGame();
        });

        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideModal();
        });

        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
            if (e.key === 'Enter' && this.modal.classList.contains('show')) {
                this.newGame();
                this.hideModal();
            }
        });
    }

    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }

        // Add move to board
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());

        // Check for win
        if (this.checkWin()) {
            this.handleWin();
            return;
        }

        // Check for draw
        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }

        // Switch player
        this.switchPlayer();
    }

    checkWin() {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                
                // Highlight winning cells
                combination.forEach(index => {
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

    handleWin() {
        this.gameActive = false;
        this.scores[this.currentPlayer]++;
        this.updateScores();
        
        const message = `Player ${this.currentPlayer} wins!`;
        this.showModal(message);
        this.gameStatus.textContent = message;
    }

    handleDraw() {
        this.gameActive = false;
        const message = "It's a draw!";
        this.showModal(message);
        this.gameStatus.textContent = message;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }

    updateDisplay() {
        // Update turn indicator
        this.turnIndicator.textContent = this.currentPlayer;
        
        // Update active player styling
        this.playerElements.forEach(player => {
            player.classList.remove('active');
        });
        
        const activePlayerElement = document.querySelector(`.player-${this.currentPlayer.toLowerCase()}`);
        if (activePlayerElement) {
            activePlayerElement.classList.add('active');
        }
    }

    updateScores() {
        this.scoreElements[0].textContent = this.scores.X;
        this.scoreElements[1].textContent = this.scores.O;
    }

    newGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear board display
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning');
        });
        
        // Clear status
        this.gameStatus.textContent = '';
        
        this.updateDisplay();
    }

    resetScore() {
        this.scores = { X: 0, O: 0 };
        this.updateScores();
        this.newGame();
    }

    showModal(message) {
        this.winMessage.textContent = message;
        this.modal.classList.add('show');
        
        // Focus the play again button for accessibility
        setTimeout(() => {
            document.getElementById('playAgainBtn').focus();
        }, 100);
    }

    hideModal() {
        this.modal.classList.remove('show');
    }

    // Add some fun animations and effects
    addCellAnimation(cell) {
        cell.style.transform = 'scale(0.8)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 150);
    }

    // Add sound effects (optional - can be enhanced with actual audio files)
    playSound(type) {
        // This is a placeholder for sound effects
        // In a real implementation, you would load and play actual audio files
        console.log(`Playing ${type} sound`);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new TicTacToe();
    
    // Add some additional interactive features
    const cells = document.querySelectorAll('.cell');
    
    cells.forEach(cell => {
        // Add hover sound effect simulation
        cell.addEventListener('mouseenter', () => {
            if (cell.textContent === '' && game.gameActive) {
                cell.style.transform = 'scale(1.05)';
            }
        });
        
        cell.addEventListener('mouseleave', () => {
            cell.style.transform = 'scale(1)';
        });
        
        // Add click animation
        cell.addEventListener('click', () => {
            if (cell.textContent === '' && game.gameActive) {
                game.addCellAnimation(cell);
            }
        });
    });
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!game.gameActive) return;
        
        const keyMap = {
            '1': 0, '2': 1, '3': 2,
            '4': 3, '5': 4, '6': 5,
            '7': 6, '8': 7, '9': 8
        };
        
        if (keyMap.hasOwnProperty(e.key)) {
            const index = keyMap[e.key];
            if (game.board[index] === '') {
                game.makeMove(index);
            }
        }
    });
    
    // Add touch support for mobile devices
    let touchStartX, touchStartY;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Detect swipe gestures
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - could be used for undo or other features
                    console.log('Swipe left detected');
                } else {
                    // Swipe right - could be used for redo or other features
                    console.log('Swipe right detected');
                }
            }
        }
        
        touchStartX = null;
        touchStartY = null;
    });
});

// Add some additional utility functions
const GameUtils = {
    // Check if the game is in a winning state for a specific player
    checkWinningState(board, player) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        return winningCombinations.some(combination => {
            const [a, b, c] = combination;
            return board[a] === player && 
                   board[b] === player && 
                   board[c] === player;
        });
    },
    
    // Get all available moves
    getAvailableMoves(board) {
        return board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
    },
    
    // Check if the game is over
    isGameOver(board) {
        return this.checkWinningState(board, 'X') || 
               this.checkWinningState(board, 'O') || 
               board.every(cell => cell !== '');
    }
};
