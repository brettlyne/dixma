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
    // if (msg.type === "testing") {
    // }
    if (msg.type === "start-game") {
        if (gamePhase === PHASES.NO_GAME && piecesAreReady() && playersAreReady()) {
            // start the game
            setupPlayerPiecesOnGameBoard();
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
    if (msg.type === "new-players") {
        const oldPlayerNames = players.map(player => player.name);
        if (playersAreReady()) {
            players.forEach((player, i) => {
                if (oldPlayerNames.indexOf(player.name) === -1) {
                    createPlayerPage(player);
                    addPlayerPiece(player.color);
                    if (i <= currentStorytellerIndex) {
                        nextStoryteller();
                    }
                }
            });
            populatePlayerNodes();
            updateDocumentStateFromPlugin();
        }
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
        scaleImage(randomImage, CARD_SIZE, CARD_SIZE);
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
        scaleImage(newImage, CARD_SIZE, CARD_SIZE);
        newImage.x = firstCardSlot[0][2] + CARD_SLOT_PADDING;
        newImage.y = firstCardSlot[1][2] + CARD_SLOT_PADDING;
        newImage.name = CARD_NAME;
    });
};
const getRandomImageFromDeck = () => {
    const deckImages = deckPage.children;
    let randomImage = deckImages[Math.floor(Math.random() * deckImages.length)];
    if (randomImage.getPluginData("dealt") === "true") {
        return getRandomImageFromDeck();
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
const setupPlayerPiecesOnGameBoard = () => {
    players.forEach(player => {
        addPlayerPiece(player.color);
    });
};
const addPlayerPiece = (color) => {
    const playerPiecesFrame = dixmaBoardPage.findChild((child) => child.name === "Player Pieces");
    const playerPiece = playerPiecesFrame.findChild((child) => child.name === color).clone();
    dixmaBoardPage.appendChild(playerPiece);
    playerPiece.x += playerPiecesFrame.x;
    playerPiece.y += playerPiecesFrame.y;
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
const clearPlayerPiecesFromBoard = () => {
    const playerPieces = dixmaBoardPage.findChildren(c => (PLAYER_ORDER.indexOf(c.name) > -1));
    playerPieces.forEach(piece => { piece.remove(); });
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
    clearPlayerPiecesFromBoard();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJELHdCQUF3QjtBQUNuRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixvQkFBb0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsNENBQTRDO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLG9CQUFvQjtBQUN2QztBQUNBO0FBQ0E7QUFDQSwwREFBMEQ7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2REFBNkQsWUFBWSxTQUFTO0FBQ2xGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixrREFBa0Q7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE9BQU87QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHdCQUF3QjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQix3QkFBd0I7QUFDM0M7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLGlDQUFpQyxFQUFFO0FBQy9FO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQThELFVBQVU7QUFDeEUsNkRBQTZELFVBQVU7QUFDdkU7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxnQkFBZ0IsRUFBRTtBQUN0RDtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsZ0JBQWdCLEVBQUU7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxnQkFBZ0IsRUFBRTtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQywwQ0FBMEM7QUFDMUU7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsT0FBTztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmZpZ21hLnVpLnJlc2l6ZSgzMjAsIDY2MCk7XG4vLyB2YXJpYWJsZXMgdG8gc3RvcmUgZ2FtZSBwaWVjZSBub2RlcyAocGFnZXMsZnJhbWVzLGV0YylcbmxldCBkaXhtYUJvYXJkUGFnZTtcbmxldCBkZWNrUGFnZTtcbmxldCBjb21wb25lbnRzUGFnZTtcbmxldCBwbGF5ZXJQYWdlVGVtcGxhdGU7XG5sZXQgY2FyZFBsYXlGcmFtZTtcbmxldCBwbGF5ZXJzRnJhbWU7XG5sZXQgc3Rvcnl0ZWxsZXJCYWRnZU5vZGU7XG4vLyBjb25zdGFudHNcbmNvbnN0IFBIQVNFUyA9IHtcbiAgICBQSUVDRVNfTUlTU0lORzogXCJyZXF1aXJlZCBnYW1lIGVsZW1lbnRzIG5vdCBwcmVzZW50IGluIGZpbGVcIixcbiAgICBOT19HQU1FOiBcIm5vIGFjdGl2ZSBnYW1lXCIsXG4gICAgUElDS0lORzogXCJwbGF5ZXJzIGFyZSBwaWNraW5nIGNhcmRzXCIsXG4gICAgVk9USU5HOiBcInBsYXllcnMgYXJlIHZvdGluZ1wiLFxuICAgIFNDT1JJTkc6IFwicGxheWVycyBhcmUgbW92aW5nIHRoZWlyIHRva2VucyBvbiB0aGUgc2NvcmUgdHJhY2tpbmcgYm9hcmRcIlxufTtcbmNvbnN0IEVNUFRZX1BMQVlFUl9TVFJJTkcgPSBcIn4gfiB+IH4gfiB+IH4gflwiO1xuY29uc3QgUExBWUVSX09SREVSID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwiZ29sZFwiLCBcImxpbWVcIiwgXCJncmVlblwiLCBcInR1cnF1b2lzZVwiLCBcImJsdWVcIiwgXCJ2aW9sZXRcIiwgXCJwdXJwbGVcIiwgXCJibGFja1wiLCBcInNpbHZlclwiLCBcIndoaXRlXCJdO1xuY29uc3QgQ09MT1JTX0FTX0hFWCA9IHtcbiAgICByZWQ6IFwiRkYwMDAwXCIsIG9yYW5nZTogXCJGRjgwMEFcIiwgZ29sZDogXCJGRkQ3MDBcIiwgbGltZTogXCJCREZGMDBcIixcbiAgICBncmVlbjogXCIwMDgwMDBcIiwgdHVycXVvaXNlOiBcIjQwRTBEMFwiLCBibHVlOiBcIjAwMDBDRFwiLCB2aW9sZXQ6IFwiRUU4MkVFXCIsXG4gICAgcHVycGxlOiBcIjgwMDA4MFwiLCBibGFjazogXCIwMDAwMDBcIiwgc2lsdmVyOiBcIkMwQzBDMFwiLCB3aGl0ZTogXCJGRkZGRkZcIlxufTtcbmNvbnN0IFZPVElOR19UT0tFTlNfTkFNRSA9IFwiVm90aW5nIFRva2Vuc1wiO1xuY29uc3QgQ0FSRF9OQU1FID0gXCJDYXJkXCI7XG5jb25zdCBDQVJEX1NMT1RfUEFERElORyA9IDU7XG5jb25zdCBDQVJEX1NJWkUgPSAxNTA7XG4vLyBnYW1lIHN0YXRlIHZhcmlhYmxlc1xubGV0IHBsYXllcnMgPSBbXTtcbmxldCBwbGF5ZXJOb2RlcyA9IFtdO1xubGV0IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gMDsgLy8gcGxheWVyIGluZGV4IG9mIGN1cnJlbnQgc3Rvcnl0ZWxsZXJcbmxldCBnYW1lUGhhc2UgPSBQSEFTRVMuTk9fR0FNRTtcbi8vIGhhbmRsZSBtZXNzYWdlcyBmcm9tIHBsdWdpbiBVSVxuZmlnbWEudWkub25tZXNzYWdlID0gKG1zZykgPT4ge1xuICAgIHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50KCk7XG4gICAgLy8gaWYgKG1zZy50eXBlID09PSBcInRlc3RpbmdcIikge1xuICAgIC8vIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwic3RhcnQtZ2FtZVwiKSB7XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5OT19HQU1FICYmIHBpZWNlc0FyZVJlYWR5KCkgJiYgcGxheWVyc0FyZVJlYWR5KCkpIHtcbiAgICAgICAgICAgIC8vIHN0YXJ0IHRoZSBnYW1lXG4gICAgICAgICAgICBzZXR1cFBsYXllclBpZWNlc09uR2FtZUJvYXJkKCk7XG4gICAgICAgICAgICBnYW1lUGhhc2UgPSBQSEFTRVMuUElDS0lORztcbiAgICAgICAgICAgIG5leHRTdG9yeXRlbGxlcigwKTtcbiAgICAgICAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgICAgIGNyZWF0ZVBsYXllclBhZ2UocGxheWVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLWNhcmRzXCIgJiYgZ2FtZVBoYXNlID09PSBQSEFTRVMuUElDS0lORykge1xuICAgICAgICBtb3ZlQ2FyZHNUb0dhbWVCb2FyZCgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLXRva2Vuc1wiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlZPVElORykge1xuICAgICAgICBtb3ZlVG9rZW5zVG9HYW1lQm9hcmQoKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcIm5ldy1yb3VuZFwiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlNDT1JJTkcpIHtcbiAgICAgICAgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSgpO1xuICAgICAgICBkZWFsTmV3Q2FyZHMoKTtcbiAgICAgICAgcmVzZXRUb2tlbnMoKTtcbiAgICAgICAgbmV4dFN0b3J5dGVsbGVyKCk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5QSUNLSU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwibmV3LXBsYXllcnNcIikge1xuICAgICAgICBjb25zdCBvbGRQbGF5ZXJOYW1lcyA9IHBsYXllcnMubWFwKHBsYXllciA9PiBwbGF5ZXIubmFtZSk7XG4gICAgICAgIGlmIChwbGF5ZXJzQXJlUmVhZHkoKSkge1xuICAgICAgICAgICAgcGxheWVycy5mb3JFYWNoKChwbGF5ZXIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob2xkUGxheWVyTmFtZXMuaW5kZXhPZihwbGF5ZXIubmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVBsYXllclBhZ2UocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgYWRkUGxheWVyUGllY2UocGxheWVyLmNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPD0gY3VycmVudFN0b3J5dGVsbGVySW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRTdG9yeXRlbGxlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwb3B1bGF0ZVBsYXllck5vZGVzKCk7XG4gICAgICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXNldC1nYW1lXCIpIHtcbiAgICAgICAgcmVzZXRHYW1lKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXNldC1nYW1lLWFuZC1jbGVhci1wbGF5ZXJzXCIpIHtcbiAgICAgICAgcmVzZXRHYW1lKCk7XG4gICAgICAgIGNsZWFyUGxheWVyTmFtZXMoKTtcbiAgICB9XG59O1xuY29uc3QgcGllY2VzQXJlUmVhZHkgPSAoKSA9PiB7XG4gICAgZGl4bWFCb2FyZFBhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiRGl4bWEgQm9hcmRcIik7XG4gICAgZGVja1BhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiRGVja1wiKTtcbiAgICBjb21wb25lbnRzUGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDb21wb25lbnRzXCIpO1xuICAgIHBsYXllclBhZ2VUZW1wbGF0ZSA9IGNvbXBvbmVudHNQYWdlICYmIGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFBhZ2UgVGVtcGxhdGVcIik7XG4gICAgY2FyZFBsYXlGcmFtZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBQbGF5IEFyZWFcIik7XG4gICAgcGxheWVyc0ZyYW1lID0gZGl4bWFCb2FyZFBhZ2UgJiYgZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXJzXCIpO1xuICAgIHN0b3J5dGVsbGVyQmFkZ2VOb2RlID0gZGl4bWFCb2FyZFBhZ2UgJiYgZGl4bWFCb2FyZFBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU3Rvcnl0ZWxsZXIgQmFkZ2VcIik7XG4gICAgaWYgKCEoZGl4bWFCb2FyZFBhZ2UgJiYgZGVja1BhZ2UgJiYgY29tcG9uZW50c1BhZ2UgJiYgcGxheWVyUGFnZVRlbXBsYXRlICYmIGNhcmRQbGF5RnJhbWUgJiYgcGxheWVyc0ZyYW1lICYmIHN0b3J5dGVsbGVyQmFkZ2VOb2RlKSkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJHYW1lIHBpZWNlIG5vdCBmb3VuZC4gVXNlIERpeG1hIHRlbXBsYXRlIGZpbGUgLyBjaGVjayB0aGF0IG5vdGhpbmcgd2FzIGFjY2lkZW50YWxseSBkZWxldGVkIG9yIHJlbmFtZWQuIFNlZSBjb25zb2xlLi4uXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVhY2ggb2YgdGhlIGZvbGxvd2luZyBzaG91bGQgYmUgZGVmaW5lZC5cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGRpeG1hQm9hcmRQYWdlLCBkZWNrUGFnZSwgY29tcG9uZW50c1BhZ2UsIHBsYXllclBhZ2VUZW1wbGF0ZSxcbiAgICAgICAgICAgIGNhcmRQbGF5RnJhbWUsIHBsYXllcnNGcmFtZSwgc3Rvcnl0ZWxsZXJCYWRnZU5vZGVcbiAgICAgICAgfSkuc3BsaXQoJywnKS5qb2luKCdcXG4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuY29uc3QgcGxheWVyc0FyZVJlYWR5ID0gKCkgPT4ge1xuICAgIGxldCBuZXdQbGF5ZXJzID0gW107XG4gICAgcGxheWVyc0ZyYW1lLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIC8vIElnbm9yZSBpbnN0cnVjdGlvbiB0ZXh0IG5vZGVzLCB3ZSBvbmx5IG5lZWQgdG8gbG9vayBhdCB0aGUgcGxheWVyc1xuICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJOYW1lTm9kZSA9IGNoaWxkLmZpbmRDaGlsZCgoZ3JhbmRjaGlsZCkgPT4gZ3JhbmRjaGlsZC5uYW1lID09PSBcInBsYXllciBuYW1lXCIpO1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZSA9IHBsYXllck5hbWVOb2RlLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICBpZiAocGxheWVyTmFtZSAmJiBwbGF5ZXJOYW1lICE9PSBFTVBUWV9QTEFZRVJfU1RSSU5HKSB7XG4gICAgICAgICAgICAgICAgbmV3UGxheWVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcGxheWVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGNoaWxkLm5hbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdQbGF5ZXJzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KCdOZWVkIGF0IGxlYXN0IDQgcGxheWVycyB0byBzdGFydCBhIGdhbWUuJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcGxheWVyTmFtZXMgPSBuZXdQbGF5ZXJzLm1hcChwbGF5ZXIgPT4gcGxheWVyLm5hbWUpO1xuICAgIGlmIChwbGF5ZXJOYW1lcy5sZW5ndGggIT09IG5ldyBTZXQocGxheWVyTmFtZXMpLnNpemUpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KCdEdXBsaWNhdGUgbmFtZXMgbm90IGFsbG93ZWQuJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcGxheWVycyA9IG5ld1BsYXllcnM7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuY29uc3QgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4gPSAoKSA9PiB7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwicGxheWVyc1wiLCBKU09OLnN0cmluZ2lmeShwbGF5ZXJzKSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiZ2FtZVBoYXNlXCIsIGdhbWVQaGFzZSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiY3VycmVudFN0b3J5dGVsbGVySW5kZXhcIiwgYCR7Y3VycmVudFN0b3J5dGVsbGVySW5kZXh9YCk7XG59O1xuY29uc3QgdXBkYXRlUGx1Z2luU3RhdGVGcm9tRG9jdW1lbnQgPSAoKSA9PiB7XG4gICAgY29uc3QgbmV3UGxheWVycyA9IEpTT04ucGFyc2UoZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdwbGF5ZXJzJykpO1xuICAgIGNvbnN0IG5ld0dhbWVQaGFzZSA9IGZpZ21hLnJvb3QuZ2V0UGx1Z2luRGF0YSgnZ2FtZVBoYXNlJyk7XG4gICAgY29uc3QgbmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXggPSBwYXJzZUludChmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ2N1cnJlbnRTdG9yeXRlbGxlckluZGV4JykpO1xuICAgIGlmIChnYW1lUGhhc2UgIT09IG5ld0dhbWVQaGFzZSB8fFxuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCAhPT0gbmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXgpIHtcbiAgICAgICAgZ2FtZVBoYXNlID0gbmV3R2FtZVBoYXNlO1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4O1xuICAgIH1cbiAgICBpZiAoIWRlZXBFcXVhbChwbGF5ZXJzLCBuZXdQbGF5ZXJzKSkge1xuICAgICAgICBwbGF5ZXJzID0gbmV3UGxheWVycztcbiAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgIH1cbiAgICBjb25zdCBwbGF5ZXJzV2l0aFN0YXR1cyA9IGdldFBsYXllcnNXaXRoU3RhdHVzKCk7XG4gICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiAnR0FNRV9TVEFURScsXG4gICAgICAgIHBsYXllcnM6IHBsYXllcnNXaXRoU3RhdHVzLFxuICAgICAgICBnYW1lUGhhc2UsXG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4XG4gICAgfSk7XG59O1xuY29uc3QgcG9wdWxhdGVQbGF5ZXJOb2RlcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJOb2RlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBwbGF5ZXJzW2ldO1xuICAgICAgICBjb25zdCBwYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBwbGF5ZXIubmFtZSk7XG4gICAgICAgIGlmICghcGFnZSkge1xuICAgICAgICAgICAgcGxheWVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgICAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXJkQXJlYSA9IHBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBTZWxlY3Rpb24gQXJlYVwiKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUb2tlbkFyZWEgPSBwYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlRva2VuIFNlbGVjdGlvbiBBcmVhXCIpO1xuICAgICAgICBwbGF5ZXJOb2Rlcy5wdXNoKHsgcGFnZSwgc2VsZWN0ZWRDYXJkQXJlYSwgc2VsZWN0ZWRUb2tlbkFyZWEgfSk7XG4gICAgfVxufTtcbmNvbnN0IGdldFBsYXllcnNXaXRoU3RhdHVzID0gKCkgPT4ge1xuICAgIGNvbnN0IHBsYXllcnNXaXRoU3RhdHVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IHBsYXllcnNbaV07XG4gICAgICAgIGNvbnN0IGlzU3Rvcnl0ZWxsZXIgPSAoaSA9PT0gY3VycmVudFN0b3J5dGVsbGVySW5kZXgpO1xuICAgICAgICBjb25zdCBwbGF5ZXJOb2RlID0gcGxheWVyTm9kZXNbaV07XG4gICAgICAgIGlmICghcGxheWVyTm9kZS5wYWdlIHx8IHBsYXllck5vZGUucGFnZS5yZW1vdmVkKSB7IC8vIHBhZ2UgaGFzIGJlZW4gZGVsZXRlZCAtPiByZW1vdmUgcGxheWVyXG4gICAgICAgICAgICBwbGF5ZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgICAgICAgICBwb3B1bGF0ZVBsYXllck5vZGVzKCk7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UGxheWVyc1dpdGhTdGF0dXMoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc3RhdHVzO1xuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuUElDS0lORykge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gcGxheWVyTm9kZS5zZWxlY3RlZENhcmRBcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSk7XG4gICAgICAgICAgICBzdGF0dXMgPSAoc2VsZWN0ZWRDYXJkID8gXCJkb25lLXdpdGgtYWN0aW9uXCIgOiBcInBpY2tpbmctY2FyZFwiKTtcbiAgICAgICAgICAgIGlmIChpc1N0b3J5dGVsbGVyKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gXCJzdG9yeXRlbGxlci1cIiArIHN0YXR1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuVk9USU5HKSB7XG4gICAgICAgICAgICBpZiAoaXNTdG9yeXRlbGxlcikge1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdzdG9yeXRlbGxlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRva2VuID0gcGxheWVyTm9kZS5zZWxlY3RlZFRva2VuQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAoc2VsZWN0ZWRUb2tlbiA/IFwiZG9uZS13aXRoLWFjdGlvblwiIDogXCJ2b3RpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLlNDT1JJTkcpIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IChpc1N0b3J5dGVsbGVyID8gJ3N0b3J5dGVsbGVyLXNjb3JpbmcnIDogJ3Njb3JpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBwbGF5ZXJzV2l0aFN0YXR1cy5wdXNoKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcGxheWVyKSwgeyBzdGF0dXMgfSkpO1xuICAgIH1cbiAgICA7XG4gICAgcmV0dXJuIHBsYXllcnNXaXRoU3RhdHVzO1xufTtcbmNvbnN0IGNyZWF0ZVBsYXllclBhZ2UgPSAocGxheWVyKSA9PiB7XG4gICAgY29uc3QgcGxheWVyUGFnZSA9IGZpZ21hLmNyZWF0ZVBhZ2UoKTtcbiAgICBwbGF5ZXJQYWdlLnNldFBsdWdpbkRhdGEoJ2lzUGxheWVyUGFnZScsICd0cnVlJyk7XG4gICAgcGxheWVyUGFnZS5uYW1lID0gcGxheWVyLm5hbWU7XG4gICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBjcmVhdGVQbGF5ZXJCb2FyZChwbGF5ZXIpO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQoY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIGN1c3RvbVBsYXllckJvYXJkLmxvY2tlZCA9IHRydWU7XG4gICAgbW92ZVZvdGluZ1Rva2VucyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgc2V0VXBTZWxlY3Rpb25BcmVhcyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgZGVhbEZpcnN0SGFuZChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgcmV0dXJuIHBsYXllclBhZ2U7XG59O1xuY29uc3QgY3JlYXRlUGxheWVyQm9hcmQgPSAocGxheWVyKSA9PiB7XG4gICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBwbGF5ZXJQYWdlVGVtcGxhdGUuY2xvbmUoKTtcbiAgICAvLyBDdXN0b21pemUgcGFnZSB3aXRoIHBsYXllciBuYW1lXG4gICAgY29uc3QgcGxheWVyTmFtZUVsZW1lbnQgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgTmFtZSBUZXh0XCIpO1xuICAgIGZpZ21hXG4gICAgICAgIC5sb2FkRm9udEFzeW5jKHsgZmFtaWx5OiBcIkFtZXJpY2FuIFR5cGV3cml0ZXJcIiwgc3R5bGU6IFwiUmVndWxhclwiIH0pXG4gICAgICAgIC50aGVuKCgpID0+IChwbGF5ZXJOYW1lRWxlbWVudC5jaGFyYWN0ZXJzID0gcGxheWVyLm5hbWUpKTtcbiAgICAvLyBDb3B5IGluIHBsYXllciB0b2tlbiBmcm9tIENvbXBvbmVudHMgUGFnZVxuICAgIGNvbnN0IHBsYXllclRva2Vuc0ZyYW1lID0gY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgVG9rZW5zXCIpO1xuICAgIGNvbnN0IHBsYXllclRva2VuID0gcGxheWVyVG9rZW5zRnJhbWUuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gcGxheWVyLmNvbG9yKS5jbG9uZSgpO1xuICAgIHBsYXllclRva2VuLnJlc2l6ZSg0MCwgNDApO1xuICAgIHBsYXllclRva2VuLnggPSA3ODtcbiAgICBwbGF5ZXJUb2tlbi55ID0gNzg7XG4gICAgY3VzdG9tUGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyVG9rZW4pO1xuICAgIC8vIENoYW5nZSBjb2xvciBvZiB2b3RpbmcgdG9rZW5zXG4gICAgY29uc3Qgdm90aW5nVG9rZW5zID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gVk9USU5HX1RPS0VOU19OQU1FKTtcbiAgICB2b3RpbmdUb2tlbnMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgY29uc3Qgdm90aW5nVG9rZW4gPSBjaGlsZDtcbiAgICAgICAgY29uc3Qgdm90aW5nVG9rZW5GaWxscyA9IGNsb25lKHZvdGluZ1Rva2VuLmZpbGxzKTtcbiAgICAgICAgdm90aW5nVG9rZW5GaWxsc1swXS5jb2xvciA9IGhleFRvUkdCKENPTE9SU19BU19IRVhbcGxheWVyLmNvbG9yXSk7XG4gICAgICAgIHZvdGluZ1Rva2VuLmZpbGxzID0gdm90aW5nVG9rZW5GaWxscztcbiAgICB9KTtcbiAgICByZXR1cm4gY3VzdG9tUGxheWVyQm9hcmQ7XG59O1xuLy8gTW92ZSB0aGUgdm90aW5nIHRva2VucyBvdXQgb2YgdGhlIGNvbXBvbmVudCBzbyB0aGV5IGNhbiBiZSBlYXNpbHkgZHJhZ2dlZFxuY29uc3QgbW92ZVZvdGluZ1Rva2VucyA9IChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkgPT4ge1xuICAgIGNvbnN0IHZvdGluZ1Rva2VucyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBWT1RJTkdfVE9LRU5TX05BTUUpO1xuICAgIGNvbnN0IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uID0gdm90aW5nVG9rZW5zLmFic29sdXRlVHJhbnNmb3JtO1xuICAgIGNvbnN0IHZvdGluZ1Rva2Vuc0Nsb25lID0gdm90aW5nVG9rZW5zLmNsb25lKCk7XG4gICAgdm90aW5nVG9rZW5zLnZpc2libGUgPSBmYWxzZTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHZvdGluZ1Rva2Vuc0Nsb25lKTtcbiAgICB2b3RpbmdUb2tlbnNDbG9uZS52aXNpYmxlID0gdHJ1ZTtcbiAgICB2b3RpbmdUb2tlbnNDbG9uZS54ID0gdm90aW5nVG9rZW5zUG9zaXRpb25bMF1bMl07XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUueSA9IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uWzFdWzJdO1xufTtcbi8vIFNldCB1cCBhcmVhcyBvbiBwbGF5ZXIgYm9hcmQgdG8gc2VsZWN0IGNhcmRzICYgdG9rZW5zIGJ5IGRyb3BwaW5nIHRoZW0gaW4gYSBmcmFtZVxuZnVuY3Rpb24gc2V0VXBTZWxlY3Rpb25BcmVhcyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkge1xuICAgIGNvbnN0IGNhcmRTZWxlY3Rpb25BcmVhID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICBjb25zdCBzZWxlY3RlZENhcmQgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlNlbGVjdGVkIGNhcmRcIik7XG4gICAgY29uc3QgY2FyZEZpbGxzID0gY2xvbmUoY2FyZFNlbGVjdGlvbkFyZWEuZmlsbHMpO1xuICAgIGNhcmRGaWxsc1swXS5vcGFjaXR5ID0gMDtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS5maWxscyA9IGNhcmRGaWxscztcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS5uYW1lID0gXCJDYXJkIFNlbGVjdGlvbiBBcmVhXCI7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEucmVzaXplKHNlbGVjdGVkQ2FyZC53aWR0aCwgc2VsZWN0ZWRDYXJkLmhlaWdodCk7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEueCA9IHNlbGVjdGVkQ2FyZC5hYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS55ID0gc2VsZWN0ZWRDYXJkLmFic29sdXRlVHJhbnNmb3JtWzFdWzJdO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQoY2FyZFNlbGVjdGlvbkFyZWEpO1xuICAgIGNvbnN0IHRva2VuU2VsZWN0aW9uQXJlYSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRUb2tlbiA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU2VsZWN0ZWQgdm90aW5nIHRva2VuXCIpO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5maWxscyA9IGNhcmRGaWxscztcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEubmFtZSA9IFwiVG9rZW4gU2VsZWN0aW9uIEFyZWFcIjtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEuY29ybmVyUmFkaXVzID0gMTA7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLnJlc2l6ZShzZWxlY3RlZFRva2VuLndpZHRoLCBzZWxlY3RlZFRva2VuLmhlaWdodCk7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLnggPSBzZWxlY3RlZFRva2VuLmFic29sdXRlVHJhbnNmb3JtWzBdWzJdO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS55ID0gc2VsZWN0ZWRUb2tlbi5hYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHRva2VuU2VsZWN0aW9uQXJlYSk7XG59XG5jb25zdCBkZWFsRmlyc3RIYW5kID0gKHBsYXllclBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKSA9PiB7XG4gICAgY29uc3QgY2FyZFNsb3RzID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZEFsbCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBJbm5lciBQbGFjZWhvbGRlclwiKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBsZXQgcmFuZG9tSW1hZ2UgPSBnZXRSYW5kb21JbWFnZUZyb21EZWNrKCk7XG4gICAgICAgIGNvbnN0IGNhcmRTbG90ID0gY2FyZFNsb3RzW2ldO1xuICAgICAgICBjb25zdCBjYXJkU2xvdFBvc2l0aW9uID0gY2FyZFNsb3QuYWJzb2x1dGVUcmFuc2Zvcm07XG4gICAgICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQocmFuZG9tSW1hZ2UpO1xuICAgICAgICAvLyBTY2FsZSBpbWFnZSB0byBmaXQgY2FyZCBzbG90c1xuICAgICAgICBzY2FsZUltYWdlKHJhbmRvbUltYWdlLCBDQVJEX1NJWkUsIENBUkRfU0laRSk7XG4gICAgICAgIHJhbmRvbUltYWdlLnggPSBjYXJkU2xvdFBvc2l0aW9uWzBdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIHJhbmRvbUltYWdlLnkgPSBjYXJkU2xvdFBvc2l0aW9uWzFdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIHJhbmRvbUltYWdlLm5hbWUgPSBDQVJEX05BTUU7XG4gICAgfVxufTtcbmNvbnN0IGRlYWxOZXdDYXJkcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBjb25zdCBwYWdlID0gbm9kZS5wYWdlO1xuICAgICAgICBjb25zdCBjYXJkcyA9IHBhZ2UuZmluZENoaWxkcmVuKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKTtcbiAgICAgICAgY29uc3QgY2FyZFNsb3RzID0gcGFnZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDYXJkIElubmVyIFBsYWNlaG9sZGVyXCIpO1xuICAgICAgICBjYXJkcy5mb3JFYWNoKChjYXJkLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2FyZFNsb3QgPSBjYXJkU2xvdHNbaW5kZXhdO1xuICAgICAgICAgICAgY29uc3QgY2FyZFNsb3RQb3NpdGlvbiA9IGNhcmRTbG90LmFic29sdXRlVHJhbnNmb3JtO1xuICAgICAgICAgICAgY2FyZC54ID0gY2FyZFNsb3RQb3NpdGlvblswXVsyXSArIENBUkRfU0xPVF9QQURESU5HO1xuICAgICAgICAgICAgY2FyZC55ID0gY2FyZFNsb3RQb3NpdGlvblsxXVsyXSArIENBUkRfU0xPVF9QQURESU5HO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgZmlyc3RDYXJkU2xvdCA9IGNhcmRTbG90c1s1XS5hYnNvbHV0ZVRyYW5zZm9ybTtcbiAgICAgICAgbGV0IG5ld0ltYWdlID0gZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjaygpO1xuICAgICAgICBwYWdlLmFwcGVuZENoaWxkKG5ld0ltYWdlKTtcbiAgICAgICAgc2NhbGVJbWFnZShuZXdJbWFnZSwgQ0FSRF9TSVpFLCBDQVJEX1NJWkUpO1xuICAgICAgICBuZXdJbWFnZS54ID0gZmlyc3RDYXJkU2xvdFswXVsyXSArIENBUkRfU0xPVF9QQURESU5HO1xuICAgICAgICBuZXdJbWFnZS55ID0gZmlyc3RDYXJkU2xvdFsxXVsyXSArIENBUkRfU0xPVF9QQURESU5HO1xuICAgICAgICBuZXdJbWFnZS5uYW1lID0gQ0FSRF9OQU1FO1xuICAgIH0pO1xufTtcbmNvbnN0IGdldFJhbmRvbUltYWdlRnJvbURlY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgZGVja0ltYWdlcyA9IGRlY2tQYWdlLmNoaWxkcmVuO1xuICAgIGxldCByYW5kb21JbWFnZSA9IGRlY2tJbWFnZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGVja0ltYWdlcy5sZW5ndGgpXTtcbiAgICBpZiAocmFuZG9tSW1hZ2UuZ2V0UGx1Z2luRGF0YShcImRlYWx0XCIpID09PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjaygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmFuZG9tSW1hZ2Uuc2V0UGx1Z2luRGF0YShcImRlYWx0XCIsIFwidHJ1ZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmRvbUltYWdlLmNsb25lKCk7XG59O1xuY29uc3QgbW92ZUNhcmRzVG9HYW1lQm9hcmQgPSAoKSA9PiB7XG4gICAgbGV0IGNhcmRzVG9Nb3ZlID0gcGxheWVyTm9kZXMubWFwKG5vZGUgPT4gbm9kZS5zZWxlY3RlZENhcmRBcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSkpO1xuICAgIGxldCBhbGxQbGF5ZXJzQXJlUmVhZHkgPSB0cnVlO1xuICAgIGxldCBzaHVmZmxlZEluZGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhcmRzVG9Nb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNodWZmbGVkSW5kaWNlcy5wdXNoKGkpO1xuICAgICAgICBpZiAoIWNhcmRzVG9Nb3ZlW2ldKSB7XG4gICAgICAgICAgICBhbGxQbGF5ZXJzQXJlUmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNodWZmbGVkSW5kaWNlcyA9IHNodWZmbGVBcnJheShzaHVmZmxlZEluZGljZXMpO1xuICAgIGlmIChhbGxQbGF5ZXJzQXJlUmVhZHkpIHtcbiAgICAgICAgY2FyZHNUb01vdmUuZm9yRWFjaCgoc2VsZWN0ZWRDYXJkLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcGxhY2VDYXJkSW5HYW1lQm9hcmQoc2VsZWN0ZWRDYXJkLCBzaHVmZmxlZEluZGljZXNbaW5kZXhdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5WT1RJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJOb3QgYWxsIHBsYXllcnMgaGF2ZSBzZWxlY3RlZCBhIGNhcmQuXCIpO1xuICAgIH1cbn07XG5jb25zdCBtb3ZlVG9rZW5zVG9HYW1lQm9hcmQgPSAoKSA9PiB7XG4gICAgY29uc3QgdG9rZW5zVG9Nb3ZlID0gW107XG4gICAgbGV0IGFsbFJlYWR5ID0gdHJ1ZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllck5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9PT0gaSlcbiAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBzdG9yeXRlbGxlciBkb2VzIG5vdCB2b3RlXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVG9rZW5BcmVhID0gcGxheWVyTm9kZXNbaV0uc2VsZWN0ZWRUb2tlbkFyZWE7XG4gICAgICAgIGNvbnN0IHRva2VuID0gc2VsZWN0ZWRUb2tlbkFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgIHRva2VuLnNldFBsdWdpbkRhdGEoXCJjb2xvclwiLCBwbGF5ZXJzW2ldLmNvbG9yKTtcbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgICB0b2tlbnNUb01vdmUucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhbGxSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFsbFJlYWR5KSB7XG4gICAgICAgIHRva2Vuc1RvTW92ZS5mb3JFYWNoKCh0b2tlbiwgaSkgPT4geyBwbGFjZVRva2VuSW5HYW1lQm9hcmQodG9rZW4sIGkpOyB9KTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlNDT1JJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJOb3QgYWxsIHBsYXllcnMgaGF2ZSB2b3RlZC5cIik7XG4gICAgfVxufTtcbmNvbnN0IENBUkRTX1hfT0ZGU0VUID0gNjU7XG5jb25zdCBDQVJEU19ZX09GRlNFVCA9IDkwO1xuY29uc3QgQ0FSRFNfQ09MX1dJRFRIID0gMTg4O1xuY29uc3QgQ0FSRFNfUk9XX0hFSUdIVCA9IDIyMDtcbmNvbnN0IENBUkRTX1NJWkUgPSAxNjA7XG5jb25zdCBwbGFjZUNhcmRJbkdhbWVCb2FyZCA9IChjYXJkLCBjYXJkSW5kZXgpID0+IHtcbiAgICBjYXJkLnggPSBDQVJEU19YX09GRlNFVCArIChjYXJkSW5kZXggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArIChDQVJEU19TSVpFIC0gY2FyZC53aWR0aCkgLyAyO1xuICAgIGNhcmQueSA9XG4gICAgICAgIENBUkRTX1lfT0ZGU0VUICtcbiAgICAgICAgICAgIE1hdGguZmxvb3IoY2FyZEluZGV4IC8gNCkgKiBDQVJEU19ST1dfSEVJR0hUICtcbiAgICAgICAgICAgIChDQVJEU19TSVpFIC0gY2FyZC5oZWlnaHQpIC8gMjtcbiAgICBjYXJkUGxheUZyYW1lLmFwcGVuZENoaWxkKGNhcmQpO1xufTtcbmNvbnN0IHBsYWNlVG9rZW5JbkdhbWVCb2FyZCA9ICh0b2tlbiwgaSkgPT4ge1xuICAgIGNvbnN0IHZvdGVJZHggPSBwYXJzZUludCh0b2tlbi5jaGlsZHJlblswXS5jaGFyYWN0ZXJzKSAtIDE7XG4gICAgdG9rZW4ueCA9IENBUkRTX1hfT0ZGU0VUICsgKHZvdGVJZHggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArICgyMCAqIChpICUgNykpO1xuICAgIHRva2VuLnkgPSAoQ0FSRFNfWV9PRkZTRVQgKyBNYXRoLmZsb29yKHZvdGVJZHggLyA0KSAqIENBUkRTX1JPV19IRUlHSFQgKyAoMjAgKiBpKSkgLSAoODAgKiBNYXRoLmZsb29yKGkgLyA3KSk7XG4gICAgY29uc3QgY29sb3IgPSB0b2tlbi5nZXRQbHVnaW5EYXRhKFwiY29sb3JcIik7XG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICAgIC8vIENvcHkgaW4gcGxheWVyIHRva2VuIGZyb20gQ29tcG9uZW50cyBQYWdlXG4gICAgICAgIGNvbnN0IHBsYXllclRva2Vuc0ZyYW1lID0gY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgVG9rZW5zXCIpO1xuICAgICAgICBjb25zdCBwbGF5ZXJUb2tlbiA9IHBsYXllclRva2Vuc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IGNvbG9yKS5jbG9uZSgpO1xuICAgICAgICBwbGF5ZXJUb2tlbi5yZXNpemUoMzYsIDM2KTtcbiAgICAgICAgcGxheWVyVG9rZW4ueCA9IDI7XG4gICAgICAgIHBsYXllclRva2VuLnkgPSAyO1xuICAgICAgICB0b2tlbi5hcHBlbmRDaGlsZChwbGF5ZXJUb2tlbik7XG4gICAgfVxuICAgIGNhcmRQbGF5RnJhbWUuYXBwZW5kQ2hpbGQodG9rZW4pO1xufTtcbmNvbnN0IGRlbGV0ZVBsYXllclBhZ2VzID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3QuY2hpbGRyZW4uZm9yRWFjaChwYWdlID0+IHtcbiAgICAgICAgaWYgKHBhZ2UuZ2V0UGx1Z2luRGF0YShcImlzUGxheWVyUGFnZVwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGFnZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgQ291bGQgbm90IHJlbW92ZSBwbGF5ZXIgcGFnZTogJHtwYWdlLm5hbWV9IOKAkz4gVHJ5IGFnYWluIG9yIHJlbW92ZSBtYW51YWxseS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ291bGQgbm90IHJlbW92ZSBwbGF5ZXIgcGFnZTogJHtwYWdlLm5hbWV9IOKAkz4gVHJ5IGFnYWluIG9yIHJlbW92ZSBtYW51YWxseS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCBjbGVhckNhcmRzRnJvbVBsYXlBcmVhID0gKCkgPT4ge1xuICAgIGNhcmRQbGF5RnJhbWUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSkge1xuICAgICAgICAgICAgY2hpbGQucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCBzZXR1cFBsYXllclBpZWNlc09uR2FtZUJvYXJkID0gKCkgPT4ge1xuICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBhZGRQbGF5ZXJQaWVjZShwbGF5ZXIuY29sb3IpO1xuICAgIH0pO1xufTtcbmNvbnN0IGFkZFBsYXllclBpZWNlID0gKGNvbG9yKSA9PiB7XG4gICAgY29uc3QgcGxheWVyUGllY2VzRnJhbWUgPSBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQaWVjZXNcIik7XG4gICAgY29uc3QgcGxheWVyUGllY2UgPSBwbGF5ZXJQaWVjZXNGcmFtZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBjb2xvcikuY2xvbmUoKTtcbiAgICBkaXhtYUJvYXJkUGFnZS5hcHBlbmRDaGlsZChwbGF5ZXJQaWVjZSk7XG4gICAgcGxheWVyUGllY2UueCArPSBwbGF5ZXJQaWVjZXNGcmFtZS54O1xuICAgIHBsYXllclBpZWNlLnkgKz0gcGxheWVyUGllY2VzRnJhbWUueTtcbn07XG5jb25zdCByZXNldFRva2VucyA9ICgpID0+IHtcbiAgICBjb25zdCB0b2tlbnNPbkJvYXJkID0gY2FyZFBsYXlGcmFtZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgdG9rZW5zT25Cb2FyZC5mb3JFYWNoKHRva2VuID0+IHsgdG9rZW4ucmVtb3ZlKCk7IH0pO1xuICAgIHBsYXllck5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBub2RlLnBhZ2U7XG4gICAgICAgIGNvbnN0IFZvdGluZ1Rva2Vuc0ZyYW1lcyA9IHBhZ2UuZmluZENoaWxkcmVuKGNoaWxkID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2Vuc1wiKTtcbiAgICAgICAgVm90aW5nVG9rZW5zRnJhbWVzLmZvckVhY2goZnJhbWUgPT4geyBmcmFtZS5yZW1vdmUoKTsgfSk7XG4gICAgICAgIGNvbnN0IHRva2Vuc0luVXNlID0gcGFnZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgIHRva2Vuc0luVXNlLmZvckVhY2godG9rZW4gPT4ge1xuICAgICAgICAgICAgaWYgKHRva2VuLnBhcmVudC50eXBlID09PSAnUEFHRScgfHwgdG9rZW4ucGFyZW50LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0b2tlbi5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gcGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQYWdlIFRlbXBsYXRlXCIpO1xuICAgICAgICBtb3ZlVm90aW5nVG9rZW5zKHBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICB9KTtcbn07XG5jb25zdCBuZXh0U3Rvcnl0ZWxsZXIgPSAobmV3U3Rvcnl0ZWxsZXIpID0+IHtcbiAgICBpZiAodHlwZW9mIG5ld1N0b3J5dGVsbGVyID09ICdudW1iZXInKSB7XG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gbmV3U3Rvcnl0ZWxsZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IChjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCArIDEpICUgcGxheWVycy5sZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IGN1cnJDb2xvciA9IHBsYXllcnNbY3VycmVudFN0b3J5dGVsbGVySW5kZXhdLmNvbG9yO1xuICAgIGNvbnN0IHN0b3J5dGVsbGVyVG9rZW4gPSBkaXhtYUJvYXJkUGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTdG9yeXRlbGxlciBCYWRnZVwiKTtcbiAgICBjb25zdCBzdG9yeXRlbGxlcklkeCA9IFBMQVlFUl9PUkRFUi5pbmRleE9mKGN1cnJDb2xvcik7XG4gICAgc3Rvcnl0ZWxsZXJUb2tlbi55ID0gMTAyICsgNDQgKiBzdG9yeXRlbGxlcklkeDtcbn07XG5jb25zdCByZXNldERlYWx0Q2FyZHMgPSAoKSA9PiB7XG4gICAgZGVja1BhZ2UuY2hpbGRyZW4uZm9yRWFjaCgoaW1hZ2UpID0+IGltYWdlLnNldFBsdWdpbkRhdGEoXCJkZWFsdFwiLCBcImZhbHNlXCIpKTtcbn07XG5jb25zdCBjbGVhclBsYXllclBpZWNlc0Zyb21Cb2FyZCA9ICgpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJQaWVjZXMgPSBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGRyZW4oYyA9PiAoUExBWUVSX09SREVSLmluZGV4T2YoYy5uYW1lKSA+IC0xKSk7XG4gICAgcGxheWVyUGllY2VzLmZvckVhY2gocGllY2UgPT4geyBwaWVjZS5yZW1vdmUoKTsgfSk7XG59O1xuY29uc3QgY2xlYXJQbGF5ZXJOYW1lcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJzRnJhbWUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgLy8gSWdub3JlIGluc3RydWN0aW9uIHRleHQgbm9kZXMsIHdlIG9ubHkgbmVlZCB0byBsb29rIGF0IHRoZSBwbGF5ZXJzXG4gICAgICAgIGlmIChjaGlsZC50eXBlID09PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWUgPSBjaGlsZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcInBsYXllciBuYW1lXCIpO1xuICAgICAgICAgICAgZmlnbWFcbiAgICAgICAgICAgICAgICAubG9hZEZvbnRBc3luYyh7IGZhbWlseTogXCJSb2JvdG8gU2xhYlwiLCBzdHlsZTogXCJSZWd1bGFyXCIgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiAocGxheWVyTmFtZS5jaGFyYWN0ZXJzID0gRU1QVFlfUExBWUVSX1NUUklORykpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuY29uc3QgcmVzZXRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5OT19HQU1FO1xuICAgIHBsYXllcnMgPSBbXTtcbiAgICBwbGF5ZXJOb2RlcyA9IFtdO1xuICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gMDtcbiAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIGNsZWFyQ2FyZHNGcm9tUGxheUFyZWEoKTtcbiAgICBkZWxldGVQbGF5ZXJQYWdlcygpO1xuICAgIHJlc2V0RGVhbHRDYXJkcygpO1xuICAgIGNsZWFyUGxheWVyUGllY2VzRnJvbUJvYXJkKCk7XG59O1xuLy8gUlVOUyBPTiBMQVVOQ0ggLSBjaGVjayBmb3IgZ2FtZSBzdGF0ZSBldmVyeSBzZWNvbmRcbmlmIChwaWVjZXNBcmVSZWFkeSgpKSB7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50KCk7XG4gICAgfSwgMTAwMCk7XG59XG4vLyBIRUxQRVIgRlVOQ1RJT05TXG5jb25zdCBoZXhUb1JHQiA9IChoZXgpID0+IHtcbiAgICBjb25zdCBoID0gKGhleC5jaGFyQXQoMCkgPT0gXCIjXCIpID8gaGV4LnN1YnN0cmluZygxLCA3KSA6IGhleDtcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChoLnN1YnN0cmluZygwLCAyKSwgMTYpIC8gMjU1LFxuICAgICAgICBnOiBwYXJzZUludChoLnN1YnN0cmluZygyLCA0KSwgMTYpIC8gMjU1LFxuICAgICAgICBiOiBwYXJzZUludChoLnN1YnN0cmluZyg0LCA2KSwgMTYpIC8gMjU1XG4gICAgfTtcbn07XG5jb25zdCBjbG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG59O1xuY29uc3Qgc2NhbGVJbWFnZSA9IChpbWFnZSwgbWF4V2lkdGgsIG1heEhlaWdodCkgPT4ge1xuICAgIGlmIChpbWFnZS53aWR0aCA+IG1heFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IGltYWdlLmhlaWdodCAvIChpbWFnZS53aWR0aCAvIG1heFdpZHRoKTtcbiAgICAgICAgaWYgKG5ld0hlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgICAgICAgY29uc3QgbmV3V2lkdGggPSBtYXhXaWR0aCAvIChuZXdIZWlnaHQgLyBtYXhIZWlnaHQpO1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG5ld1dpZHRoLCBtYXhIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG1heFdpZHRoLCBuZXdIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufTtcbmZ1bmN0aW9uIGRlZXBFcXVhbChvYmplY3QxLCBvYmplY3QyKSB7XG4gICAgY29uc3Qga2V5czEgPSBPYmplY3Qua2V5cyhvYmplY3QxKTtcbiAgICBjb25zdCBrZXlzMiA9IE9iamVjdC5rZXlzKG9iamVjdDIpO1xuICAgIGlmIChrZXlzMS5sZW5ndGggIT09IGtleXMyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMxKSB7XG4gICAgICAgIGNvbnN0IHZhbDEgPSBvYmplY3QxW2tleV07XG4gICAgICAgIGNvbnN0IHZhbDIgPSBvYmplY3QyW2tleV07XG4gICAgICAgIGNvbnN0IGFyZU9iamVjdHMgPSBpc09iamVjdCh2YWwxKSAmJiBpc09iamVjdCh2YWwyKTtcbiAgICAgICAgaWYgKGFyZU9iamVjdHMgJiYgIWRlZXBFcXVhbCh2YWwxLCB2YWwyKSB8fFxuICAgICAgICAgICAgIWFyZU9iamVjdHMgJiYgdmFsMSAhPT0gdmFsMikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gaXNPYmplY3Qob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnO1xufVxuLy8gIER1cnN0ZW5mZWxkIFNodWZmbGUsIGNvcGllZCBmcm9tIFN0YWNrIE92ZXJmbG93XG5mdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyYXkpIHtcbiAgICBsZXQgYXJyYXlDb3B5ID0gY2xvbmUoYXJyYXkpO1xuICAgIGZvciAobGV0IGkgPSBhcnJheUNvcHkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgICAgICBjb25zdCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgIFthcnJheUNvcHlbaV0sIGFycmF5Q29weVtqXV0gPSBbYXJyYXlDb3B5W2pdLCBhcnJheUNvcHlbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXlDb3B5O1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==