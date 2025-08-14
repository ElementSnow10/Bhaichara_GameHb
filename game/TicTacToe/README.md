# Tic Tac Toe Game

A modern, responsive 2-player Tic Tac Toe game built with HTML, CSS, and JavaScript. Features a beautiful UI with animations, score tracking, and multiple interaction methods.

## Features

### 🎮 Game Features
- **2-Player Gameplay**: Classic X vs O gameplay
- **Score Tracking**: Keeps track of wins for both players
- **Win Detection**: Automatically detects winning combinations
- **Draw Detection**: Recognizes when the game ends in a draw
- **Winning Animation**: Highlights winning cells with a pulsing animation

### 🎨 UI/UX Features
- **Modern Design**: Clean, gradient-based design with glassmorphism effects
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smooth Animations**: Hover effects, click animations, and transitions
- **Player Indicators**: Clear visual indication of current player's turn
- **Modal Dialogs**: Beautiful popup dialogs for game results
- **Dark Mode Support**: Automatically adapts to system dark mode preference

### ⌨️ Interaction Methods
- **Mouse/Touch**: Click or tap cells to make moves
- **Keyboard Navigation**: Use number keys 1-9 to make moves
- **Touch Gestures**: Swipe support for mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support

### 🎯 Game Controls
- **New Game**: Start a fresh game while keeping scores
- **Reset Score**: Reset both players' scores to zero
- **Play Again**: Quick restart after game ends
- **Escape Key**: Close modal dialogs

## How to Play

1. **Start the Game**: Open `index.html` in any modern web browser
2. **Take Turns**: Players X and O take turns placing their marks
3. **Win Condition**: Get three of your marks in a row (horizontally, vertically, or diagonally)
4. **Game End**: The game ends when someone wins or all cells are filled (draw)

## File Structure

```
tic-tac-toe/
├── index.html      # Main HTML structure
├── styles.css      # CSS styling and animations
├── script.js       # Game logic and interactions
└── README.md       # This file
```

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Technical Details

### Game Logic
- **Board Representation**: 3x3 array for game state
- **Win Detection**: Checks all 8 possible winning combinations
- **Turn Management**: Alternates between X and O players
- **State Management**: Tracks game state, scores, and player turns

### CSS Features
- **CSS Grid**: For responsive game board layout
- **Flexbox**: For player info and button layouts
- **CSS Variables**: For consistent theming
- **Media Queries**: For responsive design
- **Animations**: CSS keyframes for smooth transitions

### JavaScript Features
- **ES6 Classes**: Object-oriented game structure
- **Event Listeners**: Comprehensive event handling
- **DOM Manipulation**: Dynamic UI updates
- **Touch Events**: Mobile gesture support
- **Keyboard Events**: Accessibility features

## Customization

### Colors
You can easily customize the game colors by modifying the CSS variables in `styles.css`:

```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --x-color: #e53e3e;
    --o-color: #3182ce;
    --win-color: #48bb78;
}
```

### Animations
Adjust animation timing and effects by modifying the CSS keyframes and transition properties.

### Game Rules
Modify the `winningCombinations` array in `script.js` to change win conditions or create variations.

## Future Enhancements

Potential features that could be added:
- [ ] AI opponent with different difficulty levels
- [ ] Sound effects and background music
- [ ] Game history and replay functionality
- [ ] Custom player names
- [ ] Tournament mode
- [ ] Different board sizes (4x4, 5x5)
- [ ] Online multiplayer support

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to fork this project and submit pull requests for improvements!

---

**Enjoy playing Tic Tac Toe! 🎮**
