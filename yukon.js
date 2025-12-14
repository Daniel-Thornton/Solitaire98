// Yukon Solitaire Implementation
class YukonGame {
    constructor(container) {
        this.container = container;
        this.deck = new Deck();
        this.foundations = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.draggedCards = null;
        this.draggedFrom = null;
        
        this.init();
    }

    init() {
        this.deck.shuffle();
        
        // Deal first card face-up to first tableau pile
        const firstCard = this.deck.draw();
        firstCard.faceUp = true;
        this.tableau[0].push(firstCard);
        
        // Deal to tableau in pyramid style (like Klondike)
        for (let i = 1; i < 7; i++) {
            for (let j = i; j < 7; j++) {
                const card = this.deck.draw();
                if (i === j) {
                    card.faceUp = true;
                }
                this.tableau[j].push(card);
            }
        }
        
        // Deal remaining cards face-up to columns 2-7
        let col = 1;
        while (this.deck.cards.length > 0) {
            const card = this.deck.draw();
            card.faceUp = true;
            this.tableau[col].push(card);
            col++;
            if (col > 6) col = 1;
        }
        
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        // Create foundation piles
        for (let i = 0; i < 4; i++) {
            const foundationPile = document.createElement('div');
            foundationPile.className = `pile foundation-pile f${i}`;
            foundationPile.dataset.pileType = 'foundation';
            foundationPile.dataset.pileIndex = i;
            this.makeDroppable(foundationPile);
            this.container.appendChild(foundationPile);
            
            // Render foundation cards
            if (this.foundations[i].length > 0) {
                const topCard = this.foundations[i][this.foundations[i].length - 1];
                const cardEl = topCard.createCardElement();
                const right = 290 - (i * 90);
                cardEl.style.right = right + 'px';
                cardEl.style.top = '20px';
                // Mark foundation cards with pile data so they're recognized as drop targets
                cardEl.dataset.pileType = 'foundation';
                cardEl.dataset.pileIndex = i;
                cardEl.style.pointerEvents = 'auto';
                // Make foundation cards draggable back to tableau
                this.makeDraggable(cardEl, [topCard], { type: 'foundation', index: i });
                this.container.appendChild(cardEl);
            }
        }
        
        // Create tableau piles
        for (let i = 0; i < 7; i++) {
            const tableauPile = document.createElement('div');
            tableauPile.className = `pile tableau-pile t${i}`;
            tableauPile.dataset.pileType = 'tableau';
            tableauPile.dataset.pileIndex = i;
            this.makeDroppable(tableauPile);
            this.container.appendChild(tableauPile);
            
            // Render tableau cards
            this.tableau[i].forEach((card, index) => {
                const cardEl = card.createCardElement();
                cardEl.style.left = (20 + i * 90) + 'px';
                cardEl.style.top = (136 + index * 20) + 'px';
                cardEl.style.zIndex = index;
                
                if (card.faceUp) {
                    const cardsFromHere = this.tableau[i].slice(index);
                    cardEl.dataset.pileType = 'tableau';
                    cardEl.dataset.pileIndex = i;
                    cardEl.dataset.cardIndex = index;
                    this.makeDraggable(cardEl, cardsFromHere, { type: 'tableau', index: i, startIndex: index });
                }
                
                this.container.appendChild(cardEl);
            });
        }
        
        this.checkWin();
    }

