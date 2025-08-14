// Game State
let gameState = {
    currentScene: 'start',
    health: 100,
    maxHealth: 100,
    gold: 0,
    level: 1,
    experience: 0,
    inventory: [],
    character: {
        name: 'Adventurer',
        class: 'Wanderer',
        strength: 10,
        agility: 10,
        intelligence: 10,
        charisma: 10
    },
    flags: {},
    companions: []
};

// Characters Database
const characters = {
    elder: {
        name: 'Elder Thorne',
        description: 'A wise old man with centuries of knowledge etched into his weathered face.',
        personality: 'Wise and cautious, but sometimes cryptic in his advice.',
        dialogue: {
            greeting: "Ah, a new face in Eldoria. I am Elder Thorne, keeper of our village's ancient knowledge.",
            quest_artifact: "The Crystal of Aethon... A powerful artifact indeed. It lies deep within the Forbidden Forest.",
            quest_protection: "Our village faces dark times. The shadows grow stronger each night."
        }
    },
    merchant: {
        name: 'Merchant Zara',
        description: 'A charismatic trader with goods from across the realm.',
        personality: 'Friendly and business-savvy, always looking for a good deal.',
        inventory: ['health_potion', 'magic_scroll', 'enchanted_sword', 'mystery_box'],
        prices: {
            health_potion: 25,
            magic_scroll: 50,
            enchanted_sword: 150,
            mystery_box: 75
        }
    },
    ranger: {
        name: 'Ranger Sylas',
        description: 'A skilled hunter and tracker who knows the forest like the back of his hand.',
        personality: 'Serious and focused, but loyal to those who prove themselves.',
        skills: ['tracking', 'archery', 'survival']
    }
};

// Items Database
const items = {
    health_potion: {
        name: 'Health Potion',
        description: 'Restores 50 health points',
        type: 'consumable',
        effect: { health: 50 },
        icon: '🧪'
    },
    magic_scroll: {
        name: 'Magic Scroll',
        description: 'Teaches a random spell',
        type: 'consumable',
        effect: { spell: 'random' },
        icon: '📜'
    },
    enchanted_sword: {
        name: 'Enchanted Sword',
        description: 'A sword imbued with magical power (+15 strength)',
        type: 'weapon',
        effect: { strength: 15 },
        icon: '⚔️'
    },
    mystery_box: {
        name: 'Mystery Box',
        description: 'Contains a random item',
        type: 'consumable',
        effect: { random: true },
        icon: '📦'
    }
};

