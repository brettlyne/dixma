/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/code.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

figma.showUI(__html__);
figma.ui.resize(320, 660);
// variables to store game piece nodes (pages,frames,etc)
let dixmaBoardPage;
let deckPage;
let componentsPage;
let playerPageTemplate;
let cardPlayFrame;
let playersFrame;
let storytellerBadgeNode;
// constants
const PHASES = {
    PIECES_MISSING: "required game elements not present in file",
    NO_GAME: "no active game",
    PICKING: "players are picking cards",
    VOTING: "players are voting",
    SCORING: "players are moving their tokens on the score tracking board"
};
const EMPTY_PLAYER_STRING = "~ ~ ~ ~ ~ ~ ~ ~";
const PLAYER_ORDER = ["red", "orange", "gold", "lime", "green", "turquoise", "blue", "violet", "purple", "black", "silver", "white"];
const COLORS_AS_HEX = {
    red: "FF0000", orange: "FF800A", gold: "FFD700", lime: "BDFF00",
    green: "008000", turquoise: "40E0D0", blue: "0000CD", violet: "EE82EE",
    purple: "800080", black: "000000", silver: "C0C0C0", white: "FFFFFF"
};
const VOTING_TOKENS_NAME = "Voting Tokens";
const CARD_NAME = "Card";
const CARD_SLOT_PADDING = 5;
const CARD_SIZE = 150;
// game state variables
let players = [];
let playerNodes = [];
let currentStorytellerIndex = 0; // player index of current storyteller
let gamePhase = PHASES.NO_GAME;
// handle messages from plugin UI
figma.ui.onmessage = (msg) => {
    updatePluginStateFromDocument();
    if (msg.type === "testing") {
        moveTokensToGameBoard();
    }
    if (msg.type === "start-game") {
        if (gamePhase === PHASES.NO_GAME && piecesAreReady() && playersAreReady()) {
            // start the game
            gamePhase = PHASES.PICKING;
            nextStoryteller(0);
            players.forEach(player => {
                createPlayerPage(player);
            });
            populatePlayerNodes();
            updateDocumentStateFromPlugin();
        }
    }
    if (msg.type === "reveal-cards" && gamePhase === PHASES.PICKING) {
        moveCardsToGameBoard();
    }
    if (msg.type === "reveal-tokens" && gamePhase === PHASES.VOTING) {
        moveTokensToGameBoard();
    }
    if (msg.type === "new-round" && gamePhase === PHASES.SCORING) {
        clearCardsFromPlayArea();
        dealNewCards();
        resetTokens();
        nextStoryteller();
        gamePhase = PHASES.PICKING;
        updateDocumentStateFromPlugin();
    }
    if (msg.type === "reset-game") {
        resetGame();
    }
    if (msg.type === "reset-game-and-clear-players") {
        resetGame();
        clearPlayerNames();
    }
};
const piecesAreReady = () => {
    dixmaBoardPage = figma.root.findChild((child) => child.name === "Dixma Board");
    deckPage = figma.root.findChild((child) => child.name === "Deck");
    componentsPage = figma.root.findChild((child) => child.name === "Components");
    playerPageTemplate = componentsPage && componentsPage.findChild((child) => child.name === "Player Page Template");
    cardPlayFrame = dixmaBoardPage && dixmaBoardPage.findChild((child) => child.name === "Card Play Area");
    playersFrame = dixmaBoardPage && dixmaBoardPage.findChild((child) => child.name === "Players");
    storytellerBadgeNode = dixmaBoardPage && dixmaBoardPage.findOne((child) => child.name === "Storyteller Badge");
    if (!(dixmaBoardPage && deckPage && componentsPage && playerPageTemplate && cardPlayFrame && playersFrame && storytellerBadgeNode)) {
        figma.notify("Game piece not found. Use Dixma template file / check that nothing was accidentally deleted or renamed. See console...");
        console.log("Each of the following should be defined.");
        console.log(JSON.stringify({
            dixmaBoardPage, deckPage, componentsPage, playerPageTemplate,
            cardPlayFrame, playersFrame, storytellerBadgeNode
        }).split(',').join('\n'));
        return false;
    }
    return true;
};
const playersAreReady = () => {
    let newPlayers = [];
    playersFrame.children.forEach((child) => {
        // Ignore instruction text nodes, we only need to look at the players
        if (child.type === "INSTANCE") {
            const playerNameNode = child.findChild((grandchild) => grandchild.name === "player name");
            const playerName = playerNameNode.characters;
            if (playerName && playerName !== EMPTY_PLAYER_STRING) {
                newPlayers.push({
                    name: playerName,
                    color: child.name
                });
            }
        }
    });
    if (newPlayers.length < 4) {
        figma.notify('Need at least 4 players to start a game.');
        return false;
    }
    const playerNames = newPlayers.map(player => player.name);
    if (playerNames.length !== new Set(playerNames).size) {
        figma.notify('Duplicate names not allowed.');
        return false;
    }
    players = newPlayers;
    return true;
};
const updateDocumentStateFromPlugin = () => {
    figma.root.setPluginData("players", JSON.stringify(players));
    figma.root.setPluginData("gamePhase", gamePhase);
    figma.root.setPluginData("currentStorytellerIndex", `${currentStorytellerIndex}`);
};
const updatePluginStateFromDocument = () => {
    const newPlayers = JSON.parse(figma.root.getPluginData('players'));
    const newGamePhase = figma.root.getPluginData('gamePhase');
    const newCurrentStorytellerIndex = parseInt(figma.root.getPluginData('currentStorytellerIndex'));
    if (gamePhase !== newGamePhase ||
        currentStorytellerIndex !== newCurrentStorytellerIndex) {
        gamePhase = newGamePhase;
        currentStorytellerIndex = newCurrentStorytellerIndex;
    }
    if (!deepEqual(players, newPlayers)) {
        players = newPlayers;
        populatePlayerNodes();
    }
    const playersWithStatus = getPlayersWithStatus();
    figma.ui.postMessage({
        type: 'GAME_STATE',
        players: playersWithStatus,
        gamePhase,
        currentStorytellerIndex
    });
};
const populatePlayerNodes = () => {
    playerNodes = [];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const page = figma.root.findChild((child) => child.name === player.name);
        if (!page) {
            players.splice(i, 1);
            updateDocumentStateFromPlugin();
            populatePlayerNodes();
            break;
        }
        const selectedCardArea = page.findOne((child) => child.name === "Card Selection Area");
        const selectedTokenArea = page.findOne((child) => child.name === "Token Selection Area");
        playerNodes.push({ page, selectedCardArea, selectedTokenArea });
    }
};
const getPlayersWithStatus = () => {
    const playersWithStatus = [];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const isStoryteller = (i === currentStorytellerIndex);
        const playerNode = playerNodes[i];
        if (!playerNode.page || playerNode.page.removed) { // page has been deleted -> remove player
            players.splice(i, 1);
            updateDocumentStateFromPlugin();
            populatePlayerNodes();
            return getPlayersWithStatus();
        }
        let status;
        if (gamePhase === PHASES.PICKING) {
            const selectedCard = playerNode.selectedCardArea.findChild((child) => child.name === CARD_NAME);
            status = (selectedCard ? "done-with-action" : "picking-card");
            if (isStoryteller) {
                status = "storyteller-" + status;
            }
        }
        if (gamePhase === PHASES.VOTING) {
            if (isStoryteller) {
                status = 'storyteller';
            }
            else {
                const selectedToken = playerNode.selectedTokenArea.findChild((child) => child.name === "Voting Token");
                status = (selectedToken ? "done-with-action" : "voting");
            }
        }
        if (gamePhase === PHASES.SCORING) {
            status = (isStoryteller ? 'storyteller-scoring' : 'scoring');
        }
        playersWithStatus.push(Object.assign(Object.assign({}, player), { status }));
    }
    ;
    return playersWithStatus;
};
const createPlayerPage = (player) => {
    const playerPage = figma.createPage();
    playerPage.setPluginData('isPlayerPage', 'true');
    playerPage.name = player.name;
    const customPlayerBoard = createPlayerBoard(player);
    playerPage.appendChild(customPlayerBoard);
    customPlayerBoard.locked = true;
    moveVotingTokens(playerPage, customPlayerBoard);
    setUpSelectionAreas(playerPage, customPlayerBoard);
    dealFirstHand(playerPage, customPlayerBoard);
    return playerPage;
};
const createPlayerBoard = (player) => {
    const customPlayerBoard = playerPageTemplate.clone();
    // Customize page with player name
    const playerNameElement = customPlayerBoard.findOne((child) => child.name === "Player Name Text");
    figma
        .loadFontAsync({ family: "American Typewriter", style: "Regular" })
        .then(() => (playerNameElement.characters = player.name));
    // Copy in player token from Components Page
    const playerTokensFrame = componentsPage.findChild((child) => child.name === "Player Tokens");
    const playerToken = playerTokensFrame.findChild((child) => child.name === player.color).clone();
    playerToken.resize(40, 40);
    playerToken.x = 78;
    playerToken.y = 78;
    customPlayerBoard.appendChild(playerToken);
    // Change color of voting tokens
    const votingTokens = customPlayerBoard.findChild((child) => child.name === VOTING_TOKENS_NAME);
    votingTokens.children.forEach((child) => {
        const votingToken = child;
        const votingTokenFills = clone(votingToken.fills);
        votingTokenFills[0].color = hexToRGB(COLORS_AS_HEX[player.color]);
        votingToken.fills = votingTokenFills;
    });
    return customPlayerBoard;
};
// Move the voting tokens out of the component so they can be easily dragged
const moveVotingTokens = (playerPage, customPlayerBoard) => {
    const votingTokens = customPlayerBoard.findOne((child) => child.name === VOTING_TOKENS_NAME);
    const votingTokensPosition = votingTokens.absoluteTransform;
    const votingTokensClone = votingTokens.clone();
    votingTokens.visible = false;
    playerPage.appendChild(votingTokensClone);
    votingTokensClone.visible = true;
    votingTokensClone.x = votingTokensPosition[0][2];
    votingTokensClone.y = votingTokensPosition[1][2];
};
// Set up areas on player board to select cards & tokens by dropping them in a frame
function setUpSelectionAreas(playerPage, customPlayerBoard) {
    const cardSelectionArea = figma.createFrame();
    const selectedCard = customPlayerBoard.findChild((child) => child.name === "Selected card");
    const cardFills = clone(cardSelectionArea.fills);
    cardFills[0].opacity = 0;
    cardSelectionArea.fills = cardFills;
    cardSelectionArea.name = "Card Selection Area";
    cardSelectionArea.resize(selectedCard.width, selectedCard.height);
    cardSelectionArea.x = selectedCard.absoluteTransform[0][2];
    cardSelectionArea.y = selectedCard.absoluteTransform[1][2];
    playerPage.appendChild(cardSelectionArea);
    const tokenSelectionArea = figma.createFrame();
    const selectedToken = customPlayerBoard.findChild((child) => child.name === "Selected voting token");
    tokenSelectionArea.fills = cardFills;
    tokenSelectionArea.name = "Token Selection Area";
    tokenSelectionArea.cornerRadius = 10;
    tokenSelectionArea.resize(selectedToken.width, selectedToken.height);
    tokenSelectionArea.x = selectedToken.absoluteTransform[0][2];
    tokenSelectionArea.y = selectedToken.absoluteTransform[1][2];
    playerPage.appendChild(tokenSelectionArea);
}
const dealFirstHand = (playerPage, customPlayerBoard) => {
    const cardSlots = customPlayerBoard.findAll((child) => child.name === "Card Inner Placeholder");
    for (let i = 0; i < 6; i++) {
        let randomImage = getRandomImageFromDeck();
        const cardSlot = cardSlots[i];
        const cardSlotPosition = cardSlot.absoluteTransform;
        playerPage.appendChild(randomImage);
        // Scale image to fit card slots
        randomImage = scaleImage(randomImage, CARD_SIZE, CARD_SIZE);
        randomImage.x = cardSlotPosition[0][2] + CARD_SLOT_PADDING;
        randomImage.y = cardSlotPosition[1][2] + CARD_SLOT_PADDING;
        randomImage.name = CARD_NAME;
    }
};
const dealNewCards = () => {
    playerNodes.forEach(node => {
        const page = node.page;
        const cards = page.findChildren((child) => child.name === CARD_NAME);
        const cardSlots = page.findAll((child) => child.name === "Card Inner Placeholder");
        cards.forEach((card, index) => {
            const cardSlot = cardSlots[index];
            const cardSlotPosition = cardSlot.absoluteTransform;
            card.x = cardSlotPosition[0][2] + CARD_SLOT_PADDING;
            card.y = cardSlotPosition[1][2] + CARD_SLOT_PADDING;
        });
        const firstCardSlot = cardSlots[5].absoluteTransform;
        let newImage = getRandomImageFromDeck();
        page.appendChild(newImage);
        newImage = scaleImage(newImage, CARD_SIZE, CARD_SIZE);
        newImage.x = firstCardSlot[0][2] + CARD_SLOT_PADDING;
        newImage.y = firstCardSlot[1][2] + CARD_SLOT_PADDING;
        newImage.name = CARD_NAME;
    });
};
const getRandomImageFromDeck = () => {
    const deckImages = deckPage.children;
    let randomImage = deckImages[Math.floor(Math.random() * deckImages.length)];
    if (randomImage.getPluginData("dealt") === "true") {
        randomImage = getRandomImageFromDeck();
    }
    else {
        randomImage.setPluginData("dealt", "true");
    }
    return randomImage.clone();
};
const moveCardsToGameBoard = () => {
    let cardsToMove = playerNodes.map(node => node.selectedCardArea.findChild((child) => child.name === CARD_NAME));
    let allPlayersAreReady = true;
    let shuffledIndices = [];
    for (let i = 0; i < cardsToMove.length; i++) {
        shuffledIndices.push(i);
        if (!cardsToMove[i]) {
            allPlayersAreReady = false;
            break;
        }
    }
    shuffledIndices = shuffleArray(shuffledIndices);
    if (allPlayersAreReady) {
        cardsToMove.forEach((selectedCard, index) => {
            placeCardInGameBoard(selectedCard, shuffledIndices[index]);
        });
        gamePhase = PHASES.VOTING;
        updateDocumentStateFromPlugin();
    }
    else {
        figma.notify("Not all players have selected a card.");
    }
};
const moveTokensToGameBoard = () => {
    const tokensToMove = [];
    let allReady = true;
    for (let i = 0; i < playerNodes.length; i++) {
        if (currentStorytellerIndex === i)
            continue; // storyteller does not vote
        const selectedTokenArea = playerNodes[i].selectedTokenArea;
        const token = selectedTokenArea.findChild((child) => child.name === "Voting Token");
        token.setPluginData("color", players[i].color);
        if (token) {
            tokensToMove.push(token);
        }
        else {
            allReady = false;
            break;
        }
    }
    if (allReady) {
        tokensToMove.forEach((token, i) => { placeTokenInGameBoard(token, i); });
        gamePhase = PHASES.SCORING;
        updateDocumentStateFromPlugin();
    }
    else {
        figma.notify("Not all players have voted.");
    }
};
const CARDS_X_OFFSET = 65;
const CARDS_Y_OFFSET = 90;
const CARDS_COL_WIDTH = 188;
const CARDS_ROW_HEIGHT = 220;
const CARDS_SIZE = 160;
const placeCardInGameBoard = (card, cardIndex) => {
    card.x = CARDS_X_OFFSET + (cardIndex % 4) * CARDS_COL_WIDTH + (CARDS_SIZE - card.width) / 2;
    card.y =
        CARDS_Y_OFFSET +
            Math.floor(cardIndex / 4) * CARDS_ROW_HEIGHT +
            (CARDS_SIZE - card.height) / 2;
    cardPlayFrame.appendChild(card);
};
const placeTokenInGameBoard = (token, i) => {
    const voteIdx = parseInt(token.children[0].characters) - 1;
    token.x = CARDS_X_OFFSET + (voteIdx % 4) * CARDS_COL_WIDTH + (20 * (i % 7));
    token.y = (CARDS_Y_OFFSET + Math.floor(voteIdx / 4) * CARDS_ROW_HEIGHT + (20 * i)) - (80 * Math.floor(i / 7));
    const color = token.getPluginData("color");
    if (color) {
        // Copy in player token from Components Page
        const playerTokensFrame = componentsPage.findChild((child) => child.name === "Player Tokens");
        const playerToken = playerTokensFrame.findChild((child) => child.name === color).clone();
        playerToken.resize(36, 36);
        playerToken.x = 2;
        playerToken.y = 2;
        token.appendChild(playerToken);
    }
    cardPlayFrame.appendChild(token);
};
const deletePlayerPages = () => {
    figma.root.children.forEach(page => {
        if (page.getPluginData("isPlayerPage") === "true") {
            try {
                page.remove();
            }
            catch (error) {
                figma.notify(`Could not remove player page: ${page.name} –> Try again or remove manually.`);
                console.log(`Could not remove player page: ${page.name} –> Try again or remove manually.`);
                console.log(error);
            }
        }
    });
};
const clearCardsFromPlayArea = () => {
    cardPlayFrame.children.forEach((child) => {
        if (child.name === CARD_NAME) {
            child.remove();
        }
    });
};
const resetTokens = () => {
    const tokensOnBoard = cardPlayFrame.findAll((child) => child.name === "Voting Token");
    tokensOnBoard.forEach(token => { token.remove(); });
    playerNodes.forEach(node => {
        const page = node.page;
        const VotingTokensFrames = page.findChildren(child => child.name === "Voting Tokens");
        VotingTokensFrames.forEach(frame => { frame.remove(); });
        const tokensInUse = page.findAll((child) => child.name === "Voting Token");
        tokensInUse.forEach(token => {
            if (token.parent.type === 'PAGE' || token.parent.visible) {
                token.remove();
            }
        });
        const customPlayerBoard = page.findChild((child) => child.name === "Player Page Template");
        moveVotingTokens(page, customPlayerBoard);
    });
};
const nextStoryteller = (newStoryteller) => {
    if (typeof newStoryteller == 'number') {
        currentStorytellerIndex = newStoryteller;
    }
    else {
        currentStorytellerIndex = (currentStorytellerIndex + 1) % players.length;
    }
    const currColor = players[currentStorytellerIndex].color;
    const storytellerToken = dixmaBoardPage.findOne((child) => child.name === "Storyteller Badge");
    const storytellerIdx = PLAYER_ORDER.indexOf(currColor);
    storytellerToken.y = 102 + 44 * storytellerIdx;
};
const resetDealtCards = () => {
    deckPage.children.forEach((image) => image.setPluginData("dealt", "false"));
};
const clearPlayerNames = () => {
    playersFrame.children.forEach((child) => {
        // Ignore instruction text nodes, we only need to look at the players
        if (child.type === "INSTANCE") {
            const playerName = child.findChild((child) => child.name === "player name");
            figma
                .loadFontAsync({ family: "Roboto Slab", style: "Regular" })
                .then(() => (playerName.characters = EMPTY_PLAYER_STRING));
        }
    });
};
const resetGame = () => {
    gamePhase = PHASES.NO_GAME;
    players = [];
    playerNodes = [];
    currentStorytellerIndex = 0;
    updateDocumentStateFromPlugin();
    clearCardsFromPlayArea();
    deletePlayerPages();
    resetDealtCards();
};
// RUNS ON LAUNCH - check for game state every second
if (piecesAreReady()) {
    const interval = setInterval(() => {
        updatePluginStateFromDocument();
    }, 1000);
}
// HELPER FUNCTIONS
const hexToRGB = (hex) => {
    const h = (hex.charAt(0) == "#") ? hex.substring(1, 7) : hex;
    return {
        r: parseInt(h.substring(0, 2), 16) / 255,
        g: parseInt(h.substring(2, 4), 16) / 255,
        b: parseInt(h.substring(4, 6), 16) / 255
    };
};
const clone = (value) => {
    return JSON.parse(JSON.stringify(value));
};
const scaleImage = (image, maxWidth, maxHeight) => {
    if (image.width > maxWidth) {
        const newHeight = image.height / (image.width / maxWidth);
        if (newHeight > maxHeight) {
            const newWidth = maxWidth / (newHeight / maxHeight);
            image.resize(newWidth, maxHeight);
        }
        else {
            image.resize(maxWidth, newHeight);
        }
    }
    return image;
};
function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (areObjects && !deepEqual(val1, val2) ||
            !areObjects && val1 !== val2) {
            return false;
        }
    }
    return true;
}
function isObject(object) {
    return object != null && typeof object === 'object';
}
//  Durstenfeld Shuffle, copied from Stack Overflow
function shuffleArray(array) {
    let arrayCopy = clone(array);
    for (let i = arrayCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy;
}


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyREFBMkQsd0JBQXdCO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLG9CQUFvQjtBQUN2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQiw0Q0FBNEM7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsb0JBQW9CO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRDtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxZQUFZLFNBQVM7QUFDbEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLGtEQUFrRDtBQUMxRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsT0FBTztBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsd0JBQXdCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHdCQUF3QjtBQUMzQztBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsaUNBQWlDLEVBQUU7QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4REFBOEQsVUFBVTtBQUN4RSw2REFBNkQsVUFBVTtBQUN2RTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxnQkFBZ0IsRUFBRTtBQUN0RDtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsZ0JBQWdCLEVBQUU7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0NBQWdDLDBDQUEwQztBQUMxRTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxPQUFPO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvZGUudHNcIik7XG4iLCJmaWdtYS5zaG93VUkoX19odG1sX18pO1xuZmlnbWEudWkucmVzaXplKDMyMCwgNjYwKTtcbi8vIHZhcmlhYmxlcyB0byBzdG9yZSBnYW1lIHBpZWNlIG5vZGVzIChwYWdlcyxmcmFtZXMsZXRjKVxubGV0IGRpeG1hQm9hcmRQYWdlO1xubGV0IGRlY2tQYWdlO1xubGV0IGNvbXBvbmVudHNQYWdlO1xubGV0IHBsYXllclBhZ2VUZW1wbGF0ZTtcbmxldCBjYXJkUGxheUZyYW1lO1xubGV0IHBsYXllcnNGcmFtZTtcbmxldCBzdG9yeXRlbGxlckJhZGdlTm9kZTtcbi8vIGNvbnN0YW50c1xuY29uc3QgUEhBU0VTID0ge1xuICAgIFBJRUNFU19NSVNTSU5HOiBcInJlcXVpcmVkIGdhbWUgZWxlbWVudHMgbm90IHByZXNlbnQgaW4gZmlsZVwiLFxuICAgIE5PX0dBTUU6IFwibm8gYWN0aXZlIGdhbWVcIixcbiAgICBQSUNLSU5HOiBcInBsYXllcnMgYXJlIHBpY2tpbmcgY2FyZHNcIixcbiAgICBWT1RJTkc6IFwicGxheWVycyBhcmUgdm90aW5nXCIsXG4gICAgU0NPUklORzogXCJwbGF5ZXJzIGFyZSBtb3ZpbmcgdGhlaXIgdG9rZW5zIG9uIHRoZSBzY29yZSB0cmFja2luZyBib2FyZFwiXG59O1xuY29uc3QgRU1QVFlfUExBWUVSX1NUUklORyA9IFwifiB+IH4gfiB+IH4gfiB+XCI7XG5jb25zdCBQTEFZRVJfT1JERVIgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJnb2xkXCIsIFwibGltZVwiLCBcImdyZWVuXCIsIFwidHVycXVvaXNlXCIsIFwiYmx1ZVwiLCBcInZpb2xldFwiLCBcInB1cnBsZVwiLCBcImJsYWNrXCIsIFwic2lsdmVyXCIsIFwid2hpdGVcIl07XG5jb25zdCBDT0xPUlNfQVNfSEVYID0ge1xuICAgIHJlZDogXCJGRjAwMDBcIiwgb3JhbmdlOiBcIkZGODAwQVwiLCBnb2xkOiBcIkZGRDcwMFwiLCBsaW1lOiBcIkJERkYwMFwiLFxuICAgIGdyZWVuOiBcIjAwODAwMFwiLCB0dXJxdW9pc2U6IFwiNDBFMEQwXCIsIGJsdWU6IFwiMDAwMENEXCIsIHZpb2xldDogXCJFRTgyRUVcIixcbiAgICBwdXJwbGU6IFwiODAwMDgwXCIsIGJsYWNrOiBcIjAwMDAwMFwiLCBzaWx2ZXI6IFwiQzBDMEMwXCIsIHdoaXRlOiBcIkZGRkZGRlwiXG59O1xuY29uc3QgVk9USU5HX1RPS0VOU19OQU1FID0gXCJWb3RpbmcgVG9rZW5zXCI7XG5jb25zdCBDQVJEX05BTUUgPSBcIkNhcmRcIjtcbmNvbnN0IENBUkRfU0xPVF9QQURESU5HID0gNTtcbmNvbnN0IENBUkRfU0laRSA9IDE1MDtcbi8vIGdhbWUgc3RhdGUgdmFyaWFibGVzXG5sZXQgcGxheWVycyA9IFtdO1xubGV0IHBsYXllck5vZGVzID0gW107XG5sZXQgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSAwOyAvLyBwbGF5ZXIgaW5kZXggb2YgY3VycmVudCBzdG9yeXRlbGxlclxubGV0IGdhbWVQaGFzZSA9IFBIQVNFUy5OT19HQU1FO1xuLy8gaGFuZGxlIG1lc3NhZ2VzIGZyb20gcGx1Z2luIFVJXG5maWdtYS51aS5vbm1lc3NhZ2UgPSAobXNnKSA9PiB7XG4gICAgdXBkYXRlUGx1Z2luU3RhdGVGcm9tRG9jdW1lbnQoKTtcbiAgICBpZiAobXNnLnR5cGUgPT09IFwidGVzdGluZ1wiKSB7XG4gICAgICAgIG1vdmVUb2tlbnNUb0dhbWVCb2FyZCgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwic3RhcnQtZ2FtZVwiKSB7XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5OT19HQU1FICYmIHBpZWNlc0FyZVJlYWR5KCkgJiYgcGxheWVyc0FyZVJlYWR5KCkpIHtcbiAgICAgICAgICAgIC8vIHN0YXJ0IHRoZSBnYW1lXG4gICAgICAgICAgICBnYW1lUGhhc2UgPSBQSEFTRVMuUElDS0lORztcbiAgICAgICAgICAgIG5leHRTdG9yeXRlbGxlcigwKTtcbiAgICAgICAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgICAgIGNyZWF0ZVBsYXllclBhZ2UocGxheWVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLWNhcmRzXCIgJiYgZ2FtZVBoYXNlID09PSBQSEFTRVMuUElDS0lORykge1xuICAgICAgICBtb3ZlQ2FyZHNUb0dhbWVCb2FyZCgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLXRva2Vuc1wiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlZPVElORykge1xuICAgICAgICBtb3ZlVG9rZW5zVG9HYW1lQm9hcmQoKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcIm5ldy1yb3VuZFwiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlNDT1JJTkcpIHtcbiAgICAgICAgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSgpO1xuICAgICAgICBkZWFsTmV3Q2FyZHMoKTtcbiAgICAgICAgcmVzZXRUb2tlbnMoKTtcbiAgICAgICAgbmV4dFN0b3J5dGVsbGVyKCk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5QSUNLSU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmVzZXQtZ2FtZVwiKSB7XG4gICAgICAgIHJlc2V0R2FtZSgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmVzZXQtZ2FtZS1hbmQtY2xlYXItcGxheWVyc1wiKSB7XG4gICAgICAgIHJlc2V0R2FtZSgpO1xuICAgICAgICBjbGVhclBsYXllck5hbWVzKCk7XG4gICAgfVxufTtcbmNvbnN0IHBpZWNlc0FyZVJlYWR5ID0gKCkgPT4ge1xuICAgIGRpeG1hQm9hcmRQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRpeG1hIEJvYXJkXCIpO1xuICAgIGRlY2tQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRlY2tcIik7XG4gICAgY29tcG9uZW50c1BhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ29tcG9uZW50c1wiKTtcbiAgICBwbGF5ZXJQYWdlVGVtcGxhdGUgPSBjb21wb25lbnRzUGFnZSAmJiBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQYWdlIFRlbXBsYXRlXCIpO1xuICAgIGNhcmRQbGF5RnJhbWUgPSBkaXhtYUJvYXJkUGFnZSAmJiBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgUGxheSBBcmVhXCIpO1xuICAgIHBsYXllcnNGcmFtZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyc1wiKTtcbiAgICBzdG9yeXRlbGxlckJhZGdlTm9kZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlN0b3J5dGVsbGVyIEJhZGdlXCIpO1xuICAgIGlmICghKGRpeG1hQm9hcmRQYWdlICYmIGRlY2tQYWdlICYmIGNvbXBvbmVudHNQYWdlICYmIHBsYXllclBhZ2VUZW1wbGF0ZSAmJiBjYXJkUGxheUZyYW1lICYmIHBsYXllcnNGcmFtZSAmJiBzdG9yeXRlbGxlckJhZGdlTm9kZSkpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiR2FtZSBwaWVjZSBub3QgZm91bmQuIFVzZSBEaXhtYSB0ZW1wbGF0ZSBmaWxlIC8gY2hlY2sgdGhhdCBub3RoaW5nIHdhcyBhY2NpZGVudGFsbHkgZGVsZXRlZCBvciByZW5hbWVkLiBTZWUgY29uc29sZS4uLlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJFYWNoIG9mIHRoZSBmb2xsb3dpbmcgc2hvdWxkIGJlIGRlZmluZWQuXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBkaXhtYUJvYXJkUGFnZSwgZGVja1BhZ2UsIGNvbXBvbmVudHNQYWdlLCBwbGF5ZXJQYWdlVGVtcGxhdGUsXG4gICAgICAgICAgICBjYXJkUGxheUZyYW1lLCBwbGF5ZXJzRnJhbWUsIHN0b3J5dGVsbGVyQmFkZ2VOb2RlXG4gICAgICAgIH0pLnNwbGl0KCcsJykuam9pbignXFxuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHBsYXllcnNBcmVSZWFkeSA9ICgpID0+IHtcbiAgICBsZXQgbmV3UGxheWVycyA9IFtdO1xuICAgIHBsYXllcnNGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgaW5zdHJ1Y3Rpb24gdGV4dCBub2Rlcywgd2Ugb25seSBuZWVkIHRvIGxvb2sgYXQgdGhlIHBsYXllcnNcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09IFwiSU5TVEFOQ0VcIikge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZU5vZGUgPSBjaGlsZC5maW5kQ2hpbGQoKGdyYW5kY2hpbGQpID0+IGdyYW5kY2hpbGQubmFtZSA9PT0gXCJwbGF5ZXIgbmFtZVwiKTtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWUgPSBwbGF5ZXJOYW1lTm9kZS5jaGFyYWN0ZXJzO1xuICAgICAgICAgICAgaWYgKHBsYXllck5hbWUgJiYgcGxheWVyTmFtZSAhPT0gRU1QVFlfUExBWUVSX1NUUklORykge1xuICAgICAgICAgICAgICAgIG5ld1BsYXllcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBsYXllck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjaGlsZC5uYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAobmV3UGxheWVycy5sZW5ndGggPCA0KSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeSgnTmVlZCBhdCBsZWFzdCA0IHBsYXllcnMgdG8gc3RhcnQgYSBnYW1lLicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllck5hbWVzID0gbmV3UGxheWVycy5tYXAocGxheWVyID0+IHBsYXllci5uYW1lKTtcbiAgICBpZiAocGxheWVyTmFtZXMubGVuZ3RoICE9PSBuZXcgU2V0KHBsYXllck5hbWVzKS5zaXplKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeSgnRHVwbGljYXRlIG5hbWVzIG5vdCBhbGxvd2VkLicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHBsYXllcnMgPSBuZXdQbGF5ZXJzO1xuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcInBsYXllcnNcIiwgSlNPTi5zdHJpbmdpZnkocGxheWVycykpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImdhbWVQaGFzZVwiLCBnYW1lUGhhc2UpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImN1cnJlbnRTdG9yeXRlbGxlckluZGV4XCIsIGAke2N1cnJlbnRTdG9yeXRlbGxlckluZGV4fWApO1xufTtcbmNvbnN0IHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IG5ld1BsYXllcnMgPSBKU09OLnBhcnNlKGZpZ21hLnJvb3QuZ2V0UGx1Z2luRGF0YSgncGxheWVycycpKTtcbiAgICBjb25zdCBuZXdHYW1lUGhhc2UgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ2dhbWVQaGFzZScpO1xuICAgIGNvbnN0IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gcGFyc2VJbnQoZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCcpKTtcbiAgICBpZiAoZ2FtZVBoYXNlICE9PSBuZXdHYW1lUGhhc2UgfHxcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggIT09IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4KSB7XG4gICAgICAgIGdhbWVQaGFzZSA9IG5ld0dhbWVQaGFzZTtcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSBuZXdDdXJyZW50U3Rvcnl0ZWxsZXJJbmRleDtcbiAgICB9XG4gICAgaWYgKCFkZWVwRXF1YWwocGxheWVycywgbmV3UGxheWVycykpIHtcbiAgICAgICAgcGxheWVycyA9IG5ld1BsYXllcnM7XG4gICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICB9XG4gICAgY29uc3QgcGxheWVyc1dpdGhTdGF0dXMgPSBnZXRQbGF5ZXJzV2l0aFN0YXR1cygpO1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogJ0dBTUVfU1RBVEUnLFxuICAgICAgICBwbGF5ZXJzOiBwbGF5ZXJzV2l0aFN0YXR1cyxcbiAgICAgICAgZ2FtZVBoYXNlLFxuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleFxuICAgIH0pO1xufTtcbmNvbnN0IHBvcHVsYXRlUGxheWVyTm9kZXMgPSAoKSA9PiB7XG4gICAgcGxheWVyTm9kZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICAgICAgY29uc3QgcGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gcGxheWVyLm5hbWUpO1xuICAgICAgICBpZiAoIXBhZ2UpIHtcbiAgICAgICAgICAgIHBsYXllcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQ2FyZEFyZWEgPSBwYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgU2VsZWN0aW9uIEFyZWFcIik7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVG9rZW5BcmVhID0gcGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJUb2tlbiBTZWxlY3Rpb24gQXJlYVwiKTtcbiAgICAgICAgcGxheWVyTm9kZXMucHVzaCh7IHBhZ2UsIHNlbGVjdGVkQ2FyZEFyZWEsIHNlbGVjdGVkVG9rZW5BcmVhIH0pO1xuICAgIH1cbn07XG5jb25zdCBnZXRQbGF5ZXJzV2l0aFN0YXR1cyA9ICgpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJzV2l0aFN0YXR1cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBwbGF5ZXJzW2ldO1xuICAgICAgICBjb25zdCBpc1N0b3J5dGVsbGVyID0gKGkgPT09IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4KTtcbiAgICAgICAgY29uc3QgcGxheWVyTm9kZSA9IHBsYXllck5vZGVzW2ldO1xuICAgICAgICBpZiAoIXBsYXllck5vZGUucGFnZSB8fCBwbGF5ZXJOb2RlLnBhZ2UucmVtb3ZlZCkgeyAvLyBwYWdlIGhhcyBiZWVuIGRlbGV0ZWQgLT4gcmVtb3ZlIHBsYXllclxuICAgICAgICAgICAgcGxheWVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgICAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgICAgICAgICAgcmV0dXJuIGdldFBsYXllcnNXaXRoU3RhdHVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHN0YXR1cztcbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLlBJQ0tJTkcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQ2FyZCA9IHBsYXllck5vZGUuc2VsZWN0ZWRDYXJkQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpO1xuICAgICAgICAgICAgc3RhdHVzID0gKHNlbGVjdGVkQ2FyZCA/IFwiZG9uZS13aXRoLWFjdGlvblwiIDogXCJwaWNraW5nLWNhcmRcIik7XG4gICAgICAgICAgICBpZiAoaXNTdG9yeXRlbGxlcikge1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9IFwic3Rvcnl0ZWxsZXItXCIgKyBzdGF0dXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLlZPVElORykge1xuICAgICAgICAgICAgaWYgKGlzU3Rvcnl0ZWxsZXIpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAnc3Rvcnl0ZWxsZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUb2tlbiA9IHBsYXllck5vZGUuc2VsZWN0ZWRUb2tlbkFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gKHNlbGVjdGVkVG9rZW4gPyBcImRvbmUtd2l0aC1hY3Rpb25cIiA6IFwidm90aW5nXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5TQ09SSU5HKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSAoaXNTdG9yeXRlbGxlciA/ICdzdG9yeXRlbGxlci1zY29yaW5nJyA6ICdzY29yaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgcGxheWVyc1dpdGhTdGF0dXMucHVzaChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHBsYXllciksIHsgc3RhdHVzIH0pKTtcbiAgICB9XG4gICAgO1xuICAgIHJldHVybiBwbGF5ZXJzV2l0aFN0YXR1cztcbn07XG5jb25zdCBjcmVhdGVQbGF5ZXJQYWdlID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IHBsYXllclBhZ2UgPSBmaWdtYS5jcmVhdGVQYWdlKCk7XG4gICAgcGxheWVyUGFnZS5zZXRQbHVnaW5EYXRhKCdpc1BsYXllclBhZ2UnLCAndHJ1ZScpO1xuICAgIHBsYXllclBhZ2UubmFtZSA9IHBsYXllci5uYW1lO1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gY3JlYXRlUGxheWVyQm9hcmQocGxheWVyKTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICBjdXN0b21QbGF5ZXJCb2FyZC5sb2NrZWQgPSB0cnVlO1xuICAgIG1vdmVWb3RpbmdUb2tlbnMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIGRlYWxGaXJzdEhhbmQocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHJldHVybiBwbGF5ZXJQYWdlO1xufTtcbmNvbnN0IGNyZWF0ZVBsYXllckJvYXJkID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gcGxheWVyUGFnZVRlbXBsYXRlLmNsb25lKCk7XG4gICAgLy8gQ3VzdG9taXplIHBhZ2Ugd2l0aCBwbGF5ZXIgbmFtZVxuICAgIGNvbnN0IHBsYXllck5hbWVFbGVtZW50ID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIE5hbWUgVGV4dFwiKTtcbiAgICBmaWdtYVxuICAgICAgICAubG9hZEZvbnRBc3luYyh7IGZhbWlseTogXCJBbWVyaWNhbiBUeXBld3JpdGVyXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9KVxuICAgICAgICAudGhlbigoKSA9PiAocGxheWVyTmFtZUVsZW1lbnQuY2hhcmFjdGVycyA9IHBsYXllci5uYW1lKSk7XG4gICAgLy8gQ29weSBpbiBwbGF5ZXIgdG9rZW4gZnJvbSBDb21wb25lbnRzIFBhZ2VcbiAgICBjb25zdCBwbGF5ZXJUb2tlbnNGcmFtZSA9IGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFRva2Vuc1wiKTtcbiAgICBjb25zdCBwbGF5ZXJUb2tlbiA9IHBsYXllclRva2Vuc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IHBsYXllci5jb2xvcikuY2xvbmUoKTtcbiAgICBwbGF5ZXJUb2tlbi5yZXNpemUoNDAsIDQwKTtcbiAgICBwbGF5ZXJUb2tlbi54ID0gNzg7XG4gICAgcGxheWVyVG9rZW4ueSA9IDc4O1xuICAgIGN1c3RvbVBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclRva2VuKTtcbiAgICAvLyBDaGFuZ2UgY29sb3Igb2Ygdm90aW5nIHRva2Vuc1xuICAgIGNvbnN0IHZvdGluZ1Rva2VucyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFZPVElOR19UT0tFTlNfTkFNRSk7XG4gICAgdm90aW5nVG9rZW5zLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuID0gY2hpbGQ7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuRmlsbHMgPSBjbG9uZSh2b3RpbmdUb2tlbi5maWxscyk7XG4gICAgICAgIHZvdGluZ1Rva2VuRmlsbHNbMF0uY29sb3IgPSBoZXhUb1JHQihDT0xPUlNfQVNfSEVYW3BsYXllci5jb2xvcl0pO1xuICAgICAgICB2b3RpbmdUb2tlbi5maWxscyA9IHZvdGluZ1Rva2VuRmlsbHM7XG4gICAgfSk7XG4gICAgcmV0dXJuIGN1c3RvbVBsYXllckJvYXJkO1xufTtcbi8vIE1vdmUgdGhlIHZvdGluZyB0b2tlbnMgb3V0IG9mIHRoZSBjb21wb25lbnQgc28gdGhleSBjYW4gYmUgZWFzaWx5IGRyYWdnZWRcbmNvbnN0IG1vdmVWb3RpbmdUb2tlbnMgPSAocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpID0+IHtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnMgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gVk9USU5HX1RPS0VOU19OQU1FKTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNQb3NpdGlvbiA9IHZvdGluZ1Rva2Vucy5hYnNvbHV0ZVRyYW5zZm9ybTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNDbG9uZSA9IHZvdGluZ1Rva2Vucy5jbG9uZSgpO1xuICAgIHZvdGluZ1Rva2Vucy52aXNpYmxlID0gZmFsc2U7XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh2b3RpbmdUb2tlbnNDbG9uZSk7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUudmlzaWJsZSA9IHRydWU7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUueCA9IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uWzBdWzJdO1xuICAgIHZvdGluZ1Rva2Vuc0Nsb25lLnkgPSB2b3RpbmdUb2tlbnNQb3NpdGlvblsxXVsyXTtcbn07XG4vLyBTZXQgdXAgYXJlYXMgb24gcGxheWVyIGJvYXJkIHRvIHNlbGVjdCBjYXJkcyAmIHRva2VucyBieSBkcm9wcGluZyB0aGVtIGluIGEgZnJhbWVcbmZ1bmN0aW9uIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpIHtcbiAgICBjb25zdCBjYXJkU2VsZWN0aW9uQXJlYSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTZWxlY3RlZCBjYXJkXCIpO1xuICAgIGNvbnN0IGNhcmRGaWxscyA9IGNsb25lKGNhcmRTZWxlY3Rpb25BcmVhLmZpbGxzKTtcbiAgICBjYXJkRmlsbHNbMF0ub3BhY2l0eSA9IDA7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEubmFtZSA9IFwiQ2FyZCBTZWxlY3Rpb24gQXJlYVwiO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnJlc2l6ZShzZWxlY3RlZENhcmQud2lkdGgsIHNlbGVjdGVkQ2FyZC5oZWlnaHQpO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnggPSBzZWxlY3RlZENhcmQuYWJzb2x1dGVUcmFuc2Zvcm1bMF1bMl07XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkQ2FyZC5hYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGNhcmRTZWxlY3Rpb25BcmVhKTtcbiAgICBjb25zdCB0b2tlblNlbGVjdGlvbkFyZWEgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkVG9rZW4gPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlNlbGVjdGVkIHZvdGluZyB0b2tlblwiKTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLm5hbWUgPSBcIlRva2VuIFNlbGVjdGlvbiBBcmVhXCI7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLmNvcm5lclJhZGl1cyA9IDEwO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5yZXNpemUoc2VsZWN0ZWRUb2tlbi53aWR0aCwgc2VsZWN0ZWRUb2tlbi5oZWlnaHQpO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS54ID0gc2VsZWN0ZWRUb2tlbi5hYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkVG9rZW4uYWJzb2x1dGVUcmFuc2Zvcm1bMV1bMl07XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh0b2tlblNlbGVjdGlvbkFyZWEpO1xufVxuY29uc3QgZGVhbEZpcnN0SGFuZCA9IChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkgPT4ge1xuICAgIGNvbnN0IGNhcmRTbG90cyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRBbGwoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgSW5uZXIgUGxhY2Vob2xkZXJcIik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgbGV0IHJhbmRvbUltYWdlID0gZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjaygpO1xuICAgICAgICBjb25zdCBjYXJkU2xvdCA9IGNhcmRTbG90c1tpXTtcbiAgICAgICAgY29uc3QgY2FyZFNsb3RQb3NpdGlvbiA9IGNhcmRTbG90LmFic29sdXRlVHJhbnNmb3JtO1xuICAgICAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHJhbmRvbUltYWdlKTtcbiAgICAgICAgLy8gU2NhbGUgaW1hZ2UgdG8gZml0IGNhcmQgc2xvdHNcbiAgICAgICAgcmFuZG9tSW1hZ2UgPSBzY2FsZUltYWdlKHJhbmRvbUltYWdlLCBDQVJEX1NJWkUsIENBUkRfU0laRSk7XG4gICAgICAgIHJhbmRvbUltYWdlLnggPSBjYXJkU2xvdFBvc2l0aW9uWzBdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIHJhbmRvbUltYWdlLnkgPSBjYXJkU2xvdFBvc2l0aW9uWzFdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIHJhbmRvbUltYWdlLm5hbWUgPSBDQVJEX05BTUU7XG4gICAgfVxufTtcbmNvbnN0IGRlYWxOZXdDYXJkcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBjb25zdCBwYWdlID0gbm9kZS5wYWdlO1xuICAgICAgICBjb25zdCBjYXJkcyA9IHBhZ2UuZmluZENoaWxkcmVuKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKTtcbiAgICAgICAgY29uc3QgY2FyZFNsb3RzID0gcGFnZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDYXJkIElubmVyIFBsYWNlaG9sZGVyXCIpO1xuICAgICAgICBjYXJkcy5mb3JFYWNoKChjYXJkLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FyZFNsb3QgPSBjYXJkU2xvdHNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgY2FyZFNsb3RQb3NpdGlvbiA9IGNhcmRTbG90LmFic29sdXRlVHJhbnNmb3JtO1xuICAgICAgICAgICAgY2FyZC54ID0gY2FyZFNsb3RQb3NpdGlvblswXVsyXSArIENBUkRfU0xPVF9QQURESU5HO1xuICAgICAgICAgICAgY2FyZC55ID0gY2FyZFNsb3RQb3NpdGlvblsxXVsyXSArIENBUkRfU0xPVF9QQURESU5HO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZmlyc3RDYXJkU2xvdCA9IGNhcmRTbG90c1s1XS5hYnNvbHV0ZVRyYW5zZm9ybTtcbiAgICAgICAgbGV0IG5ld0ltYWdlID0gZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjaygpO1xuICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld0ltYWdlKTtcbiAgICAgICAgbmV3SW1hZ2UgPSBzY2FsZUltYWdlKG5ld0ltYWdlLCBDQVJEX1NJWkUsIENBUkRfU0laRSk7XG4gICAgICAgIG5ld0ltYWdlLnggPSBmaXJzdENhcmRTbG90WzBdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIG5ld0ltYWdlLnkgPSBmaXJzdENhcmRTbG90WzFdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIG5ld0ltYWdlLm5hbWUgPSBDQVJEX05BTUU7XG4gICAgfSk7XG59O1xuY29uc3QgZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjayA9ICgpID0+IHtcbiAgICBjb25zdCBkZWNrSW1hZ2VzID0gZGVja1BhZ2UuY2hpbGRyZW47XG4gICAgbGV0IHJhbmRvbUltYWdlID0gZGVja0ltYWdlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBkZWNrSW1hZ2VzLmxlbmd0aCldO1xuICAgIGlmIChyYW5kb21JbWFnZS5nZXRQbHVnaW5EYXRhKFwiZGVhbHRcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIHJhbmRvbUltYWdlID0gZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjaygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmFuZG9tSW1hZ2Uuc2V0UGx1Z2luRGF0YShcImRlYWx0XCIsIFwidHJ1ZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmRvbUltYWdlLmNsb25lKCk7XG59O1xuY29uc3QgbW92ZUNhcmRzVG9HYW1lQm9hcmQgPSAoKSA9PiB7XG4gICAgbGV0IGNhcmRzVG9Nb3ZlID0gcGxheWVyTm9kZXMubWFwKG5vZGUgPT4gbm9kZS5zZWxlY3RlZENhcmRBcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSkpO1xuICAgIGxldCBhbGxQbGF5ZXJzQXJlUmVhZHkgPSB0cnVlO1xuICAgIGxldCBzaHVmZmxlZEluZGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhcmRzVG9Nb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNodWZmbGVkSW5kaWNlcy5wdXNoKGkpO1xuICAgICAgICBpZiAoIWNhcmRzVG9Nb3ZlW2ldKSB7XG4gICAgICAgICAgICBhbGxQbGF5ZXJzQXJlUmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNodWZmbGVkSW5kaWNlcyA9IHNodWZmbGVBcnJheShzaHVmZmxlZEluZGljZXMpO1xuICAgIGlmIChhbGxQbGF5ZXJzQXJlUmVhZHkpIHtcbiAgICAgICAgY2FyZHNUb01vdmUuZm9yRWFjaCgoc2VsZWN0ZWRDYXJkLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcGxhY2VDYXJkSW5HYW1lQm9hcmQoc2VsZWN0ZWRDYXJkLCBzaHVmZmxlZEluZGljZXNbaW5kZXhdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5WT1RJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJOb3QgYWxsIHBsYXllcnMgaGF2ZSBzZWxlY3RlZCBhIGNhcmQuXCIpO1xuICAgIH1cbn07XG5jb25zdCBtb3ZlVG9rZW5zVG9HYW1lQm9hcmQgPSAoKSA9PiB7XG4gICAgY29uc3QgdG9rZW5zVG9Nb3ZlID0gW107XG4gICAgbGV0IGFsbFJlYWR5ID0gdHJ1ZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllck5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9PT0gaSlcbiAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBzdG9yeXRlbGxlciBkb2VzIG5vdCB2b3RlXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVG9rZW5BcmVhID0gcGxheWVyTm9kZXNbaV0uc2VsZWN0ZWRUb2tlbkFyZWE7XG4gICAgICAgIGNvbnN0IHRva2VuID0gc2VsZWN0ZWRUb2tlbkFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgIHRva2VuLnNldFBsdWdpbkRhdGEoXCJjb2xvclwiLCBwbGF5ZXJzW2ldLmNvbG9yKTtcbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgICB0b2tlbnNUb01vdmUucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhbGxSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFsbFJlYWR5KSB7XG4gICAgICAgIHRva2Vuc1RvTW92ZS5mb3JFYWNoKCh0b2tlbiwgaSkgPT4geyBwbGFjZVRva2VuSW5HYW1lQm9hcmQodG9rZW4sIGkpOyB9KTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlNDT1JJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJOb3QgYWxsIHBsYXllcnMgaGF2ZSB2b3RlZC5cIik7XG4gICAgfVxufTtcbmNvbnN0IENBUkRTX1hfT0ZGU0VUID0gNjU7XG5jb25zdCBDQVJEU19ZX09GRlNFVCA9IDkwO1xuY29uc3QgQ0FSRFNfQ09MX1dJRFRIID0gMTg4O1xuY29uc3QgQ0FSRFNfUk9XX0hFSUdIVCA9IDIyMDtcbmNvbnN0IENBUkRTX1NJWkUgPSAxNjA7XG5jb25zdCBwbGFjZUNhcmRJbkdhbWVCb2FyZCA9IChjYXJkLCBjYXJkSW5kZXgpID0+IHtcbiAgICBjYXJkLnggPSBDQVJEU19YX09GRlNFVCArIChjYXJkSW5kZXggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArIChDQVJEU19TSVpFIC0gY2FyZC53aWR0aCkgLyAyO1xuICAgIGNhcmQueSA9XG4gICAgICAgIENBUkRTX1lfT0ZGU0VUICtcbiAgICAgICAgICAgIE1hdGguZmxvb3IoY2FyZEluZGV4IC8gNCkgKiBDQVJEU19ST1dfSEVJR0hUICtcbiAgICAgICAgICAgIChDQVJEU19TSVpFIC0gY2FyZC5oZWlnaHQpIC8gMjtcbiAgICBjYXJkUGxheUZyYW1lLmFwcGVuZENoaWxkKGNhcmQpO1xufTtcbmNvbnN0IHBsYWNlVG9rZW5JbkdhbWVCb2FyZCA9ICh0b2tlbiwgaSkgPT4ge1xuICAgIGNvbnN0IHZvdGVJZHggPSBwYXJzZUludCh0b2tlbi5jaGlsZHJlblswXS5jaGFyYWN0ZXJzKSAtIDE7XG4gICAgdG9rZW4ueCA9IENBUkRTX1hfT0ZGU0VUICsgKHZvdGVJZHggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArICgyMCAqIChpICUgNykpO1xuICAgIHRva2VuLnkgPSAoQ0FSRFNfWV9PRkZTRVQgKyBNYXRoLmZsb29yKHZvdGVJZHggLyA0KSAqIENBUkRTX1JPV19IRUlHSFQgKyAoMjAgKiBpKSkgLSAoODAgKiBNYXRoLmZsb29yKGkgLyA3KSk7XG4gICAgY29uc3QgY29sb3IgPSB0b2tlbi5nZXRQbHVnaW5EYXRhKFwiY29sb3JcIik7XG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICAgIC8vIENvcHkgaW4gcGxheWVyIHRva2VuIGZyb20gQ29tcG9uZW50cyBQYWdlXG4gICAgICAgIGNvbnN0IHBsYXllclRva2Vuc0ZyYW1lID0gY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgVG9rZW5zXCIpO1xuICAgICAgICBjb25zdCBwbGF5ZXJUb2tlbiA9IHBsYXllclRva2Vuc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IGNvbG9yKS5jbG9uZSgpO1xuICAgICAgICBwbGF5ZXJUb2tlbi5yZXNpemUoMzYsIDM2KTtcbiAgICAgICAgcGxheWVyVG9rZW4ueCA9IDI7XG4gICAgICAgIHBsYXllclRva2VuLnkgPSAyO1xuICAgICAgICB0b2tlbi5hcHBlbmRDaGlsZChwbGF5ZXJUb2tlbik7XG4gICAgfVxuICAgIGNhcmRQbGF5RnJhbWUuYXBwZW5kQ2hpbGQodG9rZW4pO1xufTtcbmNvbnN0IGRlbGV0ZVBsYXllclBhZ2VzID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3QuY2hpbGRyZW4uZm9yRWFjaChwYWdlID0+IHtcbiAgICAgICAgaWYgKHBhZ2UuZ2V0UGx1Z2luRGF0YShcImlzUGxheWVyUGFnZVwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGFnZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgQ291bGQgbm90IHJlbW92ZSBwbGF5ZXIgcGFnZTogJHtwYWdlLm5hbWV9IOKAkz4gVHJ5IGFnYWluIG9yIHJlbW92ZSBtYW51YWxseS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ291bGQgbm90IHJlbW92ZSBwbGF5ZXIgcGFnZTogJHtwYWdlLm5hbWV9IOKAkz4gVHJ5IGFnYWluIG9yIHJlbW92ZSBtYW51YWxseS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCBjbGVhckNhcmRzRnJvbVBsYXlBcmVhID0gKCkgPT4ge1xuICAgIGNhcmRQbGF5RnJhbWUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSkge1xuICAgICAgICAgICAgY2hpbGQucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCByZXNldFRva2VucyA9ICgpID0+IHtcbiAgICBjb25zdCB0b2tlbnNPbkJvYXJkID0gY2FyZFBsYXlGcmFtZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgdG9rZW5zT25Cb2FyZC5mb3JFYWNoKHRva2VuID0+IHsgdG9rZW4ucmVtb3ZlKCk7IH0pO1xuICAgIHBsYXllck5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBub2RlLnBhZ2U7XG4gICAgICAgIGNvbnN0IFZvdGluZ1Rva2Vuc0ZyYW1lcyA9IHBhZ2UuZmluZENoaWxkcmVuKGNoaWxkID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2Vuc1wiKTtcbiAgICAgICAgVm90aW5nVG9rZW5zRnJhbWVzLmZvckVhY2goZnJhbWUgPT4geyBmcmFtZS5yZW1vdmUoKTsgfSk7XG4gICAgICAgIGNvbnN0IHRva2Vuc0luVXNlID0gcGFnZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgIHRva2Vuc0luVXNlLmZvckVhY2godG9rZW4gPT4ge1xuICAgICAgICAgICAgaWYgKHRva2VuLnBhcmVudC50eXBlID09PSAnUEFHRScgfHwgdG9rZW4ucGFyZW50LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0b2tlbi5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gcGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQYWdlIFRlbXBsYXRlXCIpO1xuICAgICAgICBtb3ZlVm90aW5nVG9rZW5zKHBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICB9KTtcbn07XG5jb25zdCBuZXh0U3Rvcnl0ZWxsZXIgPSAobmV3U3Rvcnl0ZWxsZXIpID0+IHtcbiAgICBpZiAodHlwZW9mIG5ld1N0b3J5dGVsbGVyID09ICdudW1iZXInKSB7XG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gbmV3U3Rvcnl0ZWxsZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IChjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCArIDEpICUgcGxheWVycy5sZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IGN1cnJDb2xvciA9IHBsYXllcnNbY3VycmVudFN0b3J5dGVsbGVySW5kZXhdLmNvbG9yO1xuICAgIGNvbnN0IHN0b3J5dGVsbGVyVG9rZW4gPSBkaXhtYUJvYXJkUGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTdG9yeXRlbGxlciBCYWRnZVwiKTtcbiAgICBjb25zdCBzdG9yeXRlbGxlcklkeCA9IFBMQVlFUl9PUkRFUi5pbmRleE9mKGN1cnJDb2xvcik7XG4gICAgc3Rvcnl0ZWxsZXJUb2tlbi55ID0gMTAyICsgNDQgKiBzdG9yeXRlbGxlcklkeDtcbn07XG5jb25zdCByZXNldERlYWx0Q2FyZHMgPSAoKSA9PiB7XG4gICAgZGVja1BhZ2UuY2hpbGRyZW4uZm9yRWFjaCgoaW1hZ2UpID0+IGltYWdlLnNldFBsdWdpbkRhdGEoXCJkZWFsdFwiLCBcImZhbHNlXCIpKTtcbn07XG5jb25zdCBjbGVhclBsYXllck5hbWVzID0gKCkgPT4ge1xuICAgIHBsYXllcnNGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgaW5zdHJ1Y3Rpb24gdGV4dCBub2Rlcywgd2Ugb25seSBuZWVkIHRvIGxvb2sgYXQgdGhlIHBsYXllcnNcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09IFwiSU5TVEFOQ0VcIikge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZSA9IGNoaWxkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwicGxheWVyIG5hbWVcIik7XG4gICAgICAgICAgICBmaWdtYVxuICAgICAgICAgICAgICAgIC5sb2FkRm9udEFzeW5jKHsgZmFtaWx5OiBcIlJvYm90byBTbGFiXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9KVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IChwbGF5ZXJOYW1lLmNoYXJhY3RlcnMgPSBFTVBUWV9QTEFZRVJfU1RSSU5HKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCByZXNldEdhbWUgPSAoKSA9PiB7XG4gICAgZ2FtZVBoYXNlID0gUEhBU0VTLk5PX0dBTUU7XG4gICAgcGxheWVycyA9IFtdO1xuICAgIHBsYXllck5vZGVzID0gW107XG4gICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSAwO1xuICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSgpO1xuICAgIGRlbGV0ZVBsYXllclBhZ2VzKCk7XG4gICAgcmVzZXREZWFsdENhcmRzKCk7XG59O1xuLy8gUlVOUyBPTiBMQVVOQ0ggLSBjaGVjayBmb3IgZ2FtZSBzdGF0ZSBldmVyeSBzZWNvbmRcbmlmIChwaWVjZXNBcmVSZWFkeSgpKSB7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50KCk7XG4gICAgfSwgMTAwMCk7XG59XG4vLyBIRUxQRVIgRlVOQ1RJT05TXG5jb25zdCBoZXhUb1JHQiA9IChoZXgpID0+IHtcbiAgICBjb25zdCBoID0gKGhleC5jaGFyQXQoMCkgPT0gXCIjXCIpID8gaGV4LnN1YnN0cmluZygxLCA3KSA6IGhleDtcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChoLnN1YnN0cmluZygwLCAyKSwgMTYpIC8gMjU1LFxuICAgICAgICBnOiBwYXJzZUludChoLnN1YnN0cmluZygyLCA0KSwgMTYpIC8gMjU1LFxuICAgICAgICBiOiBwYXJzZUludChoLnN1YnN0cmluZyg0LCA2KSwgMTYpIC8gMjU1XG4gICAgfTtcbn07XG5jb25zdCBjbG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG59O1xuY29uc3Qgc2NhbGVJbWFnZSA9IChpbWFnZSwgbWF4V2lkdGgsIG1heEhlaWdodCkgPT4ge1xuICAgIGlmIChpbWFnZS53aWR0aCA+IG1heFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IGltYWdlLmhlaWdodCAvIChpbWFnZS53aWR0aCAvIG1heFdpZHRoKTtcbiAgICAgICAgaWYgKG5ld0hlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgICAgICAgY29uc3QgbmV3V2lkdGggPSBtYXhXaWR0aCAvIChuZXdIZWlnaHQgLyBtYXhIZWlnaHQpO1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG5ld1dpZHRoLCBtYXhIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG1heFdpZHRoLCBuZXdIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbn07XG5mdW5jdGlvbiBkZWVwRXF1YWwob2JqZWN0MSwgb2JqZWN0Mikge1xuICAgIGNvbnN0IGtleXMxID0gT2JqZWN0LmtleXMob2JqZWN0MSk7XG4gICAgY29uc3Qga2V5czIgPSBPYmplY3Qua2V5cyhvYmplY3QyKTtcbiAgICBpZiAoa2V5czEubGVuZ3RoICE9PSBrZXlzMi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzMSkge1xuICAgICAgICBjb25zdCB2YWwxID0gb2JqZWN0MVtrZXldO1xuICAgICAgICBjb25zdCB2YWwyID0gb2JqZWN0MltrZXldO1xuICAgICAgICBjb25zdCBhcmVPYmplY3RzID0gaXNPYmplY3QodmFsMSkgJiYgaXNPYmplY3QodmFsMik7XG4gICAgICAgIGlmIChhcmVPYmplY3RzICYmICFkZWVwRXF1YWwodmFsMSwgdmFsMikgfHxcbiAgICAgICAgICAgICFhcmVPYmplY3RzICYmIHZhbDEgIT09IHZhbDIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0Jztcbn1cbi8vICBEdXJzdGVuZmVsZCBTaHVmZmxlLCBjb3BpZWQgZnJvbSBTdGFjayBPdmVyZmxvd1xuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gICAgbGV0IGFycmF5Q29weSA9IGNsb25lKGFycmF5KTtcbiAgICBmb3IgKGxldCBpID0gYXJyYXlDb3B5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgICAgICBbYXJyYXlDb3B5W2ldLCBhcnJheUNvcHlbal1dID0gW2FycmF5Q29weVtqXSwgYXJyYXlDb3B5W2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5Q29weTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=