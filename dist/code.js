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
    }
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
            dealCards();
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
        dealCards();
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
                    figma.notify(`${player.name} will get cards at the beginning of the next round.`);
                    createPlayerPage(player);
                    addPlayerPiece(player.color);
                    if (i <= currentStorytellerIndex) {
                        nextStoryteller();
                    }
                }
            });
            populatePlayerNodes();
            dealCards();
            updateDocumentStateFromPlugin();
        }
    }
    if (msg.type.startsWith('set-storyteller-index-')) {
        const newStoryteller = parseInt(msg.type.replace('set-storyteller-index-', ''));
        if (!isNaN(newStoryteller) && newStoryteller >= 0 && newStoryteller < players.length) {
            nextStoryteller(newStoryteller);
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
const resetDocumentState = () => {
    figma.root.setPluginData("players", JSON.stringify([]));
    figma.root.setPluginData("gamePhase", PHASES.NO_GAME);
    figma.root.setPluginData("currentStorytellerIndex", '0');
};
const updatePluginStateFromDocument = () => {
    const playerData = figma.root.getPluginData('players');
    const newGamePhase = figma.root.getPluginData('gamePhase');
    if (!playerData || !newGamePhase) {
        resetDocumentState();
        return;
    }
    const newPlayers = JSON.parse(playerData);
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
            removePlayerByIndex(i);
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
            removePlayerByIndex(i);
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
// called to remove a player from the game state (probably because they no longer have a player page)
const removePlayerByIndex = (i) => {
    players.splice(i, 1);
    if (i < currentStorytellerIndex) {
        nextStoryteller(currentStorytellerIndex - 1);
    }
    updateDocumentStateFromPlugin();
    populatePlayerNodes();
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
    // dealFirstHand(playerPage, customPlayerBoard);
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
const HAND_X = 87;
const HAND_Y = 316;
const HAND_SPACING = 174;
const dealCards = () => {
    playerNodes.forEach(playerNode => {
        const playerPage = playerNode.page;
        const cards = playerPage.findChildren((child) => child.name === CARD_NAME);
        for (let i = cards.length; i < 6; i++) {
            let randomImage = getRandomImageFromDeck();
            const newCard = componentsPage.findChild((child) => child.name === "CARD_TEMPLATE").clone();
            const imageFill = Object.assign({}, newCard.fills[1]);
            imageFill.imageHash = randomImage.fills[0].imageHash;
            const newFills = [newCard.fills[0], imageFill];
            newCard.fills = newFills;
            newCard.name = CARD_NAME;
            playerPage.appendChild(newCard);
            cards.push(newCard);
        }
        cards.sort((a, b) => (a.x - b.x));
        cards.forEach((card, i) => {
            card.x = HAND_X + i * HAND_SPACING;
            card.y = HAND_Y;
        });
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
    return randomImage;
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
    resetTokens();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLE9BQU87QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvY29kZS50c1wiKTtcbiIsImZpZ21hLnNob3dVSShfX2h0bWxfXyk7XG5maWdtYS51aS5yZXNpemUoMzIwLCA2NjApO1xuLy8gdmFyaWFibGVzIHRvIHN0b3JlIGdhbWUgcGllY2Ugbm9kZXMgKHBhZ2VzLGZyYW1lcyxldGMpXG5sZXQgZGl4bWFCb2FyZFBhZ2U7XG5sZXQgZGVja1BhZ2U7XG5sZXQgY29tcG9uZW50c1BhZ2U7XG5sZXQgcGxheWVyUGFnZVRlbXBsYXRlO1xubGV0IGNhcmRQbGF5RnJhbWU7XG5sZXQgcGxheWVyc0ZyYW1lO1xubGV0IHN0b3J5dGVsbGVyQmFkZ2VOb2RlO1xuLy8gY29uc3RhbnRzXG5jb25zdCBQSEFTRVMgPSB7XG4gICAgUElFQ0VTX01JU1NJTkc6IFwicmVxdWlyZWQgZ2FtZSBlbGVtZW50cyBub3QgcHJlc2VudCBpbiBmaWxlXCIsXG4gICAgTk9fR0FNRTogXCJubyBhY3RpdmUgZ2FtZVwiLFxuICAgIFBJQ0tJTkc6IFwicGxheWVycyBhcmUgcGlja2luZyBjYXJkc1wiLFxuICAgIFZPVElORzogXCJwbGF5ZXJzIGFyZSB2b3RpbmdcIixcbiAgICBTQ09SSU5HOiBcInBsYXllcnMgYXJlIG1vdmluZyB0aGVpciB0b2tlbnMgb24gdGhlIHNjb3JlIHRyYWNraW5nIGJvYXJkXCJcbn07XG5jb25zdCBFTVBUWV9QTEFZRVJfU1RSSU5HID0gXCJ+IH4gfiB+IH4gfiB+IH5cIjtcbmNvbnN0IFBMQVlFUl9PUkRFUiA9IFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcImdvbGRcIiwgXCJsaW1lXCIsIFwiZ3JlZW5cIiwgXCJ0dXJxdW9pc2VcIiwgXCJibHVlXCIsIFwidmlvbGV0XCIsIFwicHVycGxlXCIsIFwiYmxhY2tcIiwgXCJzaWx2ZXJcIiwgXCJ3aGl0ZVwiXTtcbmNvbnN0IENPTE9SU19BU19IRVggPSB7XG4gICAgcmVkOiBcIkZGMDAwMFwiLCBvcmFuZ2U6IFwiRkY4MDBBXCIsIGdvbGQ6IFwiRkZENzAwXCIsIGxpbWU6IFwiQkRGRjAwXCIsXG4gICAgZ3JlZW46IFwiMDA4MDAwXCIsIHR1cnF1b2lzZTogXCI0MEUwRDBcIiwgYmx1ZTogXCIwMDAwQ0RcIiwgdmlvbGV0OiBcIkVFODJFRVwiLFxuICAgIHB1cnBsZTogXCI4MDAwODBcIiwgYmxhY2s6IFwiMDAwMDAwXCIsIHNpbHZlcjogXCJDMEMwQzBcIiwgd2hpdGU6IFwiRkZGRkZGXCJcbn07XG5jb25zdCBWT1RJTkdfVE9LRU5TX05BTUUgPSBcIlZvdGluZyBUb2tlbnNcIjtcbmNvbnN0IENBUkRfTkFNRSA9IFwiQ2FyZFwiO1xuY29uc3QgQ0FSRF9TTE9UX1BBRERJTkcgPSA1O1xuY29uc3QgQ0FSRF9TSVpFID0gMTUwO1xuLy8gZ2FtZSBzdGF0ZSB2YXJpYWJsZXNcbmxldCBwbGF5ZXJzID0gW107XG5sZXQgcGxheWVyTm9kZXMgPSBbXTtcbmxldCBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IDA7IC8vIHBsYXllciBpbmRleCBvZiBjdXJyZW50IHN0b3J5dGVsbGVyXG5sZXQgZ2FtZVBoYXNlID0gUEhBU0VTLk5PX0dBTUU7XG4vLyBoYW5kbGUgbWVzc2FnZXMgZnJvbSBwbHVnaW4gVUlcbmZpZ21hLnVpLm9ubWVzc2FnZSA9IChtc2cpID0+IHtcbiAgICB1cGRhdGVQbHVnaW5TdGF0ZUZyb21Eb2N1bWVudCgpO1xuICAgIGlmIChtc2cudHlwZSA9PT0gXCJ0ZXN0aW5nXCIpIHtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInN0YXJ0LWdhbWVcIikge1xuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuTk9fR0FNRSAmJiBwaWVjZXNBcmVSZWFkeSgpICYmIHBsYXllcnNBcmVSZWFkeSgpKSB7XG4gICAgICAgICAgICAvLyBzdGFydCB0aGUgZ2FtZVxuICAgICAgICAgICAgc2V0dXBQbGF5ZXJQaWVjZXNPbkdhbWVCb2FyZCgpO1xuICAgICAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlBJQ0tJTkc7XG4gICAgICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIoMCk7XG4gICAgICAgICAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgICAgICBjcmVhdGVQbGF5ZXJQYWdlKHBsYXllcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICAgICAgICAgIGRlYWxDYXJkcygpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLWNhcmRzXCIgJiYgZ2FtZVBoYXNlID09PSBQSEFTRVMuUElDS0lORykge1xuICAgICAgICBtb3ZlQ2FyZHNUb0dhbWVCb2FyZCgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLXRva2Vuc1wiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlZPVElORykge1xuICAgICAgICBtb3ZlVG9rZW5zVG9HYW1lQm9hcmQoKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcIm5ldy1yb3VuZFwiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlNDT1JJTkcpIHtcbiAgICAgICAgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSgpO1xuICAgICAgICBkZWFsQ2FyZHMoKTtcbiAgICAgICAgcmVzZXRUb2tlbnMoKTtcbiAgICAgICAgbmV4dFN0b3J5dGVsbGVyKCk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5QSUNLSU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwibmV3LXBsYXllcnNcIikge1xuICAgICAgICBjb25zdCBvbGRQbGF5ZXJOYW1lcyA9IHBsYXllcnMubWFwKHBsYXllciA9PiBwbGF5ZXIubmFtZSk7XG4gICAgICAgIGlmIChwbGF5ZXJzQXJlUmVhZHkoKSkge1xuICAgICAgICAgICAgcGxheWVycy5mb3JFYWNoKChwbGF5ZXIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob2xkUGxheWVyTmFtZXMuaW5kZXhPZihwbGF5ZXIubmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgJHtwbGF5ZXIubmFtZX0gd2lsbCBnZXQgY2FyZHMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCByb3VuZC5gKTtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlUGxheWVyUGFnZShwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICBhZGRQbGF5ZXJQaWVjZShwbGF5ZXIuY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8PSBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFN0b3J5dGVsbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICAgICAgICAgIGRlYWxDYXJkcygpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobXNnLnR5cGUuc3RhcnRzV2l0aCgnc2V0LXN0b3J5dGVsbGVyLWluZGV4LScpKSB7XG4gICAgICAgIGNvbnN0IG5ld1N0b3J5dGVsbGVyID0gcGFyc2VJbnQobXNnLnR5cGUucmVwbGFjZSgnc2V0LXN0b3J5dGVsbGVyLWluZGV4LScsICcnKSk7XG4gICAgICAgIGlmICghaXNOYU4obmV3U3Rvcnl0ZWxsZXIpICYmIG5ld1N0b3J5dGVsbGVyID49IDAgJiYgbmV3U3Rvcnl0ZWxsZXIgPCBwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgbmV4dFN0b3J5dGVsbGVyKG5ld1N0b3J5dGVsbGVyKTtcbiAgICAgICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInJlc2V0LWdhbWVcIikge1xuICAgICAgICByZXNldEdhbWUoKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInJlc2V0LWdhbWUtYW5kLWNsZWFyLXBsYXllcnNcIikge1xuICAgICAgICByZXNldEdhbWUoKTtcbiAgICAgICAgY2xlYXJQbGF5ZXJOYW1lcygpO1xuICAgIH1cbn07XG5jb25zdCBwaWVjZXNBcmVSZWFkeSA9ICgpID0+IHtcbiAgICBkaXhtYUJvYXJkUGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJEaXhtYSBCb2FyZFwiKTtcbiAgICBkZWNrUGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJEZWNrXCIpO1xuICAgIGNvbXBvbmVudHNQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNvbXBvbmVudHNcIik7XG4gICAgcGxheWVyUGFnZVRlbXBsYXRlID0gY29tcG9uZW50c1BhZ2UgJiYgY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgUGFnZSBUZW1wbGF0ZVwiKTtcbiAgICBjYXJkUGxheUZyYW1lID0gZGl4bWFCb2FyZFBhZ2UgJiYgZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDYXJkIFBsYXkgQXJlYVwiKTtcbiAgICBwbGF5ZXJzRnJhbWUgPSBkaXhtYUJvYXJkUGFnZSAmJiBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllcnNcIik7XG4gICAgc3Rvcnl0ZWxsZXJCYWRnZU5vZGUgPSBkaXhtYUJvYXJkUGFnZSAmJiBkaXhtYUJvYXJkUGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTdG9yeXRlbGxlciBCYWRnZVwiKTtcbiAgICBpZiAoIShkaXhtYUJvYXJkUGFnZSAmJiBkZWNrUGFnZSAmJiBjb21wb25lbnRzUGFnZSAmJiBwbGF5ZXJQYWdlVGVtcGxhdGUgJiYgY2FyZFBsYXlGcmFtZSAmJiBwbGF5ZXJzRnJhbWUgJiYgc3Rvcnl0ZWxsZXJCYWRnZU5vZGUpKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIkdhbWUgcGllY2Ugbm90IGZvdW5kLiBVc2UgRGl4bWEgdGVtcGxhdGUgZmlsZSAvIGNoZWNrIHRoYXQgbm90aGluZyB3YXMgYWNjaWRlbnRhbGx5IGRlbGV0ZWQgb3IgcmVuYW1lZC4gU2VlIGNvbnNvbGUuLi5cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRWFjaCBvZiB0aGUgZm9sbG93aW5nIHNob3VsZCBiZSBkZWZpbmVkLlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgZGl4bWFCb2FyZFBhZ2UsIGRlY2tQYWdlLCBjb21wb25lbnRzUGFnZSwgcGxheWVyUGFnZVRlbXBsYXRlLFxuICAgICAgICAgICAgY2FyZFBsYXlGcmFtZSwgcGxheWVyc0ZyYW1lLCBzdG9yeXRlbGxlckJhZGdlTm9kZVxuICAgICAgICB9KS5zcGxpdCgnLCcpLmpvaW4oJ1xcbicpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5jb25zdCBwbGF5ZXJzQXJlUmVhZHkgPSAoKSA9PiB7XG4gICAgbGV0IG5ld1BsYXllcnMgPSBbXTtcbiAgICBwbGF5ZXJzRnJhbWUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgLy8gSWdub3JlIGluc3RydWN0aW9uIHRleHQgbm9kZXMsIHdlIG9ubHkgbmVlZCB0byBsb29rIGF0IHRoZSBwbGF5ZXJzXG4gICAgICAgIGlmIChjaGlsZC50eXBlID09PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWVOb2RlID0gY2hpbGQuZmluZENoaWxkKChncmFuZGNoaWxkKSA9PiBncmFuZGNoaWxkLm5hbWUgPT09IFwicGxheWVyIG5hbWVcIik7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJOYW1lID0gcGxheWVyTmFtZU5vZGUuY2hhcmFjdGVycztcbiAgICAgICAgICAgIGlmIChwbGF5ZXJOYW1lICYmIHBsYXllck5hbWUgIT09IEVNUFRZX1BMQVlFUl9TVFJJTkcpIHtcbiAgICAgICAgICAgICAgICBuZXdQbGF5ZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBuYW1lOiBwbGF5ZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogY2hpbGQubmFtZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKG5ld1BsYXllcnMubGVuZ3RoIDwgNCkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoJ05lZWQgYXQgbGVhc3QgNCBwbGF5ZXJzIHRvIHN0YXJ0IGEgZ2FtZS4nKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBwbGF5ZXJOYW1lcyA9IG5ld1BsYXllcnMubWFwKHBsYXllciA9PiBwbGF5ZXIubmFtZSk7XG4gICAgaWYgKHBsYXllck5hbWVzLmxlbmd0aCAhPT0gbmV3IFNldChwbGF5ZXJOYW1lcykuc2l6ZSkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoJ0R1cGxpY2F0ZSBuYW1lcyBub3QgYWxsb3dlZC4nKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBwbGF5ZXJzID0gbmV3UGxheWVycztcbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5jb25zdCB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbiA9ICgpID0+IHtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJwbGF5ZXJzXCIsIEpTT04uc3RyaW5naWZ5KHBsYXllcnMpKTtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJnYW1lUGhhc2VcIiwgZ2FtZVBoYXNlKTtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleFwiLCBgJHtjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleH1gKTtcbn07XG5jb25zdCByZXNldERvY3VtZW50U3RhdGUgPSAoKSA9PiB7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwicGxheWVyc1wiLCBKU09OLnN0cmluZ2lmeShbXSkpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImdhbWVQaGFzZVwiLCBQSEFTRVMuTk9fR0FNRSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiY3VycmVudFN0b3J5dGVsbGVySW5kZXhcIiwgJzAnKTtcbn07XG5jb25zdCB1cGRhdGVQbHVnaW5TdGF0ZUZyb21Eb2N1bWVudCA9ICgpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJEYXRhID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdwbGF5ZXJzJyk7XG4gICAgY29uc3QgbmV3R2FtZVBoYXNlID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdnYW1lUGhhc2UnKTtcbiAgICBpZiAoIXBsYXllckRhdGEgfHwgIW5ld0dhbWVQaGFzZSkge1xuICAgICAgICByZXNldERvY3VtZW50U3RhdGUoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBuZXdQbGF5ZXJzID0gSlNPTi5wYXJzZShwbGF5ZXJEYXRhKTtcbiAgICBjb25zdCBuZXdDdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IHBhcnNlSW50KGZpZ21hLnJvb3QuZ2V0UGx1Z2luRGF0YSgnY3VycmVudFN0b3J5dGVsbGVySW5kZXgnKSk7XG4gICAgaWYgKGdhbWVQaGFzZSAhPT0gbmV3R2FtZVBoYXNlIHx8XG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ICE9PSBuZXdDdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCkge1xuICAgICAgICBnYW1lUGhhc2UgPSBuZXdHYW1lUGhhc2U7XG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gbmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXg7XG4gICAgfVxuICAgIGlmICghZGVlcEVxdWFsKHBsYXllcnMsIG5ld1BsYXllcnMpKSB7XG4gICAgICAgIHBsYXllcnMgPSBuZXdQbGF5ZXJzO1xuICAgICAgICBwb3B1bGF0ZVBsYXllck5vZGVzKCk7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllcnNXaXRoU3RhdHVzID0gZ2V0UGxheWVyc1dpdGhTdGF0dXMoKTtcbiAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7XG4gICAgICAgIHR5cGU6ICdHQU1FX1NUQVRFJyxcbiAgICAgICAgcGxheWVyczogcGxheWVyc1dpdGhTdGF0dXMsXG4gICAgICAgIGdhbWVQaGFzZSxcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXhcbiAgICB9KTtcbn07XG5jb25zdCBwb3B1bGF0ZVBsYXllck5vZGVzID0gKCkgPT4ge1xuICAgIHBsYXllck5vZGVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IHBsYXllcnNbaV07XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IHBsYXllci5uYW1lKTtcbiAgICAgICAgaWYgKCFwYWdlKSB7XG4gICAgICAgICAgICByZW1vdmVQbGF5ZXJCeUluZGV4KGkpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXJkQXJlYSA9IHBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBTZWxlY3Rpb24gQXJlYVwiKTtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUb2tlbkFyZWEgPSBwYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlRva2VuIFNlbGVjdGlvbiBBcmVhXCIpO1xuICAgICAgICBwbGF5ZXJOb2Rlcy5wdXNoKHsgcGFnZSwgc2VsZWN0ZWRDYXJkQXJlYSwgc2VsZWN0ZWRUb2tlbkFyZWEgfSk7XG4gICAgfVxufTtcbmNvbnN0IGdldFBsYXllcnNXaXRoU3RhdHVzID0gKCkgPT4ge1xuICAgIGNvbnN0IHBsYXllcnNXaXRoU3RhdHVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHBsYXllciA9IHBsYXllcnNbaV07XG4gICAgICAgIGNvbnN0IGlzU3Rvcnl0ZWxsZXIgPSAoaSA9PT0gY3VycmVudFN0b3J5dGVsbGVySW5kZXgpO1xuICAgICAgICBjb25zdCBwbGF5ZXJOb2RlID0gcGxheWVyTm9kZXNbaV07XG4gICAgICAgIGlmICghcGxheWVyTm9kZS5wYWdlIHx8IHBsYXllck5vZGUucGFnZS5yZW1vdmVkKSB7IC8vIHBhZ2UgaGFzIGJlZW4gZGVsZXRlZCAtPiByZW1vdmUgcGxheWVyXG4gICAgICAgICAgICByZW1vdmVQbGF5ZXJCeUluZGV4KGkpO1xuICAgICAgICAgICAgcmV0dXJuIGdldFBsYXllcnNXaXRoU3RhdHVzKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHN0YXR1cztcbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLlBJQ0tJTkcpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkQ2FyZCA9IHBsYXllck5vZGUuc2VsZWN0ZWRDYXJkQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpO1xuICAgICAgICAgICAgc3RhdHVzID0gKHNlbGVjdGVkQ2FyZCA/IFwiZG9uZS13aXRoLWFjdGlvblwiIDogXCJwaWNraW5nLWNhcmRcIik7XG4gICAgICAgICAgICBpZiAoaXNTdG9yeXRlbGxlcikge1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9IFwic3Rvcnl0ZWxsZXItXCIgKyBzdGF0dXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLlZPVElORykge1xuICAgICAgICAgICAgaWYgKGlzU3Rvcnl0ZWxsZXIpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAnc3Rvcnl0ZWxsZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRUb2tlbiA9IHBsYXllck5vZGUuc2VsZWN0ZWRUb2tlbkFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gKHNlbGVjdGVkVG9rZW4gPyBcImRvbmUtd2l0aC1hY3Rpb25cIiA6IFwidm90aW5nXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5TQ09SSU5HKSB7XG4gICAgICAgICAgICBzdGF0dXMgPSAoaXNTdG9yeXRlbGxlciA/ICdzdG9yeXRlbGxlci1zY29yaW5nJyA6ICdzY29yaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgcGxheWVyc1dpdGhTdGF0dXMucHVzaChPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIHBsYXllciksIHsgc3RhdHVzIH0pKTtcbiAgICB9XG4gICAgO1xuICAgIHJldHVybiBwbGF5ZXJzV2l0aFN0YXR1cztcbn07XG4vLyBjYWxsZWQgdG8gcmVtb3ZlIGEgcGxheWVyIGZyb20gdGhlIGdhbWUgc3RhdGUgKHByb2JhYmx5IGJlY2F1c2UgdGhleSBubyBsb25nZXIgaGF2ZSBhIHBsYXllciBwYWdlKVxuY29uc3QgcmVtb3ZlUGxheWVyQnlJbmRleCA9IChpKSA9PiB7XG4gICAgcGxheWVycy5zcGxpY2UoaSwgMSk7XG4gICAgaWYgKGkgPCBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCkge1xuICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIoY3VycmVudFN0b3J5dGVsbGVySW5kZXggLSAxKTtcbiAgICB9XG4gICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICBwb3B1bGF0ZVBsYXllck5vZGVzKCk7XG59O1xuY29uc3QgY3JlYXRlUGxheWVyUGFnZSA9IChwbGF5ZXIpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJQYWdlID0gZmlnbWEuY3JlYXRlUGFnZSgpO1xuICAgIHBsYXllclBhZ2Uuc2V0UGx1Z2luRGF0YSgnaXNQbGF5ZXJQYWdlJywgJ3RydWUnKTtcbiAgICBwbGF5ZXJQYWdlLm5hbWUgPSBwbGF5ZXIubmFtZTtcbiAgICBjb25zdCBjdXN0b21QbGF5ZXJCb2FyZCA9IGNyZWF0ZVBsYXllckJvYXJkKHBsYXllcik7XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZChjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgY3VzdG9tUGxheWVyQm9hcmQubG9ja2VkID0gdHJ1ZTtcbiAgICBtb3ZlVm90aW5nVG9rZW5zKHBsYXllclBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICBzZXRVcFNlbGVjdGlvbkFyZWFzKHBsYXllclBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICAvLyBkZWFsRmlyc3RIYW5kKHBsYXllclBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICByZXR1cm4gcGxheWVyUGFnZTtcbn07XG5jb25zdCBjcmVhdGVQbGF5ZXJCb2FyZCA9IChwbGF5ZXIpID0+IHtcbiAgICBjb25zdCBjdXN0b21QbGF5ZXJCb2FyZCA9IHBsYXllclBhZ2VUZW1wbGF0ZS5jbG9uZSgpO1xuICAgIC8vIEN1c3RvbWl6ZSBwYWdlIHdpdGggcGxheWVyIG5hbWVcbiAgICBjb25zdCBwbGF5ZXJOYW1lRWxlbWVudCA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBOYW1lIFRleHRcIik7XG4gICAgZmlnbWFcbiAgICAgICAgLmxvYWRGb250QXN5bmMoeyBmYW1pbHk6IFwiQW1lcmljYW4gVHlwZXdyaXRlclwiLCBzdHlsZTogXCJSZWd1bGFyXCIgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4gKHBsYXllck5hbWVFbGVtZW50LmNoYXJhY3RlcnMgPSBwbGF5ZXIubmFtZSkpO1xuICAgIC8vIENvcHkgaW4gcGxheWVyIHRva2VuIGZyb20gQ29tcG9uZW50cyBQYWdlXG4gICAgY29uc3QgcGxheWVyVG9rZW5zRnJhbWUgPSBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBUb2tlbnNcIik7XG4gICAgY29uc3QgcGxheWVyVG9rZW4gPSBwbGF5ZXJUb2tlbnNGcmFtZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBwbGF5ZXIuY29sb3IpLmNsb25lKCk7XG4gICAgcGxheWVyVG9rZW4ucmVzaXplKDQwLCA0MCk7XG4gICAgcGxheWVyVG9rZW4ueCA9IDc4O1xuICAgIHBsYXllclRva2VuLnkgPSA3ODtcbiAgICBjdXN0b21QbGF5ZXJCb2FyZC5hcHBlbmRDaGlsZChwbGF5ZXJUb2tlbik7XG4gICAgLy8gQ2hhbmdlIGNvbG9yIG9mIHZvdGluZyB0b2tlbnNcbiAgICBjb25zdCB2b3RpbmdUb2tlbnMgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBWT1RJTkdfVE9LRU5TX05BTUUpO1xuICAgIHZvdGluZ1Rva2Vucy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICBjb25zdCB2b3RpbmdUb2tlbiA9IGNoaWxkO1xuICAgICAgICBjb25zdCB2b3RpbmdUb2tlbkZpbGxzID0gY2xvbmUodm90aW5nVG9rZW4uZmlsbHMpO1xuICAgICAgICB2b3RpbmdUb2tlbkZpbGxzWzBdLmNvbG9yID0gaGV4VG9SR0IoQ09MT1JTX0FTX0hFWFtwbGF5ZXIuY29sb3JdKTtcbiAgICAgICAgdm90aW5nVG9rZW4uZmlsbHMgPSB2b3RpbmdUb2tlbkZpbGxzO1xuICAgIH0pO1xuICAgIHJldHVybiBjdXN0b21QbGF5ZXJCb2FyZDtcbn07XG4vLyBNb3ZlIHRoZSB2b3RpbmcgdG9rZW5zIG91dCBvZiB0aGUgY29tcG9uZW50IHNvIHRoZXkgY2FuIGJlIGVhc2lseSBkcmFnZ2VkXG5jb25zdCBtb3ZlVm90aW5nVG9rZW5zID0gKHBsYXllclBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKSA9PiB7XG4gICAgY29uc3Qgdm90aW5nVG9rZW5zID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFZPVElOR19UT0tFTlNfTkFNRSk7XG4gICAgY29uc3Qgdm90aW5nVG9rZW5zUG9zaXRpb24gPSB2b3RpbmdUb2tlbnMuYWJzb2x1dGVUcmFuc2Zvcm07XG4gICAgY29uc3Qgdm90aW5nVG9rZW5zQ2xvbmUgPSB2b3RpbmdUb2tlbnMuY2xvbmUoKTtcbiAgICB2b3RpbmdUb2tlbnMudmlzaWJsZSA9IGZhbHNlO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQodm90aW5nVG9rZW5zQ2xvbmUpO1xuICAgIHZvdGluZ1Rva2Vuc0Nsb25lLnZpc2libGUgPSB0cnVlO1xuICAgIHZvdGluZ1Rva2Vuc0Nsb25lLnggPSB2b3RpbmdUb2tlbnNQb3NpdGlvblswXVsyXTtcbiAgICB2b3RpbmdUb2tlbnNDbG9uZS55ID0gdm90aW5nVG9rZW5zUG9zaXRpb25bMV1bMl07XG59O1xuLy8gU2V0IHVwIGFyZWFzIG9uIHBsYXllciBib2FyZCB0byBzZWxlY3QgY2FyZHMgJiB0b2tlbnMgYnkgZHJvcHBpbmcgdGhlbSBpbiBhIGZyYW1lXG5mdW5jdGlvbiBzZXRVcFNlbGVjdGlvbkFyZWFzKHBsYXllclBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKSB7XG4gICAgY29uc3QgY2FyZFNlbGVjdGlvbkFyZWEgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkQ2FyZCA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU2VsZWN0ZWQgY2FyZFwiKTtcbiAgICBjb25zdCBjYXJkRmlsbHMgPSBjbG9uZShjYXJkU2VsZWN0aW9uQXJlYS5maWxscyk7XG4gICAgY2FyZEZpbGxzWzBdLm9wYWNpdHkgPSAwO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLmZpbGxzID0gY2FyZEZpbGxzO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLm5hbWUgPSBcIkNhcmQgU2VsZWN0aW9uIEFyZWFcIjtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS5yZXNpemUoc2VsZWN0ZWRDYXJkLndpZHRoLCBzZWxlY3RlZENhcmQuaGVpZ2h0KTtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS54ID0gc2VsZWN0ZWRDYXJkLmFic29sdXRlVHJhbnNmb3JtWzBdWzJdO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnkgPSBzZWxlY3RlZENhcmQuYWJzb2x1dGVUcmFuc2Zvcm1bMV1bMl07XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZChjYXJkU2VsZWN0aW9uQXJlYSk7XG4gICAgY29uc3QgdG9rZW5TZWxlY3Rpb25BcmVhID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICBjb25zdCBzZWxlY3RlZFRva2VuID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTZWxlY3RlZCB2b3RpbmcgdG9rZW5cIik7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLmZpbGxzID0gY2FyZEZpbGxzO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5uYW1lID0gXCJUb2tlbiBTZWxlY3Rpb24gQXJlYVwiO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5jb3JuZXJSYWRpdXMgPSAxMDtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEucmVzaXplKHNlbGVjdGVkVG9rZW4ud2lkdGgsIHNlbGVjdGVkVG9rZW4uaGVpZ2h0KTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEueCA9IHNlbGVjdGVkVG9rZW4uYWJzb2x1dGVUcmFuc2Zvcm1bMF1bMl07XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLnkgPSBzZWxlY3RlZFRva2VuLmFic29sdXRlVHJhbnNmb3JtWzFdWzJdO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQodG9rZW5TZWxlY3Rpb25BcmVhKTtcbn1cbmNvbnN0IEhBTkRfWCA9IDg3O1xuY29uc3QgSEFORF9ZID0gMzE2O1xuY29uc3QgSEFORF9TUEFDSU5HID0gMTc0O1xuY29uc3QgZGVhbENhcmRzID0gKCkgPT4ge1xuICAgIHBsYXllck5vZGVzLmZvckVhY2gocGxheWVyTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHBsYXllclBhZ2UgPSBwbGF5ZXJOb2RlLnBhZ2U7XG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGxheWVyUGFnZS5maW5kQ2hpbGRyZW4oKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpO1xuICAgICAgICBmb3IgKGxldCBpID0gY2FyZHMubGVuZ3RoOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgcmFuZG9tSW1hZ2UgPSBnZXRSYW5kb21JbWFnZUZyb21EZWNrKCk7XG4gICAgICAgICAgICBjb25zdCBuZXdDYXJkID0gY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDQVJEX1RFTVBMQVRFXCIpLmNsb25lKCk7XG4gICAgICAgICAgICBjb25zdCBpbWFnZUZpbGwgPSBPYmplY3QuYXNzaWduKHt9LCBuZXdDYXJkLmZpbGxzWzFdKTtcbiAgICAgICAgICAgIGltYWdlRmlsbC5pbWFnZUhhc2ggPSByYW5kb21JbWFnZS5maWxsc1swXS5pbWFnZUhhc2g7XG4gICAgICAgICAgICBjb25zdCBuZXdGaWxscyA9IFtuZXdDYXJkLmZpbGxzWzBdLCBpbWFnZUZpbGxdO1xuICAgICAgICAgICAgbmV3Q2FyZC5maWxscyA9IG5ld0ZpbGxzO1xuICAgICAgICAgICAgbmV3Q2FyZC5uYW1lID0gQ0FSRF9OQU1FO1xuICAgICAgICAgICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZChuZXdDYXJkKTtcbiAgICAgICAgICAgIGNhcmRzLnB1c2gobmV3Q2FyZCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FyZHMuc29ydCgoYSwgYikgPT4gKGEueCAtIGIueCkpO1xuICAgICAgICBjYXJkcy5mb3JFYWNoKChjYXJkLCBpKSA9PiB7XG4gICAgICAgICAgICBjYXJkLnggPSBIQU5EX1ggKyBpICogSEFORF9TUEFDSU5HO1xuICAgICAgICAgICAgY2FyZC55ID0gSEFORF9ZO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5jb25zdCBnZXRSYW5kb21JbWFnZUZyb21EZWNrID0gKCkgPT4ge1xuICAgIGNvbnN0IGRlY2tJbWFnZXMgPSBkZWNrUGFnZS5jaGlsZHJlbjtcbiAgICBsZXQgcmFuZG9tSW1hZ2UgPSBkZWNrSW1hZ2VzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGRlY2tJbWFnZXMubGVuZ3RoKV07XG4gICAgaWYgKHJhbmRvbUltYWdlLmdldFBsdWdpbkRhdGEoXCJkZWFsdFwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgcmV0dXJuIGdldFJhbmRvbUltYWdlRnJvbURlY2soKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJhbmRvbUltYWdlLnNldFBsdWdpbkRhdGEoXCJkZWFsdFwiLCBcInRydWVcIik7XG4gICAgfVxuICAgIHJldHVybiByYW5kb21JbWFnZTtcbn07XG5jb25zdCBtb3ZlQ2FyZHNUb0dhbWVCb2FyZCA9ICgpID0+IHtcbiAgICBsZXQgY2FyZHNUb01vdmUgPSBwbGF5ZXJOb2Rlcy5tYXAobm9kZSA9PiBub2RlLnNlbGVjdGVkQ2FyZEFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKSk7XG4gICAgbGV0IGFsbFBsYXllcnNBcmVSZWFkeSA9IHRydWU7XG4gICAgbGV0IHNodWZmbGVkSW5kaWNlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2FyZHNUb01vdmUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc2h1ZmZsZWRJbmRpY2VzLnB1c2goaSk7XG4gICAgICAgIGlmICghY2FyZHNUb01vdmVbaV0pIHtcbiAgICAgICAgICAgIGFsbFBsYXllcnNBcmVSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2h1ZmZsZWRJbmRpY2VzID0gc2h1ZmZsZUFycmF5KHNodWZmbGVkSW5kaWNlcyk7XG4gICAgaWYgKGFsbFBsYXllcnNBcmVSZWFkeSkge1xuICAgICAgICBjYXJkc1RvTW92ZS5mb3JFYWNoKChzZWxlY3RlZENhcmQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBwbGFjZUNhcmRJbkdhbWVCb2FyZChzZWxlY3RlZENhcmQsIHNodWZmbGVkSW5kaWNlc1tpbmRleF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlZPVElORztcbiAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIk5vdCBhbGwgcGxheWVycyBoYXZlIHNlbGVjdGVkIGEgY2FyZC5cIik7XG4gICAgfVxufTtcbmNvbnN0IG1vdmVUb2tlbnNUb0dhbWVCb2FyZCA9ICgpID0+IHtcbiAgICBjb25zdCB0b2tlbnNUb01vdmUgPSBbXTtcbiAgICBsZXQgYWxsUmVhZHkgPSB0cnVlO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVyTm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID09PSBpKVxuICAgICAgICAgICAgY29udGludWU7IC8vIHN0b3J5dGVsbGVyIGRvZXMgbm90IHZvdGVcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRUb2tlbkFyZWEgPSBwbGF5ZXJOb2Rlc1tpXS5zZWxlY3RlZFRva2VuQXJlYTtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBzZWxlY3RlZFRva2VuQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICAgICAgdG9rZW4uc2V0UGx1Z2luRGF0YShcImNvbG9yXCIsIHBsYXllcnNbaV0uY29sb3IpO1xuICAgICAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgICAgIHRva2Vuc1RvTW92ZS5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGFsbFJlYWR5ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYWxsUmVhZHkpIHtcbiAgICAgICAgdG9rZW5zVG9Nb3ZlLmZvckVhY2goKHRva2VuLCBpKSA9PiB7IHBsYWNlVG9rZW5JbkdhbWVCb2FyZCh0b2tlbiwgaSk7IH0pO1xuICAgICAgICBnYW1lUGhhc2UgPSBQSEFTRVMuU0NPUklORztcbiAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIk5vdCBhbGwgcGxheWVycyBoYXZlIHZvdGVkLlwiKTtcbiAgICB9XG59O1xuY29uc3QgQ0FSRFNfWF9PRkZTRVQgPSA2NTtcbmNvbnN0IENBUkRTX1lfT0ZGU0VUID0gOTA7XG5jb25zdCBDQVJEU19DT0xfV0lEVEggPSAxODg7XG5jb25zdCBDQVJEU19ST1dfSEVJR0hUID0gMjIwO1xuY29uc3QgQ0FSRFNfU0laRSA9IDE2MDtcbmNvbnN0IHBsYWNlQ2FyZEluR2FtZUJvYXJkID0gKGNhcmQsIGNhcmRJbmRleCkgPT4ge1xuICAgIGNhcmQueCA9IENBUkRTX1hfT0ZGU0VUICsgKGNhcmRJbmRleCAlIDQpICogQ0FSRFNfQ09MX1dJRFRIICsgKENBUkRTX1NJWkUgLSBjYXJkLndpZHRoKSAvIDI7XG4gICAgY2FyZC55ID1cbiAgICAgICAgQ0FSRFNfWV9PRkZTRVQgK1xuICAgICAgICAgICAgTWF0aC5mbG9vcihjYXJkSW5kZXggLyA0KSAqIENBUkRTX1JPV19IRUlHSFQgK1xuICAgICAgICAgICAgKENBUkRTX1NJWkUgLSBjYXJkLmhlaWdodCkgLyAyO1xuICAgIGNhcmRQbGF5RnJhbWUuYXBwZW5kQ2hpbGQoY2FyZCk7XG59O1xuY29uc3QgcGxhY2VUb2tlbkluR2FtZUJvYXJkID0gKHRva2VuLCBpKSA9PiB7XG4gICAgY29uc3Qgdm90ZUlkeCA9IHBhcnNlSW50KHRva2VuLmNoaWxkcmVuWzBdLmNoYXJhY3RlcnMpIC0gMTtcbiAgICB0b2tlbi54ID0gQ0FSRFNfWF9PRkZTRVQgKyAodm90ZUlkeCAlIDQpICogQ0FSRFNfQ09MX1dJRFRIICsgKDIwICogKGkgJSA3KSk7XG4gICAgdG9rZW4ueSA9IChDQVJEU19ZX09GRlNFVCArIE1hdGguZmxvb3Iodm90ZUlkeCAvIDQpICogQ0FSRFNfUk9XX0hFSUdIVCArICgyMCAqIGkpKSAtICg4MCAqIE1hdGguZmxvb3IoaSAvIDcpKTtcbiAgICBjb25zdCBjb2xvciA9IHRva2VuLmdldFBsdWdpbkRhdGEoXCJjb2xvclwiKTtcbiAgICBpZiAoY29sb3IpIHtcbiAgICAgICAgLy8gQ29weSBpbiBwbGF5ZXIgdG9rZW4gZnJvbSBDb21wb25lbnRzIFBhZ2VcbiAgICAgICAgY29uc3QgcGxheWVyVG9rZW5zRnJhbWUgPSBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBUb2tlbnNcIik7XG4gICAgICAgIGNvbnN0IHBsYXllclRva2VuID0gcGxheWVyVG9rZW5zRnJhbWUuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gY29sb3IpLmNsb25lKCk7XG4gICAgICAgIHBsYXllclRva2VuLnJlc2l6ZSgzNiwgMzYpO1xuICAgICAgICBwbGF5ZXJUb2tlbi54ID0gMjtcbiAgICAgICAgcGxheWVyVG9rZW4ueSA9IDI7XG4gICAgICAgIHRva2VuLmFwcGVuZENoaWxkKHBsYXllclRva2VuKTtcbiAgICB9XG4gICAgY2FyZFBsYXlGcmFtZS5hcHBlbmRDaGlsZCh0b2tlbik7XG59O1xuY29uc3QgZGVsZXRlUGxheWVyUGFnZXMgPSAoKSA9PiB7XG4gICAgZmlnbWEucm9vdC5jaGlsZHJlbi5mb3JFYWNoKHBhZ2UgPT4ge1xuICAgICAgICBpZiAocGFnZS5nZXRQbHVnaW5EYXRhKFwiaXNQbGF5ZXJQYWdlXCIpID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBwYWdlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KGBDb3VsZCBub3QgcmVtb3ZlIHBsYXllciBwYWdlOiAke3BhZ2UubmFtZX0g4oCTPiBUcnkgYWdhaW4gb3IgcmVtb3ZlIG1hbnVhbGx5LmApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDb3VsZCBub3QgcmVtb3ZlIHBsYXllciBwYWdlOiAke3BhZ2UubmFtZX0g4oCTPiBUcnkgYWdhaW4gb3IgcmVtb3ZlIG1hbnVhbGx5LmApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmNvbnN0IGNsZWFyQ2FyZHNGcm9tUGxheUFyZWEgPSAoKSA9PiB7XG4gICAgY2FyZFBsYXlGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICBpZiAoY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKSB7XG4gICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmNvbnN0IHNldHVwUGxheWVyUGllY2VzT25HYW1lQm9hcmQgPSAoKSA9PiB7XG4gICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgIGFkZFBsYXllclBpZWNlKHBsYXllci5jb2xvcik7XG4gICAgfSk7XG59O1xuY29uc3QgYWRkUGxheWVyUGllY2UgPSAoY29sb3IpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJQaWVjZXNGcmFtZSA9IGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFBpZWNlc1wiKTtcbiAgICBjb25zdCBwbGF5ZXJQaWVjZSA9IHBsYXllclBpZWNlc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IGNvbG9yKS5jbG9uZSgpO1xuICAgIGRpeG1hQm9hcmRQYWdlLmFwcGVuZENoaWxkKHBsYXllclBpZWNlKTtcbiAgICBwbGF5ZXJQaWVjZS54ICs9IHBsYXllclBpZWNlc0ZyYW1lLng7XG4gICAgcGxheWVyUGllY2UueSArPSBwbGF5ZXJQaWVjZXNGcmFtZS55O1xufTtcbmNvbnN0IHJlc2V0VG9rZW5zID0gKCkgPT4ge1xuICAgIGNvbnN0IHRva2Vuc09uQm9hcmQgPSBjYXJkUGxheUZyYW1lLmZpbmRBbGwoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICB0b2tlbnNPbkJvYXJkLmZvckVhY2godG9rZW4gPT4geyB0b2tlbi5yZW1vdmUoKTsgfSk7XG4gICAgcGxheWVyTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgY29uc3QgcGFnZSA9IG5vZGUucGFnZTtcbiAgICAgICAgY29uc3QgVm90aW5nVG9rZW5zRnJhbWVzID0gcGFnZS5maW5kQ2hpbGRyZW4oY2hpbGQgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5zXCIpO1xuICAgICAgICBWb3RpbmdUb2tlbnNGcmFtZXMuZm9yRWFjaChmcmFtZSA9PiB7IGZyYW1lLnJlbW92ZSgpOyB9KTtcbiAgICAgICAgY29uc3QgdG9rZW5zSW5Vc2UgPSBwYWdlLmZpbmRBbGwoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICAgICAgdG9rZW5zSW5Vc2UuZm9yRWFjaCh0b2tlbiA9PiB7XG4gICAgICAgICAgICBpZiAodG9rZW4ucGFyZW50LnR5cGUgPT09ICdQQUdFJyB8fCB0b2tlbi5wYXJlbnQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRva2VuLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBwYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFBhZ2UgVGVtcGxhdGVcIik7XG4gICAgICAgIG1vdmVWb3RpbmdUb2tlbnMocGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIH0pO1xufTtcbmNvbnN0IG5leHRTdG9yeXRlbGxlciA9IChuZXdTdG9yeXRlbGxlcikgPT4ge1xuICAgIGlmICh0eXBlb2YgbmV3U3Rvcnl0ZWxsZXIgPT0gJ251bWJlcicpIHtcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSBuZXdTdG9yeXRlbGxlcjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gKGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ICsgMSkgJSBwbGF5ZXJzLmxlbmd0aDtcbiAgICB9XG4gICAgY29uc3QgY3VyckNvbG9yID0gcGxheWVyc1tjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleF0uY29sb3I7XG4gICAgY29uc3Qgc3Rvcnl0ZWxsZXJUb2tlbiA9IGRpeG1hQm9hcmRQYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlN0b3J5dGVsbGVyIEJhZGdlXCIpO1xuICAgIGNvbnN0IHN0b3J5dGVsbGVySWR4ID0gUExBWUVSX09SREVSLmluZGV4T2YoY3VyckNvbG9yKTtcbiAgICBzdG9yeXRlbGxlclRva2VuLnkgPSAxMDIgKyA0NCAqIHN0b3J5dGVsbGVySWR4O1xufTtcbmNvbnN0IHJlc2V0RGVhbHRDYXJkcyA9ICgpID0+IHtcbiAgICBkZWNrUGFnZS5jaGlsZHJlbi5mb3JFYWNoKChpbWFnZSkgPT4gaW1hZ2Uuc2V0UGx1Z2luRGF0YShcImRlYWx0XCIsIFwiZmFsc2VcIikpO1xufTtcbmNvbnN0IGNsZWFyUGxheWVyUGllY2VzRnJvbUJvYXJkID0gKCkgPT4ge1xuICAgIGNvbnN0IHBsYXllclBpZWNlcyA9IGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZHJlbihjID0+IChQTEFZRVJfT1JERVIuaW5kZXhPZihjLm5hbWUpID4gLTEpKTtcbiAgICBwbGF5ZXJQaWVjZXMuZm9yRWFjaChwaWVjZSA9PiB7IHBpZWNlLnJlbW92ZSgpOyB9KTtcbn07XG5jb25zdCBjbGVhclBsYXllck5hbWVzID0gKCkgPT4ge1xuICAgIHBsYXllcnNGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgaW5zdHJ1Y3Rpb24gdGV4dCBub2Rlcywgd2Ugb25seSBuZWVkIHRvIGxvb2sgYXQgdGhlIHBsYXllcnNcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09IFwiSU5TVEFOQ0VcIikge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZSA9IGNoaWxkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwicGxheWVyIG5hbWVcIik7XG4gICAgICAgICAgICBmaWdtYVxuICAgICAgICAgICAgICAgIC5sb2FkRm9udEFzeW5jKHsgZmFtaWx5OiBcIlJvYm90byBTbGFiXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9KVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IChwbGF5ZXJOYW1lLmNoYXJhY3RlcnMgPSBFTVBUWV9QTEFZRVJfU1RSSU5HKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCByZXNldEdhbWUgPSAoKSA9PiB7XG4gICAgZ2FtZVBoYXNlID0gUEhBU0VTLk5PX0dBTUU7XG4gICAgcGxheWVycyA9IFtdO1xuICAgIHBsYXllck5vZGVzID0gW107XG4gICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSAwO1xuICAgIHJlc2V0VG9rZW5zKCk7XG4gICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICBjbGVhckNhcmRzRnJvbVBsYXlBcmVhKCk7XG4gICAgZGVsZXRlUGxheWVyUGFnZXMoKTtcbiAgICByZXNldERlYWx0Q2FyZHMoKTtcbiAgICBjbGVhclBsYXllclBpZWNlc0Zyb21Cb2FyZCgpO1xufTtcbi8vIFJVTlMgT04gTEFVTkNIIC0gY2hlY2sgZm9yIGdhbWUgc3RhdGUgZXZlcnkgc2Vjb25kXG5pZiAocGllY2VzQXJlUmVhZHkoKSkge1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICB1cGRhdGVQbHVnaW5TdGF0ZUZyb21Eb2N1bWVudCgpO1xuICAgIH0sIDEwMDApO1xufVxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuY29uc3QgaGV4VG9SR0IgPSAoaGV4KSA9PiB7XG4gICAgY29uc3QgaCA9IChoZXguY2hhckF0KDApID09IFwiI1wiKSA/IGhleC5zdWJzdHJpbmcoMSwgNykgOiBoZXg7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcjogcGFyc2VJbnQoaC5zdWJzdHJpbmcoMCwgMiksIDE2KSAvIDI1NSxcbiAgICAgICAgZzogcGFyc2VJbnQoaC5zdWJzdHJpbmcoMiwgNCksIDE2KSAvIDI1NSxcbiAgICAgICAgYjogcGFyc2VJbnQoaC5zdWJzdHJpbmcoNCwgNiksIDE2KSAvIDI1NVxuICAgIH07XG59O1xuY29uc3QgY2xvbmUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xufTtcbmNvbnN0IHNjYWxlSW1hZ2UgPSAoaW1hZ2UsIG1heFdpZHRoLCBtYXhIZWlnaHQpID0+IHtcbiAgICBpZiAoaW1hZ2Uud2lkdGggPiBtYXhXaWR0aCkge1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBpbWFnZS5oZWlnaHQgLyAoaW1hZ2Uud2lkdGggLyBtYXhXaWR0aCk7XG4gICAgICAgIGlmIChuZXdIZWlnaHQgPiBtYXhIZWlnaHQpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1dpZHRoID0gbWF4V2lkdGggLyAobmV3SGVpZ2h0IC8gbWF4SGVpZ2h0KTtcbiAgICAgICAgICAgIGltYWdlLnJlc2l6ZShuZXdXaWR0aCwgbWF4SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGltYWdlLnJlc2l6ZShtYXhXaWR0aCwgbmV3SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5mdW5jdGlvbiBkZWVwRXF1YWwob2JqZWN0MSwgb2JqZWN0Mikge1xuICAgIGNvbnN0IGtleXMxID0gT2JqZWN0LmtleXMob2JqZWN0MSk7XG4gICAgY29uc3Qga2V5czIgPSBPYmplY3Qua2V5cyhvYmplY3QyKTtcbiAgICBpZiAoa2V5czEubGVuZ3RoICE9PSBrZXlzMi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzMSkge1xuICAgICAgICBjb25zdCB2YWwxID0gb2JqZWN0MVtrZXldO1xuICAgICAgICBjb25zdCB2YWwyID0gb2JqZWN0MltrZXldO1xuICAgICAgICBjb25zdCBhcmVPYmplY3RzID0gaXNPYmplY3QodmFsMSkgJiYgaXNPYmplY3QodmFsMik7XG4gICAgICAgIGlmIChhcmVPYmplY3RzICYmICFkZWVwRXF1YWwodmFsMSwgdmFsMikgfHxcbiAgICAgICAgICAgICFhcmVPYmplY3RzICYmIHZhbDEgIT09IHZhbDIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0Jztcbn1cbi8vICBEdXJzdGVuZmVsZCBTaHVmZmxlLCBjb3BpZWQgZnJvbSBTdGFjayBPdmVyZmxvd1xuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gICAgbGV0IGFycmF5Q29weSA9IGNsb25lKGFycmF5KTtcbiAgICBmb3IgKGxldCBpID0gYXJyYXlDb3B5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgICAgICBbYXJyYXlDb3B5W2ldLCBhcnJheUNvcHlbal1dID0gW2FycmF5Q29weVtqXSwgYXJyYXlDb3B5W2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5Q29weTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=