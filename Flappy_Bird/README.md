# Flappy Bird Game with User Authentication & Leaderboard

A modern implementation of the classic Flappy Bird game with user authentication, personal profiles, and a global leaderboard system.

## Features

### 🎮 Game Features
- **Classic Flappy Bird gameplay** - Navigate through pipes by clicking or pressing space
- **Smooth animations** - Bird rotation, cloud movement, and pipe scrolling
- **Responsive design** - Works on desktop and mobile devices
- **Beautiful graphics** - Gradient backgrounds, animated clouds, and detailed bird design

### 👤 User Authentication
- **User Registration** - Create new accounts with username and password
- **User Login** - Secure authentication system
- **Session Management** - Automatic login persistence
- **User Profiles** - Track personal best scores and game statistics

### 🏆 Leaderboard System
- **Global Leaderboard** - See top scores from all players
- **Personal Leaderboard** - View your own score history
- **Real-time Updates** - Scores update immediately after each game
- **Top 100 Rankings** - Maintains the best 100 scores globally

### 📊 Statistics Tracking
- **Personal Best Score** - Track your highest score
- **Games Played** - Count of total games played
- **Total Score** - Cumulative score across all games
- **Score History** - All your scores in the leaderboard

## How to Play

1. **Register/Login**: Create an account or login with existing credentials
2. **Start Game**: Click "Start Game" to begin playing
3. **Control the Bird**: 
   - Press **SPACE** or **CLICK** to make the bird flap
   - Press **R** to restart the game
4. **Avoid Obstacles**: Navigate through the pipes without hitting them
5. **Score Points**: Each pipe you pass gives you 1 point
6. **Check Leaderboard**: Click "Leaderboard" to see top scores

## Technical Details

### Storage
- **LocalStorage**: All user data and scores are stored locally in the browser
- **Data Persistence**: User accounts and scores persist between sessions
- **Secure**: Passwords are stored (in a real application, these would be hashed)

### Architecture
- **Modular Design**: Separate classes for User Management, Leaderboard, and Game Logic
- **Event-Driven**: Responsive UI with proper event handling
- **Canvas Rendering**: Smooth 60fps gameplay using HTML5 Canvas

### Browser Compatibility
- Modern browsers with HTML5 Canvas support
- LocalStorage support required
- Responsive design for mobile devices

## File Structure

```
flappy-bird/
├── index.html          # Main HTML file with login and game UI
├── style.css           # CSS styles for all components
├── game.js             # Complete game logic and user management
└── README.md           # This documentation file
```

## Setup Instructions

1. **Download/Clone** the project files
2. **Open** `index.html` in a web browser
3. **Register** a new account or login
4. **Start Playing**!

## Game Controls

- **SPACE** - Flap/Jump
- **Mouse Click** - Flap/Jump (alternative)
- **R** - Restart game
- **Leaderboard Button** - View scores

## User Interface

### Login Screen
- Clean, modern login form
- Registration and login functionality
- Error/success message display
- Enter key support for quick login

### Game Interface
- Current user display
- Real-time score counter
- Personal best score display
- Game controls and instructions
- Leaderboard access

### Leaderboard Modal
- Global and personal score tabs
- Ranked score display
- Current user highlighting
- Responsive design

## Future Enhancements

Potential features that could be added:
- **Sound Effects** - Audio feedback for gameplay
- **Power-ups** - Special abilities during gameplay
- **Achievements** - Unlockable milestones
- **Multiplayer** - Real-time competitive play
- **Cloud Storage** - Server-side data persistence
- **Social Features** - Friend lists and challenges

## Browser Requirements

- HTML5 Canvas support
- LocalStorage support
- JavaScript enabled
- Modern browser (Chrome, Firefox, Safari, Edge)

## License

This project is open source and available under the MIT License.

---

**Enjoy playing Flappy Bird with your friends and compete for the highest score!** 🐦🏆