// Scenes Database
const scenes = {
    start: {
        text: "Welcome to Mystic Realms, brave adventurer! Your journey begins in the ancient village of Eldoria, where legends speak of a powerful artifact hidden deep within the Forbidden Forest. Choose your path wisely, for every decision shapes your destiny...",
        choices: [
            { text: "Enter the Forbidden Forest", nextScene: "forest_entrance" },
            { text: "Visit the Village Elder", nextScene: "elder_hut" },
            { text: "Check the Market Square", nextScene: "market_square" }
        ]
    },
    forest_entrance: {
        text: "You stand at the edge of the Forbidden Forest. Ancient trees loom overhead, their branches twisted into unnatural shapes. A cold wind whispers through the leaves, carrying with it the scent of decay and something... otherworldly.",
        choices: [
            { text: "Take the left path (Dark Cave)", nextScene: "dark_cave" },
            { text: "Follow the center path (Ancient Ruins)", nextScene: "ancient_ruins" },
            { text: "Go right (Mystic Grove)", nextScene: "mystic_grove" },
            { text: "Return to the village", nextScene: "start" }
        ]
    },
    dark_cave: {
        text: "The cave air is damp and cold. Whispering winds curl around you as shadows dance along the walls.",
        choices: [
            { text: "Search deeper into the darkness", nextScene: "dark_cave" },
            { text: "Carefully back out", nextScene: "forest_entrance" }
        ]
    },
    ancient_ruins: {
        text: "Crumbling stone and faded carvings hint at a civilization lost to time.",
        choices: [
            { text: "Study the carvings", nextScene: "ancient_ruins" },
            { text: "Search the rubble for valuables", nextScene: "ancient_ruins" },
            { text: "Return to the forest entrance", nextScene: "forest_entrance" }
        ]
    },
    mystic_grove: {
        text: "A serene grove bathed in ethereal light. You feel safe here.",
        choices: [
            { text: "Meditate among the glowing flora", nextScene: "mystic_grove" },
            { text: "Gather luminescent flowers", nextScene: "mystic_grove" },
            { text: "Return to the forest entrance", nextScene: "forest_entrance" }
        ]
    },
    elder_hut: {
        text: "You enter Elder Thorne's humble hut. The air is thick with the scent of herbs and old books. The elder sits by a crackling fire, his wise eyes studying you intently.",
        choices: [
            { text: "Ask about the Crystal of Aethon", nextScene: "elder_artifact_quest" },
            { text: "Seek advice about the village", nextScene: "elder_village_advice" },
            { text: "Learn about local history", nextScene: "elder_history" },
            { text: "Return to the village", nextScene: "start" }
        ]
    },
    elder_artifact_quest: {
        text: "The Crystal of Aethon lies deep within the forest, guarded by ancient wards and creatures of shadow.",
        choices: [
            { text: "Thank the Elder and return", nextScene: "elder_hut" }
        ]
    },
    elder_village_advice: {
        text: "Stay vigilant at night and keep allies close. The village thrives when we help one another.",
        choices: [
            { text: "Reflect on his wisdom", nextScene: "elder_hut" }
        ]
    },
    elder_history: {
        text: "Eldoria was founded by seekers of knowledge who respected the balance of nature and magic.",
        choices: [
            { text: "Return to the Elder's hut", nextScene: "elder_hut" }
        ]
    },
    market_square: {
        text: "The market square bustles with activity. Merchants call out their wares, children play in the streets, and the aroma of fresh bread fills the air.",
        choices: [
            { text: "Visit Zara's Emporium", nextScene: "merchant_shop" },
            { text: "Check Gareth's Forge", nextScene: "blacksmith_shop" },
            { text: "Talk to the locals", nextScene: "market_gossip" },
            { text: "Return to the village center", nextScene: "start" }
        ]
    },
    merchant_shop: {
        text: "Zara greets you with a warm smile. Shelves brim with curiosities and potions.",
        choices: [
            { text: "Buy Health Potion (25g)", nextScene: "merchant_shop" },
            { text: "Buy Magic Scroll (50g)", nextScene: "merchant_shop" },
            { text: "Chat with Zara", nextScene: "merchant_shop" },
            { text: "Return to the market", nextScene: "market_square" }
        ]
    },
    blacksmith_shop: {
        text: "Sparks fly as Gareth hammers steel. Weapons line the walls in neat rows.",
        choices: [
            { text: "Buy Enchanted Sword (150g)", nextScene: "blacksmith_shop" },
            { text: "Ask about weapon upkeep", nextScene: "blacksmith_shop" },
            { text: "Return to the market", nextScene: "market_square" }
        ]
    },
    market_gossip: {
        text: "You mingle with the locals, picking up rumors and odd jobs.",
        choices: [
            { text: "Help carry crates (+15g)", nextScene: "market_gossip" },
            { text: "Listen to rumors (+EXP)", nextScene: "market_gossip" },
            { text: "Return to the market", nextScene: "market_square" }
        ]
    }
};

// Initialize the game
function initGame() {
	const loaded = loadGame(true);
	if (!loaded) {
		promptForName();
	}
	updateDisplay();
}

// Update the display
function updateDisplay() {
    document.getElementById('health').textContent = `❤️ Health: ${gameState.health}/${gameState.maxHealth}`;
    document.getElementById('gold').textContent = `💰 Gold: ${gameState.gold}`;
    document.getElementById('level').textContent = `⭐ Level: ${gameState.level}`;
    
    const currentScene = scenes[gameState.currentScene];
    if (currentScene) {
        document.getElementById('story-text').textContent = currentScene.text;
        
        const choicesDiv = document.getElementById('choices');
        choicesDiv.innerHTML = '';
        currentScene.choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = choice.text;
            button.onclick = () => makeChoice(index);
            choicesDiv.appendChild(button);
        });
    }
    
    updateCharacterStats();
    updateInventory();
}

// Update character stats display
function updateCharacterStats() {
    const statsDiv = document.getElementById('character-stats');
    const char = gameState.character;
    
    statsDiv.innerHTML = `
        <div class="stat-item">Name: ${char.name}</div>
        <div class="stat-item">Class: ${char.class}</div>
        <div class="stat-item">Strength: ${char.strength}</div>
        <div class="stat-item">Agility: ${char.agility}</div>
        <div class="stat-item">Intelligence: ${char.intelligence}</div>
        <div class="stat-item">Charisma: ${char.charisma}</div>
        <div class="stat-item">Experience: ${gameState.experience}</div>
    `;
}

