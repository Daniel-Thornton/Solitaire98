// FreeCell Solitaire Implementation
class FreeCellGame {
    constructor(container) {
        this.container = container;
        this.deck = new Deck();
        this.freeCells = [null, null, null, null];
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], [], []];
        this.selectedCard = null;
        this.selectedFrom = null;
        
        this.init();
    }

    init() {
        this.deck.shuffle();
        
        // Deal all cards face-up to 8 tableau piles
        // First 4 piles get 7 cards, last 4 get 6 cards
        let col = 0;
        while (this.deck.cards.length > 0) {
            const card = this.deck.draw();
            card.faceUp = true;
            this.tableau[col].push(card);
            col = (col + 1) % 8;
        }
        
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        // Create free cell piles
        for (let i = 0; i < 4; i++) {
            const freeCellPile = document.createElement('div');
            freeCellPile.className = `pile freecell-pile fc${i}`;
            freeCellPile.addEventListener('click', () => this.moveToFreeCell(i));
            this.container.appendChild(freeCellPile);
            
            // Render free cell card
            if (this.freeCells[i]) {
                const card = this.freeCells[i];
                const cardEl = card.createCardElement();
                cardEl.style.left = (20 + i * 90) + 'px';
                cardEl.style.top = '20px';
                cardEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectFromFreeCell(i);
                });
                this.container.appendChild(cardEl);
            }
        }
        
        // Create foundation piles
        for (let i = 0; i < 4; i++) {
            const foundationPile = document.createElement('div');
            foundationPile.className = `pile foundation-pile f${i}`;
            foundationPile.addEventListener('click', () => this.moveToFoundation(i));
            this.container.appendChild(foundationPile);
            
            // Render foundation cards
            if (this.foundations[i].length > 0) {
                const topCard = this.foundations[i][this.foundations[i].length - 1];
                const cardEl = topCard.createCardElement();
                const right = 290 - (i * 90);
                cardEl.style.right = right + 'px';
                cardEl.style.top = '20px';
                this.container.appendChild(cardEl);
            }
        }
        
        // Create tableau piles
        for (let i = 0; i < 8; i++) {
            const tableauPile = document.createElement('div');
            tableauPile.className = `pile tableau-pile t${i}`;
            tableauPile.addEventListener('click', () => this.moveToTableau(i));
            this.container.appendChild(tableauPile);
            
            // Render tableau cards
            this.tableau[i].forEach((card, index) => {
                const cardEl = card.createCardElement();
                cardEl.style.left = (20 + i * 90) + 'px';
                cardEl.style.top = (136 + index * 20) + 'px';
                
                // Only allow selecting the top card
                if (index === this.tableau[i].length - 1) {
                    cardEl.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.selectFromTableau(i);
                    });
                }
                
                this.container.appendChild(cardEl);
            });
        }
        
        this.checkWin();
    }

    selectFromFreeCell(index) {
        if (this.freeCells[index]) {
            this.selectedCard = this.freeCells[index];
            this.selectedFrom = { type: 'freecell', index };
        }
    }

    selectFromTableau(pileIndex) {
        const pile = this.tableau[pileIndex];
        if (pile.length > 0) {
            this.selectedCard = pile[pile.length - 1];
            this.selectedFrom = { type: 'tableau', index: pileIndex };
        }
    }

    moveToFreeCell(freeCellIndex) {
        if (!this.selectedCard || this.freeCells[freeCellIndex] !== null) return;
        
        // Remove from source
        this.removeFromSource();
        
        // Add to free cell
        this.freeCells[freeCellIndex] = this.selectedCard;
        
        this.selectedCard = null;
        this.selectedFrom = null;
        this.render();
    }

    moveToFoundation(foundationIndex) {
        if (!this.selectedCard) return;
        
        const foundation = this.foundations[foundationIndex];
        
        // Check if move is valid
        let valid = false;
        if (foundation.length === 0) {
            valid = this.selectedCard.rank === 'A';
        } else {
            const topCard = foundation[foundation.length - 1];
            valid = this.selectedCard.suit === topCard.suit && 
                    this.selectedCard.value === topCard.value + 1;
        }
        
        if (valid) {
            // Remove from source
            this.removeFromSource();
            
            // Add to foundation
            foundation.push(this.selectedCard);
            
            this.selectedCard = null;
            this.selectedFrom = null;
            this.render();
        }
    }

    moveToTableau(tableauIndex) {
        if (!this.selectedCard) return;
        
        const pile = this.tableau[tableauIndex];
        
        // Check if move is valid
        let valid = false;
        if (pile.length === 0) {
            valid = true; // Can move any card to empty tableau
        } else {
            const topCard = pile[pile.length - 1];
            valid = this.selectedCard.color !== topCard.color && 
                    this.selectedCard.value === topCard.value - 1;
        }
        
        if (valid) {
            // Remove from source
            this.removeFromSource();
            
            // Add to tableau
            pile.push(this.selectedCard);
            
            this.selectedCard = null;
            this.selectedFrom = null;
            this.render();
        }
    }

    removeFromSource() {
        if (this.selectedFrom.type === 'freecell') {
            this.freeCells[this.selectedFrom.index] = null;
        } else if (this.selectedFrom.type === 'tableau') {
            this.tableau[this.selectedFrom.index].pop();
        }
    }

    checkWin() {
        const allFoundationsFull = this.foundations.every(f => f.length === 13);
        if (allFoundationsFull) {
            setTimeout(() => {
                game.triggerWinAnimation();
            }, 500);
        }
    }
}
