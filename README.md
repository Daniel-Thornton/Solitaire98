# Solitaire Game Collection

A browser-based Solitaire game collection written in **vanilla JavaScript**, featuring multiple classic solitaire variants with drag-and-drop gameplay and animated win effects.

Currently implemented:

* **Yukon Solitaire** ✅

Planned / menu-ready:

* Klondike
* Spider
* FreeCell

---

## 🎮 Features

* Pure JavaScript (no frameworks)
* Drag-and-drop card movement
* Realistic card stacking rules
* Timer and score tracking
* Animated win celebration
* Modular game architecture

---

## 📁 Project Structure

```
/
├── script.js        # Core game engine, cards, deck, and game manager
├── yukon.js         # Yukon Solitaire implementation
├── index.html       # Game UI (not included here)
├── styles.css       # Styling for cards, layout, and animations
└── README.md        # Project documentation
```

---

## 🃏 Game Rules (Yukon)

* Cards are dealt into **7 tableau columns**
* All cards in the tableau can be moved if face-up
* Tableau rules:

  * Cards must alternate color
  * Cards must descend in rank (e.g., 7 on 8)
  * Only Kings can be placed on empty columns
* Foundation rules:

  * Build up from Ace to King
  * Same suit only
* You may move cards **back from foundations** to the tableau

---

## 🚀 Getting Started

### 1. Clone or Download

```bash
git clone https://github.com/your-username/solitaire-game.git
```

### 2. Open in Browser

Simply open `index.html` in any modern browser:

```bash
open index.html
```

No build step or server required.

---

## ⌨️ Controls

* **Mouse Drag** – Move cards
* **F2** – Restart current game
* **Menu Bar** – Switch solitaire variants

---

## 🧠 Architecture Overview

* **Card** – Represents a single playing card
* **Deck** – Manages a shuffled 52-card deck
* **SolitaireGame** – Global game manager (timer, score, menus)
* **YukonGame** – Handles Yukon-specific rules, layout, and rendering

Each game variant is isolated into its own class for easy expansion.

---

## ✨ Win Animation

When all four foundations reach 13 cards:

* Timer stops
* Cards cascade from the foundation stacks
* Gravity-based bounce animation plays

---

## 🔧 Extending the Game

To add a new solitaire variant:

1. Create a new class (e.g., `KlondikeGame`)
2. Follow the structure of `YukonGame`
3. Register it in `SolitaireGame.startNewGame()`

---

## 📜 License

This project is open-source and free to use for learning or personal projects.

---

## 🙌 Credits

Built with ❤️ using JavaScript and classic solitaire rules.