// Update inventory display
function updateInventory() {
    const inventoryDiv = document.getElementById('inventory');
    inventoryDiv.innerHTML = '';
    
    if (gameState.inventory.length === 0) {
        inventoryDiv.innerHTML = '<div class="inventory-item">Empty</div>';
        return;
    }
    
    const itemCounts = {};
    gameState.inventory.forEach(itemId => {
        itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
    });
    
    Object.entries(itemCounts).forEach(([itemId, count]) => {
        const item = items[itemId];
        if (item) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.innerHTML = `<span>${item.icon} ${item.name}</span><span>${count}</span>`;
            itemDiv.onclick = () => useItem(itemId);
            inventoryDiv.appendChild(itemDiv);
        }
    });
}

// Prompt the player to name their character
function promptForName() {
    let name = prompt('Name your character:', gameState.character.name || 'Adventurer');
    if (name === null) name = 'Adventurer';
    name = String(name).trim();
    if (name.length === 0) name = 'Adventurer';
    if (name.length > 20) name = name.slice(0, 20);
    gameState.character.name = name;
    gameState.flags.name_chosen = true;
}

// Economy helpers
function gainGold(amount) {
    gameState.gold += amount;
    showMessage(`You gained ${amount} gold.`);
}

function spendGold(amount) {
    if (gameState.gold < amount) {
        showMessage('Not enough gold.');
        return false;
    }
    gameState.gold -= amount;
    return true;
}

function addItem(itemId, count = 1) {
    for (let i = 0; i < count; i++) {
        gameState.inventory.push(itemId);
    }
    const meta = items[itemId];
    showMessage(`Obtained ${count > 1 ? count + 'x ' : ''}${meta ? meta.name : itemId}.`);
}

// Make a choice
function makeChoice(choiceIndex) {
    const currentScene = scenes[gameState.currentScene];
    if (currentScene && currentScene.choices[choiceIndex]) {
        const choice = currentScene.choices[choiceIndex];
        handleSceneLogic(gameState.currentScene, choiceIndex);
        
        if (choice.nextScene) {
            gameState.currentScene = choice.nextScene;
        }
        
        updateDisplay();
    }
}

// Handle special scene logic
function handleSceneLogic(sceneId, choiceIndex) {
    switch(sceneId) {
        case 'forest_entrance':
            if (choiceIndex === 0) {
                gameState.flags.entered_cave = true;
                addExperience(10);
            } else if (choiceIndex === 1) {
                gameState.flags.visited_ruins = true;
                addExperience(15);
            } else if (choiceIndex === 2) {
                gameState.flags.visited_grove = true;
                addExperience(20);
                gameState.health = Math.min(gameState.maxHealth, gameState.health + 20);
            }
            break;
        case 'elder_hut':
            if (choiceIndex === 0) {
                gameState.flags.elder_artifact_quest = true;
                addExperience(25);
            } else if (choiceIndex === 1) {
                gameState.character.intelligence += 2;
                addExperience(15);
            } else if (choiceIndex === 2) {
                gameState.character.intelligence += 1;
                addExperience(10);
            }
            break;
        case 'merchant_shop':
            if (choiceIndex === 0) { // Buy Health Potion (25)
                if (spendGold(25)) addItem('health_potion', 1);
            } else if (choiceIndex === 1) { // Buy Magic Scroll (50)
                if (spendGold(50)) addItem('magic_scroll', 1);
            } else if (choiceIndex === 2) { // Chat
                gameState.character.charisma += 1;
                showMessage('You chat with Zara and feel more confident (+1 Charisma).');
            }
            break;
        case 'blacksmith_shop':
            if (choiceIndex === 0) { // Buy Enchanted Sword (150)
                if (spendGold(150)) addItem('enchanted_sword', 1);
            } else if (choiceIndex === 1) { // Ask upkeep
                showMessage('Gareth shares maintenance tips. Your weapon handling improves (+1 Strength).');
                gameState.character.strength += 1;
            }
            break;
        case 'market_gossip':
            if (choiceIndex === 0) { // Help carry crates
                if (!gameState.flags.helped_crates) {
                    gameState.flags.helped_crates = true;
                    gainGold(15);
                    addExperience(5);
                } else {
                    showMessage("You've already helped today.");
                }
            } else if (choiceIndex === 1) { // Listen to rumors
                addExperience(5);
                showMessage('You pick up useful rumors about the forest.');
            }
            break;
        case 'dark_cave':
            if (choiceIndex === 0) { // Search deeper
                addExperience(15);
                gainGold(10);
                addItem('health_potion', 1);
            } else if (choiceIndex === 1) { // Carefully back out
                showMessage('You retreat safely from the unsettling whispers.');
            }
            break;
        case 'ancient_ruins':
            if (choiceIndex === 0) { // Study carvings
                addExperience(20);
                gameState.character.intelligence += 1;
                showMessage('The ancient symbols expand your understanding (+1 Intelligence).');
            } else if (choiceIndex === 1) { // Search rubble
                addExperience(10);
                gainGold(20);
            }
            break;
        case 'mystic_grove':
            if (choiceIndex === 0) { // Meditate
                gameState.health = gameState.maxHealth;
                addExperience(10);
                showMessage('A calming aura restores your vitality to full.');
            } else if (choiceIndex === 1) { // Gather flowers
                addExperience(5);
                gainGold(5);
            }
            break;
    }
}

