# 🍄 Super Mario (JavaScript 2D Platformer)

A retro-inspired, browser-based 2D Super Mario platformer built from scratch using **HTML5**, **CSS3**, and **Vanilla JavaScript**. Experience classic platforming physics, enemies, collectible coins, power-up mushrooms, and level progression directly in your browser with zero external libraries or dependencies!

---

## 🎮 Play & Gameplay Features

- **Physics & Mechanics**: Custom implementation of gravity, velocity, platform collision detection, jumping, and momentum.
- **Power-Ups (Mushrooms)**: Hit surprise question blocks to spawn mushrooms that turn Mario into Super Mario (larger size with enhanced abilities) for a limited duration.
- **Multiple Levels**:
  - **Level 1**: Classic ground and floating brick platforms, roaming Goomba-style enemies, and coins.
  - **Level 2**: Challenging layout with elevated platforms, faster enemies, and tricky jump gaps.
- **Level Transitions**: Reach and enter the iconic green pipes to teleport to the next level.
- **Score & Life System**: Track your score, current level, and remaining lives (starts with 3 lives).
- **Game Over & Restart**: Clean game over screen displaying your final score with an instant "Play Again" restart button.

---

## 🕹️ Controls

| Key | Action |
| :--- | :--- |
| <kbd>←</kbd> **Left Arrow** / <kbd>A</kbd> | Move Left |
| <kbd>→</kbd> **Right Arrow** / <kbd>D</kbd> | Move Right |
| <kbd>↑</kbd> **Up Arrow** / <kbd>Space</kbd> | Jump |
| **Stand on Pipe** | Advance to the Next Level |

---

## 🛠️ Built With

- **HTML5**: Semantic structure and game canvas/viewport.
- **CSS3**: Layout, retro pixel styling, transitions, and character animations.
- **Vanilla JavaScript (ES6+)**: Custom game loop (`requestAnimationFrame`), collision logic, enemy AI patrol, and DOM-based state management.

---

## 📁 Project Structure

```text
SUPER MARIO/
│
├── index.html        # Game layout, HUD (score, lives, level), and modals
├── style.css         # Retro styling, platforms, pipes, and sprite visuals
├── app.js            # Game physics, level data, player logic, and collisions
└── README.md         # Project documentation and guide
```

---

## 🚀 How to Run Locally

No installations, build steps, or package managers required!

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vanshika20893/<your-repo-name>.git
   ```

2. **Navigate into the project directory**:
   ```bash
   cd "SUPER MARIO"
   ```

3. **Open the game**:
   - Simply double-click `index.html` to open it in any modern browser (Chrome, Firefox, Safari, Edge).
   - Alternatively, use the **VS Code Live Server** extension by right-clicking `index.html` and selecting **"Open with Live Server"**.

---

Made with ❤️ by [Vanshika Goel](https://github.com/vanshika20893)
