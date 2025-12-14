// Spider Solitaire Implementation
class SpiderGame {
    constructor(container) {
        this.container = container;
        this.stock = [];
        this.tableau = [[], [], [], [], [], [], [], [], [], []];
        this.completedSuits = [];
        this.selectedCards = null;
        this.selectedPile = null;
        
        this.init();
    }

    init() {
        // Spider uses 2 decks (104 cards)
        const cards = [];
        for (let d = 0; d < 2; d++) {
            const suits = ['♠', '♠', '♠', '♠']; // Simplified: all spades for easier game
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            
            for (let suit of suits) {
                for (let rank of ranks) {
                    cards.push(new Card(suit, rank));
                }
            }
        }
        
        // Shuffle
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
        
        // Deal initial tableau: 6 cards to first 4 columns, 5 to last 6
        let cardIndex = 0;
        for (let col = 0; col < 10; col++) {
            const numCards = col < 4 ? 6 : 5;
            for (let i = 0; i < numCards; i++) {
                const card = cards[cardIndex++];
                if (i === numCards - 1) {
                    card.faceUp = true;
                }
                this.tableau[col].push(card);
            }
        }
        
        // Remaining cards go to stock
        while (cardIndex < cards.length) {
            this.stock.push(cards[cardIndex++]);
        }
        
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        // Create stock pile indicator
        const stockPile = document.createElement('div');
        stockPile.className = 'pile stock-pile';
        stockPile.addEventListener('click', () => this.dealFromStock());
        this.container.appendChild(stockPile);
        
        // Show stock count
        if (this.stock.length > 0) {
            const stockCard = document.createElement('div');
            stockCard.className = 'card face-down';
            stockCard.style.left = '20px';
            stockCard.style.top = '20px';
            stockCard.innerHTML = `<div style="position: absolute; bottom: 5px; right: 5px; color: white; font-size: 12px;">${Math.floor(this.stock.length / 10)}</div>`;
            this.container.appendChild(stockCard);
        }
        
        // Render tableau piles
        for (let i = 0; i < 10; i++) {
            const tableauPile = document.createElement('div');
            tableauPile.className = `pile tableau-pile t${i}`;
            tableauPile.addEventListener('click', () => this.moveToTableau(i));
            this.container.appendChild(tableauPile);
            
            // Render tableau cards
            this.tableau[i].forEach((card, index) => {
                const cardEl = card.createCardElement();
                cardEl.style.left = (20 + i * 90) + 'px';
                cardEl.style.top = (136 + index * 20) + 'px';
                
                if (card.faceUp) {
                    cardEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.selectFromTableau(i, index);
                    });
                }
                
                this.container.appendChild(cardEl);
            });
        }
        
        this.checkWin();
    }

    dealFromStock() {
        if (this.stock.length >= 10) {
            // Deal one card to each tableau pile
            for (let i = 0; i < 10; i++) {
                const card = this.stock.pop();
                card.faceUp = true;
                this.tableau[i].push(card);
            }
            this.render();
        }
    }

    selectFromTableau(pileIndex, cardIndex) {
        const pile = this.tableau[pileIndex];
        if (cardIndex < pile.length && pile[cardIndex].faceUp) {
            // Check if we can move this sequence (descending same suit)
            const cards = pile.slice(cardIndex);
            let valid = true;
            for (let i = 0; i < cards.length - 1; i++) {
                if (cards[i].suit !== cards[i + 1].suit || 
                    cards[i].value !== cards[i + 1].value + 1) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                this.selectedCards = cards;
                this.selectedPile = { type: 'tableau', index: pileIndex, startIndex: cardIndex };
                this.highlightSelected();
            }
        }
    }

    moveToTableau(tableauIndex) {
        if (!this.selectedCards) return;
        
        const pile = this.tableau[tableauIndex];
        const firstCard = this.selectedCards[0];
        
        // Check if move is valid (descending rank)
        if (pile.length === 0 || firstCard.value === pile[pile.length - 1].value - 1) {
            this.performMove(tableauIndex);
        }
    }

    performMove(targetIndex) {
        // Remove cards from source
        const sourcePile = this.tableau[this.selectedPile.index];
        sourcePile.splice(this.selectedPile.startIndex);
        
        // Flip top card if it exists and is face down
        if (sourcePile.length > 0 && !sourcePile[sourcePile.length - 1].faceUp) {
            sourcePile[sourcePile.length - 1].faceUp = true;
        }
        
        // Add cards to target
        this.tableau[targetIndex].push(...this.selectedCards);
        
        this.selectedCards = null;
        this.selectedPile = null;
        
        // Check for complete suits
        this.checkCompleteSuits();
        this.render();
    }

    checkCompleteSuits() {
        for (let pile of this.tableau) {
            if (pile.length >= 13) {
                // Check last 13 cards for complete suit
                const last13 = pile.slice(-13);
                if (last13[0].rank === 'K' && last13[12].rank === 'A') {
                    let complete = true;
                    const suit = last13[0].suit;
                    
                    for (let i = 0; i < 12; i++) {
                        if (last13[i].suit !== suit || 
                            last13[i].value !== last13[i + 1].value + 1) {
                            complete = false;
                            break;
                        }
                    }
                    
                    if (complete) {
                        // Remove complete suit
                        pile.splice(-13);
                        this.completedSuits.push(suit);
                    }
                }
            }
        }
    }

    highlightSelected() {
        // Visual feedback could be added here
    }

    checkWin() {
        if (this.completedSuits.length === 8) {
            setTimeout(() => {
                game.triggerWinAnimation();
            }, 500);
        }
    }
}
