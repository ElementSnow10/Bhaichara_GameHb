# Solitaire Game

A beautiful, modern implementation of the classic Solitaire card game with smooth animations and responsive design.

## Features

- **Beautiful Card Graphics**: Modern card design with smooth shadows and hover effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Drag & Drop**: Intuitive drag and drop gameplay for moving cards
- **Touch Support**: Full touch support for mobile devices
- **Game Statistics**: Track your time and moves
- **Undo Functionality**: Undo your last move (when available)
- **Auto-completion**: Automatic win detection when all foundations are complete
- **Smooth Animations**: Beautiful card animations and transitions

## How to Play

### Objective
Build up the four foundation piles from Ace to King in each suit (hearts ♥, diamonds ♦, clubs ♣, spades ♠).

### Game Rules

1. **Foundation Piles**: Start with Aces and build up to Kings in each suit
2. **Tableau Piles**: Build down in alternating colors (red/black)
3. **Stock Pile**: Click to draw new cards
4. **Waste Pile**: Shows the top card from the stock pile

### Game Controls

- **Click Stock Pile**: Draw new cards
- **Drag & Drop**: Move cards between piles
- **New Game**: Start a fresh game
- **Undo**: Undo your last move (when available)

### Scoring

- **Time**: Track how long you've been playing
- **Moves**: Count of card movements made
- **Goal**: Complete all four foundation piles

## Technical Features

### Responsive Design
- **Desktop**: Full 7-column tableau layout
- **Tablet**: 4-column layout for medium screens
- **Mobile**: 2-3 column layout for small screens

### Browser Compatibility
- Modern browsers with ES6+ support
- Touch events for mobile devices
- CSS Grid and Flexbox for layout
- CSS animations and transitions

### Performance
- Efficient card rendering
- Smooth drag and drop
- Optimized animations
- Memory-efficient game state management

## File Structure

```
Solitaire/
├── index.html          # Main game HTML
├── style.css           # Game styling and animations
├── game.js            # Game logic and mechanics
└── README.md          # This file
```

## Game Mechanics

### Card Movement Rules
- **To Foundation**: Must match suit and be sequential (A→2→3...→K)
- **To Tableau**: Must be alternating colors and descending (K→Q→J...→A)
- **From Stock**: Click stock pile to draw new cards
- **From Waste**: Can move top card to foundations or tableau

### Win Condition
The game is won when all four foundation piles contain all 13 cards of their respective suits, arranged from Ace to King.

## Customization

The game can be easily customized by modifying:

- **Colors**: Update CSS variables for different color schemes
- **Card Size**: Adjust card dimensions in CSS
- **Animations**: Modify animation durations and effects
- **Layout**: Change grid layouts for different screen sizes

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers with touch support

## Future Enhancements

Potential improvements for future versions:
- Multiple card back designs
- Sound effects
- Hints system
- Statistics tracking
- Different game variants
- Save/load game state

## License

This game is part of the Bhaichara Game Collection and is free to use and modify.

---

Enjoy playing Solitaire! 🃏