    makeDraggable(element, cards, source) {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;
        let draggedElements = [];
        
        element.style.cursor = 'grab';
        
        const onMouseDown = (e) => {
            if (e.button !== 0) return;
            
            isDragging = true;
            element.style.cursor = 'grabbing';
            
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            this.draggedCards = cards;
            this.draggedFrom = source;
            
            cards.forEach((card, index) => {
                const dragEl = card.createCardElement();
                dragEl.style.position = 'fixed';
                dragEl.style.left = (e.clientX - offsetX) + 'px';
                dragEl.style.top = (e.clientY - offsetY + index * 20) + 'px';
                dragEl.style.zIndex = 10000 + index;
                dragEl.style.pointerEvents = 'none';
                dragEl.style.opacity = '0.8';
                document.body.appendChild(dragEl);
                draggedElements.push(dragEl);
            });
            
            const pile = this.tableau[source.index];
            for (let i = source.startIndex; i < pile.length; i++) {
                const cardEl = this.container.querySelector(`[data-pile-type="tableau"][data-pile-index="${source.index}"][data-card-index="${i}"]`);
                if (cardEl) cardEl.style.opacity = '0.3';
            }
            
            e.preventDefault();
        };
        
        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            draggedElements.forEach((dragEl, index) => {
                dragEl.style.left = (e.clientX - offsetX) + 'px';
                dragEl.style.top = (e.clientY - offsetY + index * 20) + 'px';
            });
        };
        
        const onMouseUp = (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            element.style.cursor = 'grab';
            
            const dropTarget = document.elementFromPoint(e.clientX, e.clientY);
            let validMove = false;
            let targetPileType = null;
            let targetPileIndex = null;
            
            if (dropTarget) {
                const pile = dropTarget.closest('[data-pile-type]');
                if (pile) {
                    targetPileType = pile.dataset.pileType;
                    targetPileIndex = parseInt(pile.dataset.pileIndex);
                    
                    if (targetPileType === 'foundation') {
                        validMove = this.tryMoveToFoundation(targetPileIndex);
                    } else if (targetPileType === 'tableau') {
                        validMove = this.tryMoveToTableau(targetPileIndex);
                    }
                }
            }
            
            draggedElements.forEach(el => el.remove());
            draggedElements = [];
            
            if (validMove) {
                this.performMove(targetPileType, targetPileIndex);
            } else {
                const pile = this.tableau[source.index];
                for (let i = source.startIndex; i < pile.length; i++) {
                    const cardEl = this.container.querySelector(`[data-pile-type="tableau"][data-pile-index="${source.index}"][data-card-index="${i}"]`);
                    if (cardEl) cardEl.style.opacity = '1';
                }
            }
            
            this.draggedCards = null;
            this.draggedFrom = null;
        };
        
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    makeDroppable(element) {
        element.addEventListener('dragover', (e) => e.preventDefault());
    }

    tryMoveToFoundation(foundationIndex) {
        if (!this.draggedCards || this.draggedCards.length !== 1) return false;
        
        const card = this.draggedCards[0];
        const foundation = this.foundations[foundationIndex];
        
        if (foundation.length === 0) {
            return card.rank === 'A';
        } else {
            const topCard = foundation[foundation.length - 1];
            return card.suit === topCard.suit && card.value === topCard.value + 1;
        }
    }

    tryMoveToTableau(tableauIndex) {
        if (!this.draggedCards) return false;
        
        const pile = this.tableau[tableauIndex];
        const firstCard = this.draggedCards[0];
        
        if (pile.length === 0) {
            return firstCard.rank === 'K'; // Only Kings can be placed on empty piles
        } else {
            const topCard = pile[pile.length - 1];
            return firstCard.color !== topCard.color && firstCard.value === topCard.value - 1;
        }
    }

    performMove(pileType, pileIndex) {
        // Remove cards from source
        if (this.draggedFrom.type === 'foundation') {
            this.foundations[this.draggedFrom.index].pop();
        } else if (this.draggedFrom.type === 'tableau') {
            const sourcePile = this.tableau[this.draggedFrom.index];
            sourcePile.splice(this.draggedFrom.startIndex);
            
            if (sourcePile.length > 0 && !sourcePile[sourcePile.length - 1].faceUp) {
                sourcePile[sourcePile.length - 1].faceUp = true;
            }
        }
        
        // Add cards to target
        if (pileType === 'foundation') {
            this.foundations[pileIndex].push(...this.draggedCards);
        } else if (pileType === 'tableau') {
            this.tableau[pileIndex].push(...this.draggedCards);
        }
        
        this.render();
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
