class SolitaireGame {
    constructor() {
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = {
            hearts: [],
            diamonds: [],
            clubs: [],
            spades: []
        };
        this.tableau = [[], [], [], [], [], [], []];
        this.selectedCards = [];
        this.gameStarted = false;
        this.timer = 0;
        this.timerInterval = null;
        this.moves = 0;
        this.moveHistory = [];
        
        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialCards();
        this.updateDisplay();
    }

    createDeck() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.deck = [];
        suits.forEach(suit => {
            ranks.forEach((rank, index) => {
                this.deck.push({
                    suit: suit,
                    rank: rank,
                    value: index + 1,
                    id: `${suit}-${rank}`,
                    faceUp: false
                });
            });
        });
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        this.stock = [...this.deck];
    }

    dealInitialCards() {
        // Deal to tableau piles
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.stock.pop();
                if (i === j) {
                    card.faceUp = true;
                }
                this.tableau[j].push(card);
            }
        }
    }

    setupEventListeners() {
        // Stock pile click
        document.getElementById('stockPile').addEventListener('click', () => {
            this.drawFromStock();
        });

        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.newGame();
        });

        // Undo button
        document.getElementById('undoBtn').addEventListener('click', () => {
            this.undoMove();
        });

        // Play again button
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.hideGameOverModal();
            this.newGame();
        });

        // Setup drag and drop
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('card')) {
                this.startDrag(e);
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.drag(e);
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (this.isDragging) {
                this.endDrag(e);
            }
        });

        // Touch events for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('card')) {
                e.preventDefault();
                this.startDrag(e.touches[0]);
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.drag(e.touches[0]);
            }
        });

        document.addEventListener('touchend', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.endDrag(e);
            }
        });
    }

    startDrag(e) {
        const card = e.target;
        const pile = this.findPileForCard(card);
        
        if (!pile || !this.canDragCard(card, pile)) return;

        this.isDragging = true;
        this.draggedCard = card;
        this.draggedPile = pile;
        this.dragOffset = {
            x: e.clientX - card.offsetLeft,
            y: e.clientY - card.offsetTop
        };

        card.classList.add('dragging');
        card.style.zIndex = '1000';
        
        // Select all cards below this one in the same pile
        this.selectedCards = this.getCardsBelow(card, pile);
    }

    drag(e) {
        if (!this.isDragging || !this.draggedCard) return;

        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;

        this.draggedCard.style.position = 'fixed';
        this.draggedCard.style.left = x + 'px';
        this.draggedCard.style.top = y + 'px';

        // Highlight potential drop zones
        this.highlightDropZones();
    }

    endDrag(e) {
        if (!this.isDragging) return;

        const dropZone = this.findDropZone(e.clientX, e.clientY);
        
        if (dropZone && this.canDropCards(dropZone)) {
            this.moveCards(dropZone);
        } else {
            this.returnCards();
        }

        this.cleanupDrag();
    }

    cleanupDrag() {
        if (this.draggedCard) {
            this.draggedCard.classList.remove('dragging');
            this.draggedCard.style.position = '';
            this.draggedCard.style.left = '';
            this.draggedCard.style.top = '';
            this.draggedCard.style.zIndex = '';
        }

        this.removeDropZoneHighlights();
        this.isDragging = false;
        this.draggedCard = null;
        this.draggedPile = null;
        this.selectedCards = [];
    }

    findPileForCard(card) {
        // Check tableau piles
        for (let i = 0; i < this.tableau.length; i++) {
            if (this.tableau[i].includes(card.cardData)) {
                return { type: 'tableau', index: i };
            }
        }

        // Check waste pile
        if (this.waste.includes(card.cardData)) {
            return { type: 'waste', index: -1 };
        }

        // Check foundations
        for (const suit in this.foundations) {
            if (this.foundations[suit].includes(card.cardData)) {
                return { type: 'foundation', suit: suit };
            }
        }

        return null;
    }

    canDragCard(card, pile) {
        if (pile.type === 'tableau') {
            const cardIndex = this.tableau[pile.index].indexOf(card.cardData);
            return card.faceUp && cardIndex === this.tableau[pile.index].length - 1;
        }
        return true;
    }

    getCardsBelow(card, pile) {
        if (pile.type === 'tableau') {
            const cardIndex = this.tableau[pile.index].indexOf(card.cardData);
            return this.tableau[pile.index].slice(cardIndex);
        }
        return [card.cardData];
    }

    findDropZone(x, y) {
        const elements = document.elementsFromPoint(x, y);
        
        for (const element of elements) {
            if (element.classList.contains('tableau-pile')) {
                const index = parseInt(element.dataset.index);
                return { type: 'tableau', index: index };
            }
            if (element.classList.contains('foundation-pile')) {
                const suit = element.dataset.suit;
                return { type: 'foundation', suit: suit };
            }
        }
        
        return null;
    }

    canDropCards(dropZone) {
        if (!this.selectedCards || this.selectedCards.length === 0) return false;

        const topCard = this.selectedCards[0];

        if (dropZone.type === 'foundation') {
            return this.canDropToFoundation(topCard, dropZone.suit);
        } else if (dropZone.type === 'tableau') {
            return this.canDropToTableau(topCard, dropZone.index);
        }

        return false;
    }

    canDropToFoundation(card, suit) {
        if (card.suit !== suit) return false;
        
        const foundation = this.foundations[suit];
        if (foundation.length === 0) {
            return card.rank === 'A';
        }
        
        const topCard = foundation[foundation.length - 1];
        return card.value === topCard.value + 1;
    }

    canDropToTableau(card, tableauIndex) {
        const tableau = this.tableau[tableauIndex];
        
        if (tableau.length === 0) {
            return card.rank === 'K';
        }
        
        const topCard = tableau[tableau.length - 1];
        const isAlternatingColor = this.isAlternatingColor(card, topCard);
        const isSequential = card.value === topCard.value - 1;
        
        return isAlternatingColor && isSequential;
    }

    isAlternatingColor(card1, card2) {
        const redSuits = ['hearts', 'diamonds'];
        const card1IsRed = redSuits.includes(card1.suit);
        const card2IsRed = redSuits.includes(card2.suit);
        return card1IsRed !== card2IsRed;
    }

    moveCards(dropZone) {
        this.recordMove();

        if (dropZone.type === 'foundation') {
            this.moveToFoundation(dropZone.suit);
        } else if (dropZone.type === 'tableau') {
            this.moveToTableau(dropZone.index);
        }

        this.moves++;
        this.updateDisplay();
        this.checkWinCondition();
    }

    moveToFoundation(suit) {
        const card = this.selectedCards[0];
        
        // Remove from source
        if (this.draggedPile.type === 'tableau') {
            const index = this.draggedPile.index;
            this.tableau[index].splice(-this.selectedCards.length);
            if (this.tableau[index].length > 0) {
                this.tableau[index][this.tableau[index].length - 1].faceUp = true;
            }
        } else if (this.draggedPile.type === 'waste') {
            this.waste.pop();
        }

        // Add to foundation
        this.foundations[suit].push(card);
    }

    moveToTableau(tableauIndex) {
        // Remove from source
        if (this.draggedPile.type === 'tableau') {
            const sourceIndex = this.draggedPile.index;
            this.tableau[sourceIndex].splice(-this.selectedCards.length);
            if (this.tableau[sourceIndex].length > 0) {
                this.tableau[sourceIndex][this.tableau[sourceIndex].length - 1].faceUp = true;
            }
        } else if (this.draggedPile.type === 'waste') {
            this.waste.pop();
        }

        // Add to destination tableau
        this.tableau[tableauIndex].push(...this.selectedCards);
    }

    returnCards() {
        // Cards return to their original position
        this.updateDisplay();
    }

    recordMove() {
        this.moveHistory.push({
            cards: [...this.selectedCards],
            from: { ...this.draggedPile },
            to: null,
            timestamp: Date.now()
        });
        
        document.getElementById('undoBtn').disabled = false;
    }

    undoMove() {
        if (this.moveHistory.length === 0) return;

        const lastMove = this.moveHistory.pop();
        // Implement undo logic here
        // This is a simplified version - in a full implementation,
        // you'd need to track the destination and restore the previous state
        
        this.moves--;
        this.updateDisplay();
        
        if (this.moveHistory.length === 0) {
            document.getElementById('undoBtn').disabled = true;
        }
    }

    drawFromStock() {
        if (this.stock.length === 0) {
            // Reset stock from waste
            this.stock = [...this.waste].reverse();
            this.waste = [];
            this.stock.forEach(card => card.faceUp = false);
        } else {
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
        }

        this.moves++;
        this.updateDisplay();
    }

    highlightDropZones() {
        // Highlight potential drop zones
        document.querySelectorAll('.tableau-pile, .foundation-pile').forEach(element => {
            element.classList.add('drag-over');
        });
    }

    removeDropZoneHighlights() {
        document.querySelectorAll('.drag-over').forEach(element => {
            element.classList.remove('drag-over');
        });
    }

    updateDisplay() {
        this.updateStockDisplay();
        this.updateWasteDisplay();
        this.updateFoundationsDisplay();
        this.updateTableauDisplay();
        this.updateGameStats();
    }

    updateStockDisplay() {
        const stockPile = document.getElementById('stockPile');
        stockPile.innerHTML = '';
        
        if (this.stock.length > 0) {
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            stockPile.appendChild(cardBack);
        }
    }

    updateWasteDisplay() {
        const wastePile = document.getElementById('wastePile');
        wastePile.innerHTML = '';
        
        if (this.waste.length > 0) {
            const topCard = this.waste[this.waste.length - 1];
            const cardElement = this.createCardElement(topCard);
            wastePile.appendChild(cardElement);
        }
    }

    updateFoundationsDisplay() {
        for (const suit in this.foundations) {
            const foundationPile = document.querySelector(`[data-suit="${suit}"]`);
            foundationPile.innerHTML = '';
            
            if (this.foundations[suit].length > 0) {
                const topCard = this.foundations[suit][this.foundations[suit].length - 1];
                const cardElement = this.createCardElement(topCard);
                foundationPile.appendChild(cardElement);
            }
        }
    }

    updateTableauDisplay() {
        for (let i = 0; i < this.tableau.length; i++) {
            const tableauPile = document.querySelector(`[data-index="${i}"]`);
            tableauPile.innerHTML = '';
            
            this.tableau[i].forEach((card, index) => {
                const cardElement = this.createCardElement(card);
                if (index === this.tableau[i].length - 1) {
                    cardElement.style.marginBottom = '0';
                }
                tableauPile.appendChild(cardElement);
            });
        }
    }

    createCardElement(card) {
        const cardElement = document.createElement('div');
        cardElement.className = `card ${card.suit} ${card.rank.toLowerCase()}`;
        cardElement.dataset.cardId = card.id;
        cardElement.cardData = card;
        
        if (!card.faceUp) {
            cardElement.classList.add('face-down');
        } else {
            const content = document.createElement('div');
            content.className = 'card-content';
            content.textContent = card.rank;
            cardElement.appendChild(content);
            
            const suit = document.createElement('div');
            suit.className = 'card-suit';
            suit.textContent = this.getSuitSymbol(card.suit);
            cardElement.appendChild(suit);
        }
        
        return cardElement;
    }

    getSuitSymbol(suit) {
        const symbols = {
            'hearts': '♥',
            'diamonds': '♦',
            'clubs': '♣',
            'spades': '♠'
        };
        return symbols[suit] || '';
    }

    updateGameStats() {
        document.getElementById('moves').textContent = this.moves;
        
        if (!this.gameStarted) {
            this.startTimer();
        }
    }

    startTimer() {
        this.gameStarted = true;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = timeString;
    }

    checkWinCondition() {
        const allFoundationsComplete = Object.values(this.foundations).every(foundation => 
            foundation.length === 13
        );
        
        if (allFoundationsComplete) {
            this.gameWon();
        }
    }

    gameWon() {
        clearInterval(this.timerInterval);
        
        document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
        document.getElementById('finalMoves').textContent = this.moves;
        
        document.getElementById('gameOverModal').style.display = 'flex';
    }

    hideGameOverModal() {
        document.getElementById('gameOverModal').style.display = 'none';
    }

    newGame() {
        // Reset game state
        this.deck = [];
        this.stock = [];
        this.waste = [];
        this.foundations = {
            hearts: [],
            diamonds: [],
            clubs: [],
            spades: []
        };
        this.tableau = [[], [], [], [], [], [], []];
        this.selectedCards = [];
        this.gameStarted = false;
        this.timer = 0;
        this.moves = 0;
        this.moveHistory = [];
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset UI
        document.getElementById('timer').textContent = '00:00';
        document.getElementById('moves').textContent = '0';
        document.getElementById('undoBtn').disabled = true;
        
        // Initialize new game
        this.initializeGame();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SolitaireGame();
});