// Add experience and level up
function addExperience(amount) {
    gameState.experience += amount;
    const expNeeded = gameState.level * 100;
    
    if (gameState.experience >= expNeeded) {
        gameState.level++;
        gameState.experience -= expNeeded;
        gameState.maxHealth += 20;
        gameState.health = gameState.maxHealth;
        gameState.character.strength += 2;
        gameState.character.agility += 2;
        gameState.character.intelligence += 2;
        gameState.character.charisma += 2;
        
        showMessage(`🎉 Level Up! You are now level ${gameState.level}!`);
    }
}

// Use an item
function useItem(itemId) {
    const item = items[itemId];
    if (!item) return;
    
    const index = gameState.inventory.indexOf(itemId);
    if (index > -1) {
        gameState.inventory.splice(index, 1);
    }
    
    if (item.effect.health) {
        gameState.health = Math.min(gameState.maxHealth, gameState.health + item.effect.health);
        showMessage(`Used ${item.name}! Restored ${item.effect.health} health.`);
    } else if (item.effect.strength) {
        gameState.character.strength += item.effect.strength;
        showMessage(`Used ${item.name}! +${item.effect.strength} strength.`);
    } else if (item.effect.random) {
        const pool = ['health_potion', 'magic_scroll'];
        const randomItem = pool[Math.floor(Math.random() * pool.length)];
        addItem(randomItem, 1);
    } else if (item.effect.spell === 'random') {
        if (!Array.isArray(gameState.flags.spells)) gameState.flags.spells = [];
        const spells = ['Fireball', 'Heal', 'Invisibility'];
        const learned = spells[Math.floor(Math.random() * spells.length)];
        gameState.flags.spells.push(learned);
        gameState.character.intelligence += 1;
        showMessage(`You study the scroll and learn ${learned}! (+1 Intelligence)`);
    }
    
    updateDisplay();
}

// Show a message
function showMessage(message) {
    const storyText = document.getElementById('story-text');
    storyText.textContent = message;
    storyText.classList.add('important');
    
    setTimeout(() => {
        storyText.classList.remove('important');
        updateDisplay();
    }, 3000);
}

// Save game
function saveGame() {
    localStorage.setItem('mysticRealmsSave', JSON.stringify(gameState));
    showMessage('💾 Game saved successfully!');
}

// Load game
function loadGame(silent = false) {
    const savedGame = localStorage.getItem('mysticRealmsSave');
    if (savedGame) {
        try {
            gameState = JSON.parse(savedGame);
            if (!silent) showMessage('📂 Game loaded successfully!');
            return true;
        } catch (e) {
            console.error('Error loading game:', e);
        }
    }
    return false;
}

// Restart game
function restartGame() {
    if (confirm('Are you sure you want to restart? All progress will be lost.')) {
        gameState = {
            currentScene: 'start',
            health: 100,
            maxHealth: 100,
            gold: 0,
            level: 1,
            experience: 0,
            inventory: [],
            character: {
                name: 'Adventurer',
                class: 'Wanderer',
                strength: 10,
                agility: 10,
                intelligence: 10,
                charisma: 10
            },
            flags: {},
            companions: []
        };
        localStorage.removeItem('mysticRealmsSave');
        promptForName();
        updateDisplay();
        showMessage('🔄 Game restarted!');
    }
}

// Initialize the game when the page loads
window.onload = initGame;
