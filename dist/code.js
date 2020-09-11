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
    if (msg.type === "testing") {
        resetTokens();
    }
    if (msg.type === "start-game") {
        if (gamePhase === PHASES.NO_GAME && piecesAreReady() && playersAreReady()) {
            // start the game
            gamePhase = PHASES.PICKING;
            players.forEach(player => {
                createPlayerPage(player);
            });
            populatePlayerNodes();
            updateDocumentStateFromPlugin();
        }
    }
    if (msg.type === "reveal-cards") {
        moveCardsToGameBoard();
    }
    if (msg.type === "reveal-tokens") {
        moveTokensToGameBoard();
    }
    if (msg.type === "new-round") {
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
    playerNodes = players.map(player => {
        const page = figma.root.findChild((child) => child.name === player.name);
        const selectedCardArea = page.findOne((child) => child.name === "Card Selection Area");
        const selectedTokenArea = page.findOne((child) => child.name === "Token Selection Area");
        return { page, selectedCardArea, selectedTokenArea };
    });
};
const getPlayersWithStatus = () => {
    return players.map((player, i) => {
        const isStoryteller = (i === currentStorytellerIndex);
        const playerNode = playerNodes[i];
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
        return Object.assign(Object.assign({}, player), { status });
    });
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
const nextStoryteller = () => {
    currentStorytellerIndex = (currentStorytellerIndex + 1) % players.length;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJELHdCQUF3QjtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQixLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsWUFBWSxTQUFTO0FBQ2xFLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0RBQWtEO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixPQUFPO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix3QkFBd0I7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsd0JBQXdCO0FBQzNDO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsaUNBQWlDLEVBQUU7QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQThELFVBQVU7QUFDeEUsNkRBQTZELFVBQVU7QUFDdkU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsZ0JBQWdCLEVBQUU7QUFDdEQ7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGdCQUFnQixFQUFFO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQywwQ0FBMEM7QUFDMUU7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsT0FBTztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmZpZ21hLnVpLnJlc2l6ZSgzMjAsIDY2MCk7XG4vLyB2YXJpYWJsZXMgdG8gc3RvcmUgZ2FtZSBwaWVjZSBub2RlcyAocGFnZXMsZnJhbWVzLGV0YylcbmxldCBkaXhtYUJvYXJkUGFnZTtcbmxldCBkZWNrUGFnZTtcbmxldCBjb21wb25lbnRzUGFnZTtcbmxldCBwbGF5ZXJQYWdlVGVtcGxhdGU7XG5sZXQgY2FyZFBsYXlGcmFtZTtcbmxldCBwbGF5ZXJzRnJhbWU7XG5sZXQgc3Rvcnl0ZWxsZXJCYWRnZU5vZGU7XG4vLyBjb25zdGFudHNcbmNvbnN0IFBIQVNFUyA9IHtcbiAgICBQSUVDRVNfTUlTU0lORzogXCJyZXF1aXJlZCBnYW1lIGVsZW1lbnRzIG5vdCBwcmVzZW50IGluIGZpbGVcIixcbiAgICBOT19HQU1FOiBcIm5vIGFjdGl2ZSBnYW1lXCIsXG4gICAgUElDS0lORzogXCJwbGF5ZXJzIGFyZSBwaWNraW5nIGNhcmRzXCIsXG4gICAgVk9USU5HOiBcInBsYXllcnMgYXJlIHZvdGluZ1wiLFxuICAgIFNDT1JJTkc6IFwicGxheWVycyBhcmUgbW92aW5nIHRoZWlyIHRva2VucyBvbiB0aGUgc2NvcmUgdHJhY2tpbmcgYm9hcmRcIlxufTtcbmNvbnN0IEVNUFRZX1BMQVlFUl9TVFJJTkcgPSBcIn4gfiB+IH4gfiB+IH4gflwiO1xuY29uc3QgUExBWUVSX09SREVSID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwiZ29sZFwiLCBcImxpbWVcIiwgXCJncmVlblwiLCBcInR1cnF1b2lzZVwiLCBcImJsdWVcIiwgXCJ2aW9sZXRcIiwgXCJwdXJwbGVcIiwgXCJibGFja1wiLCBcInNpbHZlclwiLCBcIndoaXRlXCJdO1xuY29uc3QgQ09MT1JTX0FTX0hFWCA9IHtcbiAgICByZWQ6IFwiRkYwMDAwXCIsIG9yYW5nZTogXCJGRjgwMEFcIiwgZ29sZDogXCJGRkQ3MDBcIiwgbGltZTogXCJCREZGMDBcIixcbiAgICBncmVlbjogXCIwMDgwMDBcIiwgdHVycXVvaXNlOiBcIjQwRTBEMFwiLCBibHVlOiBcIjAwMDBDRFwiLCB2aW9sZXQ6IFwiRUU4MkVFXCIsXG4gICAgcHVycGxlOiBcIjgwMDA4MFwiLCBibGFjazogXCIwMDAwMDBcIiwgc2lsdmVyOiBcIkMwQzBDMFwiLCB3aGl0ZTogXCJGRkZGRkZcIlxufTtcbmNvbnN0IFZPVElOR19UT0tFTlNfTkFNRSA9IFwiVm90aW5nIFRva2Vuc1wiO1xuY29uc3QgQ0FSRF9OQU1FID0gXCJDYXJkXCI7XG5jb25zdCBDQVJEX1NMT1RfUEFERElORyA9IDU7XG5jb25zdCBDQVJEX1NJWkUgPSAxNTA7XG4vLyBnYW1lIHN0YXRlIHZhcmlhYmxlc1xubGV0IHBsYXllcnMgPSBbXTtcbmxldCBwbGF5ZXJOb2RlcyA9IFtdO1xubGV0IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gMDsgLy8gcGxheWVyIGluZGV4IG9mIGN1cnJlbnQgc3Rvcnl0ZWxsZXJcbmxldCBnYW1lUGhhc2UgPSBQSEFTRVMuTk9fR0FNRTtcbi8vIGhhbmRsZSBtZXNzYWdlcyBmcm9tIHBsdWdpbiBVSVxuZmlnbWEudWkub25tZXNzYWdlID0gKG1zZykgPT4ge1xuICAgIGlmIChtc2cudHlwZSA9PT0gXCJ0ZXN0aW5nXCIpIHtcbiAgICAgICAgcmVzZXRUb2tlbnMoKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInN0YXJ0LWdhbWVcIikge1xuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuTk9fR0FNRSAmJiBwaWVjZXNBcmVSZWFkeSgpICYmIHBsYXllcnNBcmVSZWFkeSgpKSB7XG4gICAgICAgICAgICAvLyBzdGFydCB0aGUgZ2FtZVxuICAgICAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlBJQ0tJTkc7XG4gICAgICAgICAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgICAgICBjcmVhdGVQbGF5ZXJQYWdlKHBsYXllcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICAgICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInJldmVhbC1jYXJkc1wiKSB7XG4gICAgICAgIG1vdmVDYXJkc1RvR2FtZUJvYXJkKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXZlYWwtdG9rZW5zXCIpIHtcbiAgICAgICAgbW92ZVRva2Vuc1RvR2FtZUJvYXJkKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJuZXctcm91bmRcIikge1xuICAgICAgICBjbGVhckNhcmRzRnJvbVBsYXlBcmVhKCk7XG4gICAgICAgIGRlYWxOZXdDYXJkcygpO1xuICAgICAgICByZXNldFRva2VucygpO1xuICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIoKTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlBJQ0tJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXNldC1nYW1lXCIpIHtcbiAgICAgICAgcmVzZXRHYW1lKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXNldC1nYW1lLWFuZC1jbGVhci1wbGF5ZXJzXCIpIHtcbiAgICAgICAgcmVzZXRHYW1lKCk7XG4gICAgICAgIGNsZWFyUGxheWVyTmFtZXMoKTtcbiAgICB9XG59O1xuY29uc3QgcGllY2VzQXJlUmVhZHkgPSAoKSA9PiB7XG4gICAgZGl4bWFCb2FyZFBhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiRGl4bWEgQm9hcmRcIik7XG4gICAgZGVja1BhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiRGVja1wiKTtcbiAgICBjb21wb25lbnRzUGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDb21wb25lbnRzXCIpO1xuICAgIHBsYXllclBhZ2VUZW1wbGF0ZSA9IGNvbXBvbmVudHNQYWdlICYmIGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFBhZ2UgVGVtcGxhdGVcIik7XG4gICAgY2FyZFBsYXlGcmFtZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBQbGF5IEFyZWFcIik7XG4gICAgcGxheWVyc0ZyYW1lID0gZGl4bWFCb2FyZFBhZ2UgJiYgZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXJzXCIpO1xuICAgIHN0b3J5dGVsbGVyQmFkZ2VOb2RlID0gZGl4bWFCb2FyZFBhZ2UgJiYgZGl4bWFCb2FyZFBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU3Rvcnl0ZWxsZXIgQmFkZ2VcIik7XG4gICAgaWYgKCEoZGl4bWFCb2FyZFBhZ2UgJiYgZGVja1BhZ2UgJiYgY29tcG9uZW50c1BhZ2UgJiYgcGxheWVyUGFnZVRlbXBsYXRlICYmIGNhcmRQbGF5RnJhbWUgJiYgcGxheWVyc0ZyYW1lICYmIHN0b3J5dGVsbGVyQmFkZ2VOb2RlKSkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJHYW1lIHBpZWNlIG5vdCBmb3VuZC4gVXNlIERpeG1hIHRlbXBsYXRlIGZpbGUgLyBjaGVjayB0aGF0IG5vdGhpbmcgd2FzIGFjY2lkZW50YWxseSBkZWxldGVkIG9yIHJlbmFtZWQuIFNlZSBjb25zb2xlLi4uXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVhY2ggb2YgdGhlIGZvbGxvd2luZyBzaG91bGQgYmUgZGVmaW5lZC5cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGRpeG1hQm9hcmRQYWdlLCBkZWNrUGFnZSwgY29tcG9uZW50c1BhZ2UsIHBsYXllclBhZ2VUZW1wbGF0ZSxcbiAgICAgICAgICAgIGNhcmRQbGF5RnJhbWUsIHBsYXllcnNGcmFtZSwgc3Rvcnl0ZWxsZXJCYWRnZU5vZGVcbiAgICAgICAgfSkuc3BsaXQoJywnKS5qb2luKCdcXG4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuY29uc3QgcGxheWVyc0FyZVJlYWR5ID0gKCkgPT4ge1xuICAgIGxldCBuZXdQbGF5ZXJzID0gW107XG4gICAgcGxheWVyc0ZyYW1lLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIC8vIElnbm9yZSBpbnN0cnVjdGlvbiB0ZXh0IG5vZGVzLCB3ZSBvbmx5IG5lZWQgdG8gbG9vayBhdCB0aGUgcGxheWVyc1xuICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJOYW1lTm9kZSA9IGNoaWxkLmZpbmRDaGlsZCgoZ3JhbmRjaGlsZCkgPT4gZ3JhbmRjaGlsZC5uYW1lID09PSBcInBsYXllciBuYW1lXCIpO1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZSA9IHBsYXllck5hbWVOb2RlLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICBpZiAocGxheWVyTmFtZSAmJiBwbGF5ZXJOYW1lICE9PSBFTVBUWV9QTEFZRVJfU1RSSU5HKSB7XG4gICAgICAgICAgICAgICAgbmV3UGxheWVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcGxheWVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGNoaWxkLm5hbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdQbGF5ZXJzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KCdOZWVkIGF0IGxlYXN0IDQgcGxheWVycyB0byBzdGFydCBhIGdhbWUuJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcGxheWVycyA9IG5ld1BsYXllcnM7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuY29uc3QgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4gPSAoKSA9PiB7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwicGxheWVyc1wiLCBKU09OLnN0cmluZ2lmeShwbGF5ZXJzKSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiZ2FtZVBoYXNlXCIsIGdhbWVQaGFzZSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiY3VycmVudFN0b3J5dGVsbGVySW5kZXhcIiwgYCR7Y3VycmVudFN0b3J5dGVsbGVySW5kZXh9YCk7XG59O1xuY29uc3QgdXBkYXRlUGx1Z2luU3RhdGVGcm9tRG9jdW1lbnQgPSAoKSA9PiB7XG4gICAgY29uc3QgbmV3UGxheWVycyA9IEpTT04ucGFyc2UoZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdwbGF5ZXJzJykpO1xuICAgIGNvbnN0IG5ld0dhbWVQaGFzZSA9IGZpZ21hLnJvb3QuZ2V0UGx1Z2luRGF0YSgnZ2FtZVBoYXNlJyk7XG4gICAgY29uc3QgbmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXggPSBwYXJzZUludChmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ2N1cnJlbnRTdG9yeXRlbGxlckluZGV4JykpO1xuICAgIGlmIChnYW1lUGhhc2UgIT09IG5ld0dhbWVQaGFzZSB8fFxuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCAhPT0gbmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXgpIHtcbiAgICAgICAgZ2FtZVBoYXNlID0gbmV3R2FtZVBoYXNlO1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4O1xuICAgIH1cbiAgICBpZiAoIWRlZXBFcXVhbChwbGF5ZXJzLCBuZXdQbGF5ZXJzKSkge1xuICAgICAgICBwbGF5ZXJzID0gbmV3UGxheWVycztcbiAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgIH1cbiAgICBjb25zdCBwbGF5ZXJzV2l0aFN0YXR1cyA9IGdldFBsYXllcnNXaXRoU3RhdHVzKCk7XG4gICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiAnR0FNRV9TVEFURScsXG4gICAgICAgIHBsYXllcnM6IHBsYXllcnNXaXRoU3RhdHVzLFxuICAgICAgICBnYW1lUGhhc2UsXG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4XG4gICAgfSk7XG59O1xuY29uc3QgcG9wdWxhdGVQbGF5ZXJOb2RlcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJOb2RlcyA9IHBsYXllcnMubWFwKHBsYXllciA9PiB7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IHBsYXllci5uYW1lKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXJkQXJlYSA9IHBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBTZWxlY3Rpb24gQXJlYVwiKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUb2tlbkFyZWEgPSBwYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlRva2VuIFNlbGVjdGlvbiBBcmVhXCIpO1xuICAgICAgICByZXR1cm4geyBwYWdlLCBzZWxlY3RlZENhcmRBcmVhLCBzZWxlY3RlZFRva2VuQXJlYSB9O1xuICAgIH0pO1xufTtcbmNvbnN0IGdldFBsYXllcnNXaXRoU3RhdHVzID0gKCkgPT4ge1xuICAgIHJldHVybiBwbGF5ZXJzLm1hcCgocGxheWVyLCBpKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzU3Rvcnl0ZWxsZXIgPSAoaSA9PT0gY3VycmVudFN0b3J5dGVsbGVySW5kZXgpO1xuICAgICAgICBjb25zdCBwbGF5ZXJOb2RlID0gcGxheWVyTm9kZXNbaV07XG4gICAgICAgIGxldCBzdGF0dXM7XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5QSUNLSU5HKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZENhcmQgPSBwbGF5ZXJOb2RlLnNlbGVjdGVkQ2FyZEFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKTtcbiAgICAgICAgICAgIHN0YXR1cyA9IChzZWxlY3RlZENhcmQgPyBcImRvbmUtd2l0aC1hY3Rpb25cIiA6IFwicGlja2luZy1jYXJkXCIpO1xuICAgICAgICAgICAgaWYgKGlzU3Rvcnl0ZWxsZXIpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSBcInN0b3J5dGVsbGVyLVwiICsgc3RhdHVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5WT1RJTkcpIHtcbiAgICAgICAgICAgIGlmIChpc1N0b3J5dGVsbGVyKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gJ3N0b3J5dGVsbGVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVG9rZW4gPSBwbGF5ZXJOb2RlLnNlbGVjdGVkVG9rZW5BcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9IChzZWxlY3RlZFRva2VuID8gXCJkb25lLXdpdGgtYWN0aW9uXCIgOiBcInZvdGluZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuU0NPUklORykge1xuICAgICAgICAgICAgc3RhdHVzID0gKGlzU3Rvcnl0ZWxsZXIgPyAnc3Rvcnl0ZWxsZXItc2NvcmluZycgOiAnc2NvcmluZycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHBsYXllciksIHsgc3RhdHVzIH0pO1xuICAgIH0pO1xufTtcbmNvbnN0IGNyZWF0ZVBsYXllclBhZ2UgPSAocGxheWVyKSA9PiB7XG4gICAgY29uc3QgcGxheWVyUGFnZSA9IGZpZ21hLmNyZWF0ZVBhZ2UoKTtcbiAgICBwbGF5ZXJQYWdlLnNldFBsdWdpbkRhdGEoJ2lzUGxheWVyUGFnZScsICd0cnVlJyk7XG4gICAgcGxheWVyUGFnZS5uYW1lID0gcGxheWVyLm5hbWU7XG4gICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBjcmVhdGVQbGF5ZXJCb2FyZChwbGF5ZXIpO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQoY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIGN1c3RvbVBsYXllckJvYXJkLmxvY2tlZCA9IHRydWU7XG4gICAgbW92ZVZvdGluZ1Rva2VucyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgc2V0VXBTZWxlY3Rpb25BcmVhcyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgZGVhbEZpcnN0SGFuZChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgcmV0dXJuIHBsYXllclBhZ2U7XG59O1xuY29uc3QgY3JlYXRlUGxheWVyQm9hcmQgPSAocGxheWVyKSA9PiB7XG4gICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBwbGF5ZXJQYWdlVGVtcGxhdGUuY2xvbmUoKTtcbiAgICAvLyBDdXN0b21pemUgcGFnZSB3aXRoIHBsYXllciBuYW1lXG4gICAgY29uc3QgcGxheWVyTmFtZUVsZW1lbnQgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgTmFtZSBUZXh0XCIpO1xuICAgIGZpZ21hXG4gICAgICAgIC5sb2FkRm9udEFzeW5jKHsgZmFtaWx5OiBcIkFtZXJpY2FuIFR5cGV3cml0ZXJcIiwgc3R5bGU6IFwiUmVndWxhclwiIH0pXG4gICAgICAgIC50aGVuKCgpID0+IChwbGF5ZXJOYW1lRWxlbWVudC5jaGFyYWN0ZXJzID0gcGxheWVyLm5hbWUpKTtcbiAgICAvLyBDb3B5IGluIHBsYXllciB0b2tlbiBmcm9tIENvbXBvbmVudHMgUGFnZVxuICAgIGNvbnN0IHBsYXllclRva2Vuc0ZyYW1lID0gY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgVG9rZW5zXCIpO1xuICAgIGNvbnN0IHBsYXllclRva2VuID0gcGxheWVyVG9rZW5zRnJhbWUuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gcGxheWVyLmNvbG9yKS5jbG9uZSgpO1xuICAgIHBsYXllclRva2VuLnJlc2l6ZSg0MCwgNDApO1xuICAgIHBsYXllclRva2VuLnggPSA3ODtcbiAgICBwbGF5ZXJUb2tlbi55ID0gNzg7XG4gICAgY3VzdG9tUGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyVG9rZW4pO1xuICAgIC8vIENoYW5nZSBjb2xvciBvZiB2b3RpbmcgdG9rZW5zXG4gICAgY29uc3Qgdm90aW5nVG9rZW5zID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gVk9USU5HX1RPS0VOU19OQU1FKTtcbiAgICB2b3RpbmdUb2tlbnMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgY29uc3Qgdm90aW5nVG9rZW4gPSBjaGlsZDtcbiAgICAgICAgY29uc3Qgdm90aW5nVG9rZW5GaWxscyA9IGNsb25lKHZvdGluZ1Rva2VuLmZpbGxzKTtcbiAgICAgICAgdm90aW5nVG9rZW5GaWxsc1swXS5jb2xvciA9IGhleFRvUkdCKENPTE9SU19BU19IRVhbcGxheWVyLmNvbG9yXSk7XG4gICAgICAgIHZvdGluZ1Rva2VuLmZpbGxzID0gdm90aW5nVG9rZW5GaWxscztcbiAgICB9KTtcbiAgICByZXR1cm4gY3VzdG9tUGxheWVyQm9hcmQ7XG59O1xuLy8gTW92ZSB0aGUgdm90aW5nIHRva2VucyBvdXQgb2YgdGhlIGNvbXBvbmVudCBzbyB0aGV5IGNhbiBiZSBlYXNpbHkgZHJhZ2dlZFxuY29uc3QgbW92ZVZvdGluZ1Rva2VucyA9IChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkgPT4ge1xuICAgIGNvbnN0IHZvdGluZ1Rva2VucyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBWT1RJTkdfVE9LRU5TX05BTUUpO1xuICAgIGNvbnN0IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uID0gdm90aW5nVG9rZW5zLmFic29sdXRlVHJhbnNmb3JtO1xuICAgIGNvbnN0IHZvdGluZ1Rva2Vuc0Nsb25lID0gdm90aW5nVG9rZW5zLmNsb25lKCk7XG4gICAgdm90aW5nVG9rZW5zLnZpc2libGUgPSBmYWxzZTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHZvdGluZ1Rva2Vuc0Nsb25lKTtcbiAgICB2b3RpbmdUb2tlbnNDbG9uZS52aXNpYmxlID0gdHJ1ZTtcbiAgICB2b3RpbmdUb2tlbnNDbG9uZS54ID0gdm90aW5nVG9rZW5zUG9zaXRpb25bMF1bMl07XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUueSA9IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uWzFdWzJdO1xufTtcbi8vIFNldCB1cCBhcmVhcyBvbiBwbGF5ZXIgYm9hcmQgdG8gc2VsZWN0IGNhcmRzICYgdG9rZW5zIGJ5IGRyb3BwaW5nIHRoZW0gaW4gYSBmcmFtZVxuZnVuY3Rpb24gc2V0VXBTZWxlY3Rpb25BcmVhcyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkge1xuICAgIGNvbnN0IGNhcmRTZWxlY3Rpb25BcmVhID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICBjb25zdCBzZWxlY3RlZENhcmQgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlNlbGVjdGVkIGNhcmRcIik7XG4gICAgY29uc3QgY2FyZEZpbGxzID0gY2xvbmUoY2FyZFNlbGVjdGlvbkFyZWEuZmlsbHMpO1xuICAgIGNhcmRGaWxsc1swXS5vcGFjaXR5ID0gMDtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS5maWxscyA9IGNhcmRGaWxscztcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS5uYW1lID0gXCJDYXJkIFNlbGVjdGlvbiBBcmVhXCI7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEucmVzaXplKHNlbGVjdGVkQ2FyZC53aWR0aCwgc2VsZWN0ZWRDYXJkLmhlaWdodCk7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEueCA9IHNlbGVjdGVkQ2FyZC5hYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS55ID0gc2VsZWN0ZWRDYXJkLmFic29sdXRlVHJhbnNmb3JtWzFdWzJdO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQoY2FyZFNlbGVjdGlvbkFyZWEpO1xuICAgIGNvbnN0IHRva2VuU2VsZWN0aW9uQXJlYSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRUb2tlbiA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU2VsZWN0ZWQgdm90aW5nIHRva2VuXCIpO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5maWxscyA9IGNhcmRGaWxscztcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEubmFtZSA9IFwiVG9rZW4gU2VsZWN0aW9uIEFyZWFcIjtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEuY29ybmVyUmFkaXVzID0gMTA7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLnJlc2l6ZShzZWxlY3RlZFRva2VuLndpZHRoLCBzZWxlY3RlZFRva2VuLmhlaWdodCk7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLnggPSBzZWxlY3RlZFRva2VuLmFic29sdXRlVHJhbnNmb3JtWzBdWzJdO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS55ID0gc2VsZWN0ZWRUb2tlbi5hYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHRva2VuU2VsZWN0aW9uQXJlYSk7XG59XG5jb25zdCBkZWFsRmlyc3RIYW5kID0gKHBsYXllclBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKSA9PiB7XG4gICAgY29uc3QgY2FyZFNsb3RzID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZEFsbCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBJbm5lciBQbGFjZWhvbGRlclwiKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBsZXQgcmFuZG9tSW1hZ2UgPSBnZXRSYW5kb21JbWFnZUZyb21EZWNrKCk7XG4gICAgICAgIGNvbnN0IGNhcmRTbG90ID0gY2FyZFNsb3RzW2ldO1xuICAgICAgICBjb25zdCBjYXJkU2xvdFBvc2l0aW9uID0gY2FyZFNsb3QuYWJzb2x1dGVUcmFuc2Zvcm07XG4gICAgICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQocmFuZG9tSW1hZ2UpO1xuICAgICAgICAvLyBTY2FsZSBpbWFnZSB0byBmaXQgY2FyZCBzbG90c1xuICAgICAgICByYW5kb21JbWFnZSA9IHNjYWxlSW1hZ2UocmFuZG9tSW1hZ2UsIENBUkRfU0laRSwgQ0FSRF9TSVpFKTtcbiAgICAgICAgcmFuZG9tSW1hZ2UueCA9IGNhcmRTbG90UG9zaXRpb25bMF1bMl0gKyBDQVJEX1NMT1RfUEFERElORztcbiAgICAgICAgcmFuZG9tSW1hZ2UueSA9IGNhcmRTbG90UG9zaXRpb25bMV1bMl0gKyBDQVJEX1NMT1RfUEFERElORztcbiAgICAgICAgcmFuZG9tSW1hZ2UubmFtZSA9IENBUkRfTkFNRTtcbiAgICB9XG59O1xuY29uc3QgZGVhbE5ld0NhcmRzID0gKCkgPT4ge1xuICAgIHBsYXllck5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBub2RlLnBhZ2U7XG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGFnZS5maW5kQ2hpbGRyZW4oKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpO1xuICAgICAgICBjb25zdCBjYXJkU2xvdHMgPSBwYWdlLmZpbmRBbGwoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgSW5uZXIgUGxhY2Vob2xkZXJcIik7XG4gICAgICAgIGNhcmRzLmZvckVhY2goKGNhcmQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjYXJkU2xvdCA9IGNhcmRTbG90c1tpbmRleF07XG4gICAgICAgICAgICBjb25zdCBjYXJkU2xvdFBvc2l0aW9uID0gY2FyZFNsb3QuYWJzb2x1dGVUcmFuc2Zvcm07XG4gICAgICAgICAgICBjYXJkLnggPSBjYXJkU2xvdFBvc2l0aW9uWzBdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgICAgICBjYXJkLnkgPSBjYXJkU2xvdFBvc2l0aW9uWzFdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBmaXJzdENhcmRTbG90ID0gY2FyZFNsb3RzWzVdLmFic29sdXRlVHJhbnNmb3JtO1xuICAgICAgICBsZXQgbmV3SW1hZ2UgPSBnZXRSYW5kb21JbWFnZUZyb21EZWNrKCk7XG4gICAgICAgIHBhZ2UuYXBwZW5kQ2hpbGQobmV3SW1hZ2UpO1xuICAgICAgICBuZXdJbWFnZSA9IHNjYWxlSW1hZ2UobmV3SW1hZ2UsIENBUkRfU0laRSwgQ0FSRF9TSVpFKTtcbiAgICAgICAgbmV3SW1hZ2UueCA9IGZpcnN0Q2FyZFNsb3RbMF1bMl0gKyBDQVJEX1NMT1RfUEFERElORztcbiAgICAgICAgbmV3SW1hZ2UueSA9IGZpcnN0Q2FyZFNsb3RbMV1bMl0gKyBDQVJEX1NMT1RfUEFERElORztcbiAgICAgICAgbmV3SW1hZ2UubmFtZSA9IENBUkRfTkFNRTtcbiAgICB9KTtcbn07XG5jb25zdCBnZXRSYW5kb21JbWFnZUZyb21EZWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IGRlY2tJbWFnZXMgPSBkZWNrUGFnZS5jaGlsZHJlbjtcbiAgICBsZXQgcmFuZG9tSW1hZ2UgPSBkZWNrSW1hZ2VzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRlY2tJbWFnZXMubGVuZ3RoKV07XG4gICAgaWYgKHJhbmRvbUltYWdlLmdldFBsdWdpbkRhdGEoXCJkZWFsdFwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmFuZG9tSW1hZ2UgPSBnZXRSYW5kb21JbWFnZUZyb21EZWNrKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByYW5kb21JbWFnZS5zZXRQbHVnaW5EYXRhKFwiZGVhbHRcIiwgXCJ0cnVlXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcmFuZG9tSW1hZ2UuY2xvbmUoKTtcbn07XG5jb25zdCBtb3ZlQ2FyZHNUb0dhbWVCb2FyZCA9ICgpID0+IHtcbiAgICBsZXQgY2FyZHNUb01vdmUgPSBwbGF5ZXJOb2Rlcy5tYXAobm9kZSA9PiBub2RlLnNlbGVjdGVkQ2FyZEFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKSk7XG4gICAgbGV0IGFsbFBsYXllcnNBcmVSZWFkeSA9IHRydWU7XG4gICAgbGV0IHNodWZmbGVkSW5kaWNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FyZHNUb01vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2h1ZmZsZWRJbmRpY2VzLnB1c2goaSk7XG4gICAgICAgIGlmICghY2FyZHNUb01vdmVbaV0pIHtcbiAgICAgICAgICAgIGFsbFBsYXllcnNBcmVSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2h1ZmZsZWRJbmRpY2VzID0gc2h1ZmZsZUFycmF5KHNodWZmbGVkSW5kaWNlcyk7XG4gICAgaWYgKGFsbFBsYXllcnNBcmVSZWFkeSkge1xuICAgICAgICBjYXJkc1RvTW92ZS5mb3JFYWNoKChzZWxlY3RlZENhcmQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBwbGFjZUNhcmRJbkdhbWVCb2FyZChzZWxlY3RlZENhcmQsIHNodWZmbGVkSW5kaWNlc1tpbmRleF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlZPVElORztcbiAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIk5vdCBhbGwgcGxheWVycyBoYXZlIHNlbGVjdGVkIGEgY2FyZC5cIik7XG4gICAgfVxufTtcbmNvbnN0IG1vdmVUb2tlbnNUb0dhbWVCb2FyZCA9ICgpID0+IHtcbiAgICBjb25zdCB0b2tlbnNUb01vdmUgPSBbXTtcbiAgICBsZXQgYWxsUmVhZHkgPSB0cnVlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVyTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID09PSBpKVxuICAgICAgICAgICAgY29udGludWU7IC8vIHN0b3J5dGVsbGVyIGRvZXMgbm90IHZvdGVcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUb2tlbkFyZWEgPSBwbGF5ZXJOb2Rlc1tpXS5zZWxlY3RlZFRva2VuQXJlYTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBzZWxlY3RlZFRva2VuQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgICB0b2tlbnNUb01vdmUucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhbGxSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFsbFJlYWR5KSB7XG4gICAgICAgIHRva2Vuc1RvTW92ZS5mb3JFYWNoKCh0b2tlbiwgaSkgPT4geyBwbGFjZVRva2VuSW5HYW1lQm9hcmQodG9rZW4sIGkpOyB9KTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlNDT1JJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJOb3QgYWxsIHBsYXllcnMgaGF2ZSB2b3RlZC5cIik7XG4gICAgfVxufTtcbmNvbnN0IENBUkRTX1hfT0ZGU0VUID0gNjU7XG5jb25zdCBDQVJEU19ZX09GRlNFVCA9IDkwO1xuY29uc3QgQ0FSRFNfQ09MX1dJRFRIID0gMTg4O1xuY29uc3QgQ0FSRFNfUk9XX0hFSUdIVCA9IDIyMDtcbmNvbnN0IENBUkRTX1NJWkUgPSAxNjA7XG5jb25zdCBwbGFjZUNhcmRJbkdhbWVCb2FyZCA9IChjYXJkLCBjYXJkSW5kZXgpID0+IHtcbiAgICBjYXJkLnggPSBDQVJEU19YX09GRlNFVCArIChjYXJkSW5kZXggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArIChDQVJEU19TSVpFIC0gY2FyZC53aWR0aCkgLyAyO1xuICAgIGNhcmQueSA9XG4gICAgICAgIENBUkRTX1lfT0ZGU0VUICtcbiAgICAgICAgICAgIE1hdGguZmxvb3IoY2FyZEluZGV4IC8gNCkgKiBDQVJEU19ST1dfSEVJR0hUICtcbiAgICAgICAgICAgIChDQVJEU19TSVpFIC0gY2FyZC5oZWlnaHQpIC8gMjtcbiAgICBjYXJkUGxheUZyYW1lLmFwcGVuZENoaWxkKGNhcmQpO1xufTtcbmNvbnN0IHBsYWNlVG9rZW5JbkdhbWVCb2FyZCA9ICh0b2tlbiwgaSkgPT4ge1xuICAgIGNvbnN0IHZvdGVJZHggPSBwYXJzZUludCh0b2tlbi5jaGlsZHJlblswXS5jaGFyYWN0ZXJzKSAtIDE7XG4gICAgdG9rZW4ueCA9IENBUkRTX1hfT0ZGU0VUICsgKHZvdGVJZHggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArICgyMCAqIChpICUgNykpO1xuICAgIHRva2VuLnkgPSAoQ0FSRFNfWV9PRkZTRVQgKyBNYXRoLmZsb29yKHZvdGVJZHggLyA0KSAqIENBUkRTX1JPV19IRUlHSFQgKyAoMjAgKiBpKSkgLSAoODAgKiBNYXRoLmZsb29yKGkgLyA3KSk7XG4gICAgY2FyZFBsYXlGcmFtZS5hcHBlbmRDaGlsZCh0b2tlbik7XG59O1xuY29uc3QgZGVsZXRlUGxheWVyUGFnZXMgPSAoKSA9PiB7XG4gICAgZmlnbWEucm9vdC5jaGlsZHJlbi5mb3JFYWNoKHBhZ2UgPT4ge1xuICAgICAgICBpZiAocGFnZS5nZXRQbHVnaW5EYXRhKFwiaXNQbGF5ZXJQYWdlXCIpID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYWdlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KGBDb3VsZCBub3QgcmVtb3ZlIHBsYXllciBwYWdlOiAke3BhZ2UubmFtZX0g4oCTPiBUcnkgYWdhaW4gb3IgcmVtb3ZlIG1hbnVhbGx5LmApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb3VsZCBub3QgcmVtb3ZlIHBsYXllciBwYWdlOiAke3BhZ2UubmFtZX0g4oCTPiBUcnkgYWdhaW4gb3IgcmVtb3ZlIG1hbnVhbGx5LmApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmNvbnN0IGNsZWFyQ2FyZHNGcm9tUGxheUFyZWEgPSAoKSA9PiB7XG4gICAgY2FyZFBsYXlGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICBpZiAoY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKSB7XG4gICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmNvbnN0IHJlc2V0VG9rZW5zID0gKCkgPT4ge1xuICAgIGNvbnN0IHRva2Vuc09uQm9hcmQgPSBjYXJkUGxheUZyYW1lLmZpbmRBbGwoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICB0b2tlbnNPbkJvYXJkLmZvckVhY2godG9rZW4gPT4geyB0b2tlbi5yZW1vdmUoKTsgfSk7XG4gICAgcGxheWVyTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgY29uc3QgcGFnZSA9IG5vZGUucGFnZTtcbiAgICAgICAgY29uc3QgVm90aW5nVG9rZW5zRnJhbWVzID0gcGFnZS5maW5kQ2hpbGRyZW4oY2hpbGQgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5zXCIpO1xuICAgICAgICBWb3RpbmdUb2tlbnNGcmFtZXMuZm9yRWFjaChmcmFtZSA9PiB7IGZyYW1lLnJlbW92ZSgpOyB9KTtcbiAgICAgICAgY29uc3QgdG9rZW5zSW5Vc2UgPSBwYWdlLmZpbmRBbGwoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICAgICAgdG9rZW5zSW5Vc2UuZm9yRWFjaCh0b2tlbiA9PiB7XG4gICAgICAgICAgICBpZiAodG9rZW4ucGFyZW50LnR5cGUgPT09ICdQQUdFJyB8fCB0b2tlbi5wYXJlbnQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRva2VuLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBwYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFBhZ2UgVGVtcGxhdGVcIik7XG4gICAgICAgIG1vdmVWb3RpbmdUb2tlbnMocGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIH0pO1xufTtcbmNvbnN0IG5leHRTdG9yeXRlbGxlciA9ICgpID0+IHtcbiAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IChjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCArIDEpICUgcGxheWVycy5sZW5ndGg7XG59O1xuY29uc3QgcmVzZXREZWFsdENhcmRzID0gKCkgPT4ge1xuICAgIGRlY2tQYWdlLmNoaWxkcmVuLmZvckVhY2goKGltYWdlKSA9PiBpbWFnZS5zZXRQbHVnaW5EYXRhKFwiZGVhbHRcIiwgXCJmYWxzZVwiKSk7XG59O1xuY29uc3QgY2xlYXJQbGF5ZXJOYW1lcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJzRnJhbWUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgLy8gSWdub3JlIGluc3RydWN0aW9uIHRleHQgbm9kZXMsIHdlIG9ubHkgbmVlZCB0byBsb29rIGF0IHRoZSBwbGF5ZXJzXG4gICAgICAgIGlmIChjaGlsZC50eXBlID09PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWUgPSBjaGlsZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcInBsYXllciBuYW1lXCIpO1xuICAgICAgICAgICAgZmlnbWFcbiAgICAgICAgICAgICAgICAubG9hZEZvbnRBc3luYyh7IGZhbWlseTogXCJSb2JvdG8gU2xhYlwiLCBzdHlsZTogXCJSZWd1bGFyXCIgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiAocGxheWVyTmFtZS5jaGFyYWN0ZXJzID0gRU1QVFlfUExBWUVSX1NUUklORykpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuY29uc3QgcmVzZXRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5OT19HQU1FO1xuICAgIHBsYXllcnMgPSBbXTtcbiAgICBwbGF5ZXJOb2RlcyA9IFtdO1xuICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gMDtcbiAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIGNsZWFyQ2FyZHNGcm9tUGxheUFyZWEoKTtcbiAgICBkZWxldGVQbGF5ZXJQYWdlcygpO1xuICAgIHJlc2V0RGVhbHRDYXJkcygpO1xufTtcbi8vIFJVTlMgT04gTEFVTkNIIC0gY2hlY2sgZm9yIGdhbWUgc3RhdGUgZXZlcnkgc2Vjb25kXG5pZiAocGllY2VzQXJlUmVhZHkoKSkge1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICB1cGRhdGVQbHVnaW5TdGF0ZUZyb21Eb2N1bWVudCgpO1xuICAgIH0sIDEwMDApO1xufVxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuY29uc3QgaGV4VG9SR0IgPSAoaGV4KSA9PiB7XG4gICAgY29uc3QgaCA9IChoZXguY2hhckF0KDApID09IFwiI1wiKSA/IGhleC5zdWJzdHJpbmcoMSwgNykgOiBoZXg7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcjogcGFyc2VJbnQoaC5zdWJzdHJpbmcoMCwgMiksIDE2KSAvIDI1NSxcbiAgICAgICAgZzogcGFyc2VJbnQoaC5zdWJzdHJpbmcoMiwgNCksIDE2KSAvIDI1NSxcbiAgICAgICAgYjogcGFyc2VJbnQoaC5zdWJzdHJpbmcoNCwgNiksIDE2KSAvIDI1NVxuICAgIH07XG59O1xuY29uc3QgY2xvbmUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xufTtcbmNvbnN0IHNjYWxlSW1hZ2UgPSAoaW1hZ2UsIG1heFdpZHRoLCBtYXhIZWlnaHQpID0+IHtcbiAgICBpZiAoaW1hZ2Uud2lkdGggPiBtYXhXaWR0aCkge1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBpbWFnZS5oZWlnaHQgLyAoaW1hZ2Uud2lkdGggLyBtYXhXaWR0aCk7XG4gICAgICAgIGlmIChuZXdIZWlnaHQgPiBtYXhIZWlnaHQpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1dpZHRoID0gbWF4V2lkdGggLyAobmV3SGVpZ2h0IC8gbWF4SGVpZ2h0KTtcbiAgICAgICAgICAgIGltYWdlLnJlc2l6ZShuZXdXaWR0aCwgbWF4SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGltYWdlLnJlc2l6ZShtYXhXaWR0aCwgbmV3SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaW1hZ2U7XG59O1xuZnVuY3Rpb24gZGVlcEVxdWFsKG9iamVjdDEsIG9iamVjdDIpIHtcbiAgICBjb25zdCBrZXlzMSA9IE9iamVjdC5rZXlzKG9iamVjdDEpO1xuICAgIGNvbnN0IGtleXMyID0gT2JqZWN0LmtleXMob2JqZWN0Mik7XG4gICAgaWYgKGtleXMxLmxlbmd0aCAhPT0ga2V5czIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5czEpIHtcbiAgICAgICAgY29uc3QgdmFsMSA9IG9iamVjdDFba2V5XTtcbiAgICAgICAgY29uc3QgdmFsMiA9IG9iamVjdDJba2V5XTtcbiAgICAgICAgY29uc3QgYXJlT2JqZWN0cyA9IGlzT2JqZWN0KHZhbDEpICYmIGlzT2JqZWN0KHZhbDIpO1xuICAgICAgICBpZiAoYXJlT2JqZWN0cyAmJiAhZGVlcEVxdWFsKHZhbDEsIHZhbDIpIHx8XG4gICAgICAgICAgICAhYXJlT2JqZWN0cyAmJiB2YWwxICE9PSB2YWwyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBpc09iamVjdChvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCc7XG59XG4vLyAgRHVyc3RlbmZlbGQgU2h1ZmZsZSwgY29waWVkIGZyb20gU3RhY2sgT3ZlcmZsb3dcbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheSkge1xuICAgIGxldCBhcnJheUNvcHkgPSBjbG9uZShhcnJheSk7XG4gICAgZm9yIChsZXQgaSA9IGFycmF5Q29weS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICAgICAgW2FycmF5Q29weVtpXSwgYXJyYXlDb3B5W2pdXSA9IFthcnJheUNvcHlbal0sIGFycmF5Q29weVtpXV07XG4gICAgfVxuICAgIHJldHVybiBhcnJheUNvcHk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9