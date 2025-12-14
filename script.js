// Card class
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.faceUp = false;
        this.element = null;
    }

    get color() {
        return (this.suit === '♥' || this.suit === '♦') ? 'red' : 'black';
    }

    get value() {
        const values = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
        return values[this.rank];
    }

    createCardElement() {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.suit = this.suit;
        card.dataset.rank = this.rank;
        
        if (this.faceUp) {
            card.classList.add(this.color);
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-rank">${this.rank}</div>
                    <div class="card-suit">${this.suit}</div>
                    <div class="card-center">${this.suit}</div>
                </div>
            `;
        } else {
            card.classList.add('face-down');
        }
        
        this.element = card;
        return card;
    }

    flip() {
        this.faceUp = !this.faceUp;
        if (this.element) {
            this.element.remove();
            this.createCardElement();
        }
    }
}

// Deck class
class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        this.cards = [];
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        for (let suit of suits) {
            for (let rank of ranks) {
                this.cards.push(new Card(suit, rank));
            }
        }
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    draw() {
        return this.cards.pop();
    }
}

// Game Manager
class SolitaireGame {
    constructor() {
        this.currentGame = 'yukon';
        this.score = 0;
        this.time = 0;
        this.timer = null;
        this.gameInstance = null;
        
        this.setupEventListeners();
        this.startNewGame('yukon');
    }

    setupEventListeners() {
        // Menu options
        document.querySelectorAll('.menu-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleMenuAction(action);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F2') {
                this.startNewGame(this.currentGame);
            }
        });
    }

    handleMenuAction(action) {
        switch(action) {
            case 'new-game':
                this.startNewGame(this.currentGame);
                break;
            case 'klondike':
                this.startNewGame('klondike');
                break;
            case 'spider':
                this.startNewGame('spider');
                break;
            case 'yukon':
                this.startNewGame('yukon');
                break;
            case 'freecell':
                this.startNewGame('freecell');
                break;
            case 'exit':
                if (confirm('Are you sure you want to exit?')) {
                    window.close();
                }
                break;
        }
    }

    startNewGame(gameType) {
        this.currentGame = gameType;
        this.score = 0;
        this.time = 0;
        
        if (this.timer) clearInterval(this.timer);
        
        document.getElementById('game-type').textContent = gameType.charAt(0).toUpperCase() + gameType.slice(1);
        document.getElementById('score').textContent = '0';
        document.getElementById('time').textContent = '0:00';
        
        // Clear previous game
        const container = document.getElementById('game-container');
        container.innerHTML = '';
        
        // Start new game based on type
        switch(gameType) {
            case 'klondike':
                this.gameInstance = new KlondikeGame(container);
                break;
            case 'spider':
                this.gameInstance = new SpiderGame(container);
                break;
            case 'yukon':
                this.gameInstance = new YukonGame(container);
                break;
            case 'freecell':
                this.gameInstance = new FreeCellGame(container);
                break;
        }
        
        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.time++;
            const minutes = Math.floor(this.time / 60);
            const seconds = this.time % 60;
            document.getElementById('time').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    updateScore(points) {
        this.score += points;
        document.getElementById('score').textContent = this.score;
    }

    triggerWinAnimation() {
        clearInterval(this.timer);
        const animationContainer = document.getElementById('win-animation');
        this.startCardCascade(animationContainer);
    }

    startCardCascade(container) {
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];
        
        // Start positions for 4 foundation piles (top right area)
        const foundationPositions = [
            { x: window.innerWidth - 320, y: 50 },  // Pile 1
            { x: window.innerWidth - 230, y: 50 },  // Pile 2
            { x: window.innerWidth - 140, y: 50 },  // Pile 3
            { x: window.innerWidth - 50, y: 50 }    // Pile 4
        ];

        let totalCardsDropped = 0;
        
        // Drop cards from each foundation pile in sequence
        const dropFromPile = (pileIndex) => {
            if (pileIndex >= 4) return;
            
            const startPos = foundationPositions[pileIndex];
            const suit = suits[pileIndex];
            let cardsInPile = 0;
            
            const dropNextCard = () => {
                if (cardsInPile >= 13) {
                    // Move to next pile after a short delay
                    setTimeout(() => dropFromPile(pileIndex + 1), 100);
                    return;
                }
                
                const rank = ranks[cardsInPile];
                const color = (suit === '♥' || suit === '♦') ? 'red' : 'black';

                const card = document.createElement('div');
                card.className = `bouncing-card ${color}`;
                card.innerHTML = `
                    <div class="card-content">
                        <div class="card-rank">${rank}</div>
                        <div class="card-suit">${suit}</div>
                        <div class="card-center">${suit}</div>
                    </div>
                `;

                card.style.left = startPos.x + 'px';
                card.style.top = startPos.y + 'px';
                container.appendChild(card);

                // Physics simulation
                let x = startPos.x;
                let y = startPos.y;
                let velocityX = (Math.random() - 0.5) * 8 + (pileIndex - 1.5) * 2; // Spread based on pile
                let velocityY = -2 - Math.random() * 3; // Initial upward velocity
                let rotation = 0;
                let rotationSpeed = (Math.random() - 0.5) * 15;
                
                const gravity = 0.6;
                const bounceDamping = 0.65;
                const groundY = window.innerHeight - 128; // Account for taskbar
                
                const animate = () => {
                    velocityY += gravity;
                    x += velocityX;
                    y += velocityY;
                    rotation += rotationSpeed;
                    
                    // Bounce off ground
                    if (y >= groundY) {
                        y = groundY;
                        velocityY = -velocityY * bounceDamping;
                        velocityX *= 0.9; // Friction
                        rotationSpeed *= 0.8;
                        
                        // Stop bouncing if velocity is too low
                        if (Math.abs(velocityY) < 1) {
                            velocityY = 0;
                            velocityX *= 0.95;
                        }
                    }
                    
                    // Bounce off walls
                    if (x <= 0 || x >= window.innerWidth - 71) {
                        velocityX = -velocityX * 0.8;
                        x = Math.max(0, Math.min(window.innerWidth - 71, x));
                    }
                    
                    card.style.left = x + 'px';
                    card.style.top = y + 'px';
                    card.style.transform = `rotate(${rotation}deg)`;
                    
                    // Continue animation if card is still moving
                    if (Math.abs(velocityY) > 0.1 || Math.abs(velocityX) > 0.1 || y < groundY) {
                        requestAnimationFrame(animate);
                    }
                };
                
                animate();
                cardsInPile++;
                totalCardsDropped++;
                
                // Drop next card from this pile
                setTimeout(dropNextCard, 100);
            };
            
            dropNextCard();
        };
        
        // Start dropping from first pile
        dropFromPile(0);
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SolitaireGame();
});
