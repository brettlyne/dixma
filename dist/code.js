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
    console.log('a');
    if (msg.type.startsWith('set-storyteller-index-')) {
        console.log('b');
        const newStoryteller = parseInt(msg.type.replace('set-storyteller-index-', ''));
        console.log(newStoryteller);
        if (!isNaN(newStoryteller) && newStoryteller >= 0 && newStoryteller < players.length) {
            console.log('c');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLE9BQU87QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvY29kZS50c1wiKTtcbiIsImZpZ21hLnNob3dVSShfX2h0bWxfXyk7XG5maWdtYS51aS5yZXNpemUoMzIwLCA2NjApO1xuLy8gdmFyaWFibGVzIHRvIHN0b3JlIGdhbWUgcGllY2Ugbm9kZXMgKHBhZ2VzLGZyYW1lcyxldGMpXG5sZXQgZGl4bWFCb2FyZFBhZ2U7XG5sZXQgZGVja1BhZ2U7XG5sZXQgY29tcG9uZW50c1BhZ2U7XG5sZXQgcGxheWVyUGFnZVRlbXBsYXRlO1xubGV0IGNhcmRQbGF5RnJhbWU7XG5sZXQgcGxheWVyc0ZyYW1lO1xubGV0IHN0b3J5dGVsbGVyQmFkZ2VOb2RlO1xuLy8gY29uc3RhbnRzXG5jb25zdCBQSEFTRVMgPSB7XG4gICAgUElFQ0VTX01JU1NJTkc6IFwicmVxdWlyZWQgZ2FtZSBlbGVtZW50cyBub3QgcHJlc2VudCBpbiBmaWxlXCIsXG4gICAgTk9fR0FNRTogXCJubyBhY3RpdmUgZ2FtZVwiLFxuICAgIFBJQ0tJTkc6IFwicGxheWVycyBhcmUgcGlja2luZyBjYXJkc1wiLFxuICAgIFZPVElORzogXCJwbGF5ZXJzIGFyZSB2b3RpbmdcIixcbiAgICBTQ09SSU5HOiBcInBsYXllcnMgYXJlIG1vdmluZyB0aGVpciB0b2tlbnMgb24gdGhlIHNjb3JlIHRyYWNraW5nIGJvYXJkXCJcbn07XG5jb25zdCBFTVBUWV9QTEFZRVJfU1RSSU5HID0gXCJ+IH4gfiB+IH4gfiB+IH5cIjtcbmNvbnN0IFBMQVlFUl9PUkRFUiA9IFtcInJlZFwiLCBcIm9yYW5nZVwiLCBcImdvbGRcIiwgXCJsaW1lXCIsIFwiZ3JlZW5cIiwgXCJ0dXJxdW9pc2VcIiwgXCJibHVlXCIsIFwidmlvbGV0XCIsIFwicHVycGxlXCIsIFwiYmxhY2tcIiwgXCJzaWx2ZXJcIiwgXCJ3aGl0ZVwiXTtcbmNvbnN0IENPTE9SU19BU19IRVggPSB7XG4gICAgcmVkOiBcIkZGMDAwMFwiLCBvcmFuZ2U6IFwiRkY4MDBBXCIsIGdvbGQ6IFwiRkZENzAwXCIsIGxpbWU6IFwiQkRGRjAwXCIsXG4gICAgZ3JlZW46IFwiMDA4MDAwXCIsIHR1cnF1b2lzZTogXCI0MEUwRDBcIiwgYmx1ZTogXCIwMDAwQ0RcIiwgdmlvbGV0OiBcIkVFODJFRVwiLFxuICAgIHB1cnBsZTogXCI4MDAwODBcIiwgYmxhY2s6IFwiMDAwMDAwXCIsIHNpbHZlcjogXCJDMEMwQzBcIiwgd2hpdGU6IFwiRkZGRkZGXCJcbn07XG5jb25zdCBWT1RJTkdfVE9LRU5TX05BTUUgPSBcIlZvdGluZyBUb2tlbnNcIjtcbmNvbnN0IENBUkRfTkFNRSA9IFwiQ2FyZFwiO1xuY29uc3QgQ0FSRF9TTE9UX1BBRERJTkcgPSA1O1xuY29uc3QgQ0FSRF9TSVpFID0gMTUwO1xuLy8gZ2FtZSBzdGF0ZSB2YXJpYWJsZXNcbmxldCBwbGF5ZXJzID0gW107XG5sZXQgcGxheWVyTm9kZXMgPSBbXTtcbmxldCBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IDA7IC8vIHBsYXllciBpbmRleCBvZiBjdXJyZW50IHN0b3J5dGVsbGVyXG5sZXQgZ2FtZVBoYXNlID0gUEhBU0VTLk5PX0dBTUU7XG4vLyBoYW5kbGUgbWVzc2FnZXMgZnJvbSBwbHVnaW4gVUlcbmZpZ21hLnVpLm9ubWVzc2FnZSA9IChtc2cpID0+IHtcbiAgICB1cGRhdGVQbHVnaW5TdGF0ZUZyb21Eb2N1bWVudCgpO1xuICAgIGlmIChtc2cudHlwZSA9PT0gXCJ0ZXN0aW5nXCIpIHtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInN0YXJ0LWdhbWVcIikge1xuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuTk9fR0FNRSAmJiBwaWVjZXNBcmVSZWFkeSgpICYmIHBsYXllcnNBcmVSZWFkeSgpKSB7XG4gICAgICAgICAgICAvLyBzdGFydCB0aGUgZ2FtZVxuICAgICAgICAgICAgc2V0dXBQbGF5ZXJQaWVjZXNPbkdhbWVCb2FyZCgpO1xuICAgICAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlBJQ0tJTkc7XG4gICAgICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIoMCk7XG4gICAgICAgICAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgICAgICAgICBjcmVhdGVQbGF5ZXJQYWdlKHBsYXllcik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICAgICAgICAgIGRlYWxDYXJkcygpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLWNhcmRzXCIgJiYgZ2FtZVBoYXNlID09PSBQSEFTRVMuUElDS0lORykge1xuICAgICAgICBtb3ZlQ2FyZHNUb0dhbWVCb2FyZCgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmV2ZWFsLXRva2Vuc1wiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlZPVElORykge1xuICAgICAgICBtb3ZlVG9rZW5zVG9HYW1lQm9hcmQoKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcIm5ldy1yb3VuZFwiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlNDT1JJTkcpIHtcbiAgICAgICAgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSgpO1xuICAgICAgICBkZWFsQ2FyZHMoKTtcbiAgICAgICAgcmVzZXRUb2tlbnMoKTtcbiAgICAgICAgbmV4dFN0b3J5dGVsbGVyKCk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5QSUNLSU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwibmV3LXBsYXllcnNcIikge1xuICAgICAgICBjb25zdCBvbGRQbGF5ZXJOYW1lcyA9IHBsYXllcnMubWFwKHBsYXllciA9PiBwbGF5ZXIubmFtZSk7XG4gICAgICAgIGlmIChwbGF5ZXJzQXJlUmVhZHkoKSkge1xuICAgICAgICAgICAgcGxheWVycy5mb3JFYWNoKChwbGF5ZXIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob2xkUGxheWVyTmFtZXMuaW5kZXhPZihwbGF5ZXIubmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgJHtwbGF5ZXIubmFtZX0gd2lsbCBnZXQgY2FyZHMgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbmV4dCByb3VuZC5gKTtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlUGxheWVyUGFnZShwbGF5ZXIpO1xuICAgICAgICAgICAgICAgICAgICBhZGRQbGF5ZXJQaWVjZShwbGF5ZXIuY29sb3IpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8PSBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFN0b3J5dGVsbGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICAgICAgICAgIGRlYWxDYXJkcygpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZygnYScpO1xuICAgIGlmIChtc2cudHlwZS5zdGFydHNXaXRoKCdzZXQtc3Rvcnl0ZWxsZXItaW5kZXgtJykpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2InKTtcbiAgICAgICAgY29uc3QgbmV3U3Rvcnl0ZWxsZXIgPSBwYXJzZUludChtc2cudHlwZS5yZXBsYWNlKCdzZXQtc3Rvcnl0ZWxsZXItaW5kZXgtJywgJycpKTtcbiAgICAgICAgY29uc29sZS5sb2cobmV3U3Rvcnl0ZWxsZXIpO1xuICAgICAgICBpZiAoIWlzTmFOKG5ld1N0b3J5dGVsbGVyKSAmJiBuZXdTdG9yeXRlbGxlciA+PSAwICYmIG5ld1N0b3J5dGVsbGVyIDwgcGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdjJyk7XG4gICAgICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIobmV3U3Rvcnl0ZWxsZXIpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmVzZXQtZ2FtZVwiKSB7XG4gICAgICAgIHJlc2V0R2FtZSgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmVzZXQtZ2FtZS1hbmQtY2xlYXItcGxheWVyc1wiKSB7XG4gICAgICAgIHJlc2V0R2FtZSgpO1xuICAgICAgICBjbGVhclBsYXllck5hbWVzKCk7XG4gICAgfVxufTtcbmNvbnN0IHBpZWNlc0FyZVJlYWR5ID0gKCkgPT4ge1xuICAgIGRpeG1hQm9hcmRQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRpeG1hIEJvYXJkXCIpO1xuICAgIGRlY2tQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRlY2tcIik7XG4gICAgY29tcG9uZW50c1BhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ29tcG9uZW50c1wiKTtcbiAgICBwbGF5ZXJQYWdlVGVtcGxhdGUgPSBjb21wb25lbnRzUGFnZSAmJiBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQYWdlIFRlbXBsYXRlXCIpO1xuICAgIGNhcmRQbGF5RnJhbWUgPSBkaXhtYUJvYXJkUGFnZSAmJiBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgUGxheSBBcmVhXCIpO1xuICAgIHBsYXllcnNGcmFtZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyc1wiKTtcbiAgICBzdG9yeXRlbGxlckJhZGdlTm9kZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlN0b3J5dGVsbGVyIEJhZGdlXCIpO1xuICAgIGlmICghKGRpeG1hQm9hcmRQYWdlICYmIGRlY2tQYWdlICYmIGNvbXBvbmVudHNQYWdlICYmIHBsYXllclBhZ2VUZW1wbGF0ZSAmJiBjYXJkUGxheUZyYW1lICYmIHBsYXllcnNGcmFtZSAmJiBzdG9yeXRlbGxlckJhZGdlTm9kZSkpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiR2FtZSBwaWVjZSBub3QgZm91bmQuIFVzZSBEaXhtYSB0ZW1wbGF0ZSBmaWxlIC8gY2hlY2sgdGhhdCBub3RoaW5nIHdhcyBhY2NpZGVudGFsbHkgZGVsZXRlZCBvciByZW5hbWVkLiBTZWUgY29uc29sZS4uLlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJFYWNoIG9mIHRoZSBmb2xsb3dpbmcgc2hvdWxkIGJlIGRlZmluZWQuXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBkaXhtYUJvYXJkUGFnZSwgZGVja1BhZ2UsIGNvbXBvbmVudHNQYWdlLCBwbGF5ZXJQYWdlVGVtcGxhdGUsXG4gICAgICAgICAgICBjYXJkUGxheUZyYW1lLCBwbGF5ZXJzRnJhbWUsIHN0b3J5dGVsbGVyQmFkZ2VOb2RlXG4gICAgICAgIH0pLnNwbGl0KCcsJykuam9pbignXFxuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHBsYXllcnNBcmVSZWFkeSA9ICgpID0+IHtcbiAgICBsZXQgbmV3UGxheWVycyA9IFtdO1xuICAgIHBsYXllcnNGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgaW5zdHJ1Y3Rpb24gdGV4dCBub2Rlcywgd2Ugb25seSBuZWVkIHRvIGxvb2sgYXQgdGhlIHBsYXllcnNcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09IFwiSU5TVEFOQ0VcIikge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZU5vZGUgPSBjaGlsZC5maW5kQ2hpbGQoKGdyYW5kY2hpbGQpID0+IGdyYW5kY2hpbGQubmFtZSA9PT0gXCJwbGF5ZXIgbmFtZVwiKTtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWUgPSBwbGF5ZXJOYW1lTm9kZS5jaGFyYWN0ZXJzO1xuICAgICAgICAgICAgaWYgKHBsYXllck5hbWUgJiYgcGxheWVyTmFtZSAhPT0gRU1QVFlfUExBWUVSX1NUUklORykge1xuICAgICAgICAgICAgICAgIG5ld1BsYXllcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBsYXllck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjaGlsZC5uYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAobmV3UGxheWVycy5sZW5ndGggPCA0KSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeSgnTmVlZCBhdCBsZWFzdCA0IHBsYXllcnMgdG8gc3RhcnQgYSBnYW1lLicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllck5hbWVzID0gbmV3UGxheWVycy5tYXAocGxheWVyID0+IHBsYXllci5uYW1lKTtcbiAgICBpZiAocGxheWVyTmFtZXMubGVuZ3RoICE9PSBuZXcgU2V0KHBsYXllck5hbWVzKS5zaXplKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeSgnRHVwbGljYXRlIG5hbWVzIG5vdCBhbGxvd2VkLicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHBsYXllcnMgPSBuZXdQbGF5ZXJzO1xuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcInBsYXllcnNcIiwgSlNPTi5zdHJpbmdpZnkocGxheWVycykpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImdhbWVQaGFzZVwiLCBnYW1lUGhhc2UpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImN1cnJlbnRTdG9yeXRlbGxlckluZGV4XCIsIGAke2N1cnJlbnRTdG9yeXRlbGxlckluZGV4fWApO1xufTtcbmNvbnN0IHJlc2V0RG9jdW1lbnRTdGF0ZSA9ICgpID0+IHtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJwbGF5ZXJzXCIsIEpTT04uc3RyaW5naWZ5KFtdKSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiZ2FtZVBoYXNlXCIsIFBIQVNFUy5OT19HQU1FKTtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleFwiLCAnMCcpO1xufTtcbmNvbnN0IHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IHBsYXllckRhdGEgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ3BsYXllcnMnKTtcbiAgICBjb25zdCBuZXdHYW1lUGhhc2UgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ2dhbWVQaGFzZScpO1xuICAgIGlmICghcGxheWVyRGF0YSB8fCAhbmV3R2FtZVBoYXNlKSB7XG4gICAgICAgIHJlc2V0RG9jdW1lbnRTdGF0ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5ld1BsYXllcnMgPSBKU09OLnBhcnNlKHBsYXllckRhdGEpO1xuICAgIGNvbnN0IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gcGFyc2VJbnQoZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCcpKTtcbiAgICBpZiAoZ2FtZVBoYXNlICE9PSBuZXdHYW1lUGhhc2UgfHxcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggIT09IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4KSB7XG4gICAgICAgIGdhbWVQaGFzZSA9IG5ld0dhbWVQaGFzZTtcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSBuZXdDdXJyZW50U3Rvcnl0ZWxsZXJJbmRleDtcbiAgICB9XG4gICAgaWYgKCFkZWVwRXF1YWwocGxheWVycywgbmV3UGxheWVycykpIHtcbiAgICAgICAgcGxheWVycyA9IG5ld1BsYXllcnM7XG4gICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICB9XG4gICAgY29uc3QgcGxheWVyc1dpdGhTdGF0dXMgPSBnZXRQbGF5ZXJzV2l0aFN0YXR1cygpO1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogJ0dBTUVfU1RBVEUnLFxuICAgICAgICBwbGF5ZXJzOiBwbGF5ZXJzV2l0aFN0YXR1cyxcbiAgICAgICAgZ2FtZVBoYXNlLFxuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleFxuICAgIH0pO1xufTtcbmNvbnN0IHBvcHVsYXRlUGxheWVyTm9kZXMgPSAoKSA9PiB7XG4gICAgcGxheWVyTm9kZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICAgICAgY29uc3QgcGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gcGxheWVyLm5hbWUpO1xuICAgICAgICBpZiAoIXBhZ2UpIHtcbiAgICAgICAgICAgIHJlbW92ZVBsYXllckJ5SW5kZXgoaSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZWxlY3RlZENhcmRBcmVhID0gcGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDYXJkIFNlbGVjdGlvbiBBcmVhXCIpO1xuICAgICAgICBjb25zdCBzZWxlY3RlZFRva2VuQXJlYSA9IHBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVG9rZW4gU2VsZWN0aW9uIEFyZWFcIik7XG4gICAgICAgIHBsYXllck5vZGVzLnB1c2goeyBwYWdlLCBzZWxlY3RlZENhcmRBcmVhLCBzZWxlY3RlZFRva2VuQXJlYSB9KTtcbiAgICB9XG59O1xuY29uc3QgZ2V0UGxheWVyc1dpdGhTdGF0dXMgPSAoKSA9PiB7XG4gICAgY29uc3QgcGxheWVyc1dpdGhTdGF0dXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICAgICAgY29uc3QgaXNTdG9yeXRlbGxlciA9IChpID09PSBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCk7XG4gICAgICAgIGNvbnN0IHBsYXllck5vZGUgPSBwbGF5ZXJOb2Rlc1tpXTtcbiAgICAgICAgaWYgKCFwbGF5ZXJOb2RlLnBhZ2UgfHwgcGxheWVyTm9kZS5wYWdlLnJlbW92ZWQpIHsgLy8gcGFnZSBoYXMgYmVlbiBkZWxldGVkIC0+IHJlbW92ZSBwbGF5ZXJcbiAgICAgICAgICAgIHJlbW92ZVBsYXllckJ5SW5kZXgoaSk7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UGxheWVyc1dpdGhTdGF0dXMoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc3RhdHVzO1xuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuUElDS0lORykge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gcGxheWVyTm9kZS5zZWxlY3RlZENhcmRBcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSk7XG4gICAgICAgICAgICBzdGF0dXMgPSAoc2VsZWN0ZWRDYXJkID8gXCJkb25lLXdpdGgtYWN0aW9uXCIgOiBcInBpY2tpbmctY2FyZFwiKTtcbiAgICAgICAgICAgIGlmIChpc1N0b3J5dGVsbGVyKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gXCJzdG9yeXRlbGxlci1cIiArIHN0YXR1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuVk9USU5HKSB7XG4gICAgICAgICAgICBpZiAoaXNTdG9yeXRlbGxlcikge1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdzdG9yeXRlbGxlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRva2VuID0gcGxheWVyTm9kZS5zZWxlY3RlZFRva2VuQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAoc2VsZWN0ZWRUb2tlbiA/IFwiZG9uZS13aXRoLWFjdGlvblwiIDogXCJ2b3RpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLlNDT1JJTkcpIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IChpc1N0b3J5dGVsbGVyID8gJ3N0b3J5dGVsbGVyLXNjb3JpbmcnIDogJ3Njb3JpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBwbGF5ZXJzV2l0aFN0YXR1cy5wdXNoKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcGxheWVyKSwgeyBzdGF0dXMgfSkpO1xuICAgIH1cbiAgICA7XG4gICAgcmV0dXJuIHBsYXllcnNXaXRoU3RhdHVzO1xufTtcbi8vIGNhbGxlZCB0byByZW1vdmUgYSBwbGF5ZXIgZnJvbSB0aGUgZ2FtZSBzdGF0ZSAocHJvYmFibHkgYmVjYXVzZSB0aGV5IG5vIGxvbmdlciBoYXZlIGEgcGxheWVyIHBhZ2UpXG5jb25zdCByZW1vdmVQbGF5ZXJCeUluZGV4ID0gKGkpID0+IHtcbiAgICBwbGF5ZXJzLnNwbGljZShpLCAxKTtcbiAgICBpZiAoaSA8IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4KSB7XG4gICAgICAgIG5leHRTdG9yeXRlbGxlcihjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCAtIDEpO1xuICAgIH1cbiAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbn07XG5jb25zdCBjcmVhdGVQbGF5ZXJQYWdlID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IHBsYXllclBhZ2UgPSBmaWdtYS5jcmVhdGVQYWdlKCk7XG4gICAgcGxheWVyUGFnZS5zZXRQbHVnaW5EYXRhKCdpc1BsYXllclBhZ2UnLCAndHJ1ZScpO1xuICAgIHBsYXllclBhZ2UubmFtZSA9IHBsYXllci5uYW1lO1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gY3JlYXRlUGxheWVyQm9hcmQocGxheWVyKTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICBjdXN0b21QbGF5ZXJCb2FyZC5sb2NrZWQgPSB0cnVlO1xuICAgIG1vdmVWb3RpbmdUb2tlbnMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIC8vIGRlYWxGaXJzdEhhbmQocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHJldHVybiBwbGF5ZXJQYWdlO1xufTtcbmNvbnN0IGNyZWF0ZVBsYXllckJvYXJkID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gcGxheWVyUGFnZVRlbXBsYXRlLmNsb25lKCk7XG4gICAgLy8gQ3VzdG9taXplIHBhZ2Ugd2l0aCBwbGF5ZXIgbmFtZVxuICAgIGNvbnN0IHBsYXllck5hbWVFbGVtZW50ID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIE5hbWUgVGV4dFwiKTtcbiAgICBmaWdtYVxuICAgICAgICAubG9hZEZvbnRBc3luYyh7IGZhbWlseTogXCJBbWVyaWNhbiBUeXBld3JpdGVyXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9KVxuICAgICAgICAudGhlbigoKSA9PiAocGxheWVyTmFtZUVsZW1lbnQuY2hhcmFjdGVycyA9IHBsYXllci5uYW1lKSk7XG4gICAgLy8gQ29weSBpbiBwbGF5ZXIgdG9rZW4gZnJvbSBDb21wb25lbnRzIFBhZ2VcbiAgICBjb25zdCBwbGF5ZXJUb2tlbnNGcmFtZSA9IGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFRva2Vuc1wiKTtcbiAgICBjb25zdCBwbGF5ZXJUb2tlbiA9IHBsYXllclRva2Vuc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IHBsYXllci5jb2xvcikuY2xvbmUoKTtcbiAgICBwbGF5ZXJUb2tlbi5yZXNpemUoNDAsIDQwKTtcbiAgICBwbGF5ZXJUb2tlbi54ID0gNzg7XG4gICAgcGxheWVyVG9rZW4ueSA9IDc4O1xuICAgIGN1c3RvbVBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclRva2VuKTtcbiAgICAvLyBDaGFuZ2UgY29sb3Igb2Ygdm90aW5nIHRva2Vuc1xuICAgIGNvbnN0IHZvdGluZ1Rva2VucyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFZPVElOR19UT0tFTlNfTkFNRSk7XG4gICAgdm90aW5nVG9rZW5zLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuID0gY2hpbGQ7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuRmlsbHMgPSBjbG9uZSh2b3RpbmdUb2tlbi5maWxscyk7XG4gICAgICAgIHZvdGluZ1Rva2VuRmlsbHNbMF0uY29sb3IgPSBoZXhUb1JHQihDT0xPUlNfQVNfSEVYW3BsYXllci5jb2xvcl0pO1xuICAgICAgICB2b3RpbmdUb2tlbi5maWxscyA9IHZvdGluZ1Rva2VuRmlsbHM7XG4gICAgfSk7XG4gICAgcmV0dXJuIGN1c3RvbVBsYXllckJvYXJkO1xufTtcbi8vIE1vdmUgdGhlIHZvdGluZyB0b2tlbnMgb3V0IG9mIHRoZSBjb21wb25lbnQgc28gdGhleSBjYW4gYmUgZWFzaWx5IGRyYWdnZWRcbmNvbnN0IG1vdmVWb3RpbmdUb2tlbnMgPSAocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpID0+IHtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnMgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gVk9USU5HX1RPS0VOU19OQU1FKTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNQb3NpdGlvbiA9IHZvdGluZ1Rva2Vucy5hYnNvbHV0ZVRyYW5zZm9ybTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNDbG9uZSA9IHZvdGluZ1Rva2Vucy5jbG9uZSgpO1xuICAgIHZvdGluZ1Rva2Vucy52aXNpYmxlID0gZmFsc2U7XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh2b3RpbmdUb2tlbnNDbG9uZSk7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUudmlzaWJsZSA9IHRydWU7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUueCA9IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uWzBdWzJdO1xuICAgIHZvdGluZ1Rva2Vuc0Nsb25lLnkgPSB2b3RpbmdUb2tlbnNQb3NpdGlvblsxXVsyXTtcbn07XG4vLyBTZXQgdXAgYXJlYXMgb24gcGxheWVyIGJvYXJkIHRvIHNlbGVjdCBjYXJkcyAmIHRva2VucyBieSBkcm9wcGluZyB0aGVtIGluIGEgZnJhbWVcbmZ1bmN0aW9uIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpIHtcbiAgICBjb25zdCBjYXJkU2VsZWN0aW9uQXJlYSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTZWxlY3RlZCBjYXJkXCIpO1xuICAgIGNvbnN0IGNhcmRGaWxscyA9IGNsb25lKGNhcmRTZWxlY3Rpb25BcmVhLmZpbGxzKTtcbiAgICBjYXJkRmlsbHNbMF0ub3BhY2l0eSA9IDA7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEubmFtZSA9IFwiQ2FyZCBTZWxlY3Rpb24gQXJlYVwiO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnJlc2l6ZShzZWxlY3RlZENhcmQud2lkdGgsIHNlbGVjdGVkQ2FyZC5oZWlnaHQpO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnggPSBzZWxlY3RlZENhcmQuYWJzb2x1dGVUcmFuc2Zvcm1bMF1bMl07XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkQ2FyZC5hYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGNhcmRTZWxlY3Rpb25BcmVhKTtcbiAgICBjb25zdCB0b2tlblNlbGVjdGlvbkFyZWEgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkVG9rZW4gPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlNlbGVjdGVkIHZvdGluZyB0b2tlblwiKTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLm5hbWUgPSBcIlRva2VuIFNlbGVjdGlvbiBBcmVhXCI7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLmNvcm5lclJhZGl1cyA9IDEwO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5yZXNpemUoc2VsZWN0ZWRUb2tlbi53aWR0aCwgc2VsZWN0ZWRUb2tlbi5oZWlnaHQpO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS54ID0gc2VsZWN0ZWRUb2tlbi5hYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkVG9rZW4uYWJzb2x1dGVUcmFuc2Zvcm1bMV1bMl07XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh0b2tlblNlbGVjdGlvbkFyZWEpO1xufVxuY29uc3QgSEFORF9YID0gODc7XG5jb25zdCBIQU5EX1kgPSAzMTY7XG5jb25zdCBIQU5EX1NQQUNJTkcgPSAxNzQ7XG5jb25zdCBkZWFsQ2FyZHMgPSAoKSA9PiB7XG4gICAgcGxheWVyTm9kZXMuZm9yRWFjaChwbGF5ZXJOb2RlID0+IHtcbiAgICAgICAgY29uc3QgcGxheWVyUGFnZSA9IHBsYXllck5vZGUucGFnZTtcbiAgICAgICAgY29uc3QgY2FyZHMgPSBwbGF5ZXJQYWdlLmZpbmRDaGlsZHJlbigoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSk7XG4gICAgICAgIGZvciAobGV0IGkgPSBjYXJkcy5sZW5ndGg7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgIGxldCByYW5kb21JbWFnZSA9IGdldFJhbmRvbUltYWdlRnJvbURlY2soKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0NhcmQgPSBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNBUkRfVEVNUExBVEVcIikuY2xvbmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRmlsbCA9IE9iamVjdC5hc3NpZ24oe30sIG5ld0NhcmQuZmlsbHNbMV0pO1xuICAgICAgICAgICAgaW1hZ2VGaWxsLmltYWdlSGFzaCA9IHJhbmRvbUltYWdlLmZpbGxzWzBdLmltYWdlSGFzaDtcbiAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGxzID0gW25ld0NhcmQuZmlsbHNbMF0sIGltYWdlRmlsbF07XG4gICAgICAgICAgICBuZXdDYXJkLmZpbGxzID0gbmV3RmlsbHM7XG4gICAgICAgICAgICBuZXdDYXJkLm5hbWUgPSBDQVJEX05BTUU7XG4gICAgICAgICAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKG5ld0NhcmQpO1xuICAgICAgICAgICAgY2FyZHMucHVzaChuZXdDYXJkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXJkcy5zb3J0KChhLCBiKSA9PiAoYS54IC0gYi54KSk7XG4gICAgICAgIGNhcmRzLmZvckVhY2goKGNhcmQsIGkpID0+IHtcbiAgICAgICAgICAgIGNhcmQueCA9IEhBTkRfWCArIGkgKiBIQU5EX1NQQUNJTkc7XG4gICAgICAgICAgICBjYXJkLnkgPSBIQU5EX1k7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbmNvbnN0IGdldFJhbmRvbUltYWdlRnJvbURlY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgZGVja0ltYWdlcyA9IGRlY2tQYWdlLmNoaWxkcmVuO1xuICAgIGxldCByYW5kb21JbWFnZSA9IGRlY2tJbWFnZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGVja0ltYWdlcy5sZW5ndGgpXTtcbiAgICBpZiAocmFuZG9tSW1hZ2UuZ2V0UGx1Z2luRGF0YShcImRlYWx0XCIpID09PSBcInRydWVcIikge1xuICAgICAgICByZXR1cm4gZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjaygpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmFuZG9tSW1hZ2Uuc2V0UGx1Z2luRGF0YShcImRlYWx0XCIsIFwidHJ1ZVwiKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmRvbUltYWdlO1xufTtcbmNvbnN0IG1vdmVDYXJkc1RvR2FtZUJvYXJkID0gKCkgPT4ge1xuICAgIGxldCBjYXJkc1RvTW92ZSA9IHBsYXllck5vZGVzLm1hcChub2RlID0+IG5vZGUuc2VsZWN0ZWRDYXJkQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpKTtcbiAgICBsZXQgYWxsUGxheWVyc0FyZVJlYWR5ID0gdHJ1ZTtcbiAgICBsZXQgc2h1ZmZsZWRJbmRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYXJkc1RvTW92ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBzaHVmZmxlZEluZGljZXMucHVzaChpKTtcbiAgICAgICAgaWYgKCFjYXJkc1RvTW92ZVtpXSkge1xuICAgICAgICAgICAgYWxsUGxheWVyc0FyZVJlYWR5ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBzaHVmZmxlZEluZGljZXMgPSBzaHVmZmxlQXJyYXkoc2h1ZmZsZWRJbmRpY2VzKTtcbiAgICBpZiAoYWxsUGxheWVyc0FyZVJlYWR5KSB7XG4gICAgICAgIGNhcmRzVG9Nb3ZlLmZvckVhY2goKHNlbGVjdGVkQ2FyZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHBsYWNlQ2FyZEluR2FtZUJvYXJkKHNlbGVjdGVkQ2FyZCwgc2h1ZmZsZWRJbmRpY2VzW2luZGV4XSk7XG4gICAgICAgIH0pO1xuICAgICAgICBnYW1lUGhhc2UgPSBQSEFTRVMuVk9USU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiTm90IGFsbCBwbGF5ZXJzIGhhdmUgc2VsZWN0ZWQgYSBjYXJkLlwiKTtcbiAgICB9XG59O1xuY29uc3QgbW92ZVRva2Vuc1RvR2FtZUJvYXJkID0gKCkgPT4ge1xuICAgIGNvbnN0IHRva2Vuc1RvTW92ZSA9IFtdO1xuICAgIGxldCBhbGxSZWFkeSA9IHRydWU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY3VycmVudFN0b3J5dGVsbGVySW5kZXggPT09IGkpXG4gICAgICAgICAgICBjb250aW51ZTsgLy8gc3Rvcnl0ZWxsZXIgZG9lcyBub3Qgdm90ZVxuICAgICAgICBjb25zdCBzZWxlY3RlZFRva2VuQXJlYSA9IHBsYXllck5vZGVzW2ldLnNlbGVjdGVkVG9rZW5BcmVhO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHNlbGVjdGVkVG9rZW5BcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgICAgICB0b2tlbi5zZXRQbHVnaW5EYXRhKFwiY29sb3JcIiwgcGxheWVyc1tpXS5jb2xvcik7XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgICAgdG9rZW5zVG9Nb3ZlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxsUmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxSZWFkeSkge1xuICAgICAgICB0b2tlbnNUb01vdmUuZm9yRWFjaCgodG9rZW4sIGkpID0+IHsgcGxhY2VUb2tlbkluR2FtZUJvYXJkKHRva2VuLCBpKTsgfSk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5TQ09SSU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiTm90IGFsbCBwbGF5ZXJzIGhhdmUgdm90ZWQuXCIpO1xuICAgIH1cbn07XG5jb25zdCBDQVJEU19YX09GRlNFVCA9IDY1O1xuY29uc3QgQ0FSRFNfWV9PRkZTRVQgPSA5MDtcbmNvbnN0IENBUkRTX0NPTF9XSURUSCA9IDE4ODtcbmNvbnN0IENBUkRTX1JPV19IRUlHSFQgPSAyMjA7XG5jb25zdCBDQVJEU19TSVpFID0gMTYwO1xuY29uc3QgcGxhY2VDYXJkSW5HYW1lQm9hcmQgPSAoY2FyZCwgY2FyZEluZGV4KSA9PiB7XG4gICAgY2FyZC54ID0gQ0FSRFNfWF9PRkZTRVQgKyAoY2FyZEluZGV4ICUgNCkgKiBDQVJEU19DT0xfV0lEVEggKyAoQ0FSRFNfU0laRSAtIGNhcmQud2lkdGgpIC8gMjtcbiAgICBjYXJkLnkgPVxuICAgICAgICBDQVJEU19ZX09GRlNFVCArXG4gICAgICAgICAgICBNYXRoLmZsb29yKGNhcmRJbmRleCAvIDQpICogQ0FSRFNfUk9XX0hFSUdIVCArXG4gICAgICAgICAgICAoQ0FSRFNfU0laRSAtIGNhcmQuaGVpZ2h0KSAvIDI7XG4gICAgY2FyZFBsYXlGcmFtZS5hcHBlbmRDaGlsZChjYXJkKTtcbn07XG5jb25zdCBwbGFjZVRva2VuSW5HYW1lQm9hcmQgPSAodG9rZW4sIGkpID0+IHtcbiAgICBjb25zdCB2b3RlSWR4ID0gcGFyc2VJbnQodG9rZW4uY2hpbGRyZW5bMF0uY2hhcmFjdGVycykgLSAxO1xuICAgIHRva2VuLnggPSBDQVJEU19YX09GRlNFVCArICh2b3RlSWR4ICUgNCkgKiBDQVJEU19DT0xfV0lEVEggKyAoMjAgKiAoaSAlIDcpKTtcbiAgICB0b2tlbi55ID0gKENBUkRTX1lfT0ZGU0VUICsgTWF0aC5mbG9vcih2b3RlSWR4IC8gNCkgKiBDQVJEU19ST1dfSEVJR0hUICsgKDIwICogaSkpIC0gKDgwICogTWF0aC5mbG9vcihpIC8gNykpO1xuICAgIGNvbnN0IGNvbG9yID0gdG9rZW4uZ2V0UGx1Z2luRGF0YShcImNvbG9yXCIpO1xuICAgIGlmIChjb2xvcikge1xuICAgICAgICAvLyBDb3B5IGluIHBsYXllciB0b2tlbiBmcm9tIENvbXBvbmVudHMgUGFnZVxuICAgICAgICBjb25zdCBwbGF5ZXJUb2tlbnNGcmFtZSA9IGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFRva2Vuc1wiKTtcbiAgICAgICAgY29uc3QgcGxheWVyVG9rZW4gPSBwbGF5ZXJUb2tlbnNGcmFtZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBjb2xvcikuY2xvbmUoKTtcbiAgICAgICAgcGxheWVyVG9rZW4ucmVzaXplKDM2LCAzNik7XG4gICAgICAgIHBsYXllclRva2VuLnggPSAyO1xuICAgICAgICBwbGF5ZXJUb2tlbi55ID0gMjtcbiAgICAgICAgdG9rZW4uYXBwZW5kQ2hpbGQocGxheWVyVG9rZW4pO1xuICAgIH1cbiAgICBjYXJkUGxheUZyYW1lLmFwcGVuZENoaWxkKHRva2VuKTtcbn07XG5jb25zdCBkZWxldGVQbGF5ZXJQYWdlcyA9ICgpID0+IHtcbiAgICBmaWdtYS5yb290LmNoaWxkcmVuLmZvckVhY2gocGFnZSA9PiB7XG4gICAgICAgIGlmIChwYWdlLmdldFBsdWdpbkRhdGEoXCJpc1BsYXllclBhZ2VcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBhZ2UucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoYENvdWxkIG5vdCByZW1vdmUgcGxheWVyIHBhZ2U6ICR7cGFnZS5uYW1lfSDigJM+IFRyeSBhZ2FpbiBvciByZW1vdmUgbWFudWFsbHkuYCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENvdWxkIG5vdCByZW1vdmUgcGxheWVyIHBhZ2U6ICR7cGFnZS5uYW1lfSDigJM+IFRyeSBhZ2FpbiBvciByZW1vdmUgbWFudWFsbHkuYCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuY29uc3QgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSA9ICgpID0+IHtcbiAgICBjYXJkUGxheUZyYW1lLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIGlmIChjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpIHtcbiAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuY29uc3Qgc2V0dXBQbGF5ZXJQaWVjZXNPbkdhbWVCb2FyZCA9ICgpID0+IHtcbiAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgYWRkUGxheWVyUGllY2UocGxheWVyLmNvbG9yKTtcbiAgICB9KTtcbn07XG5jb25zdCBhZGRQbGF5ZXJQaWVjZSA9IChjb2xvcikgPT4ge1xuICAgIGNvbnN0IHBsYXllclBpZWNlc0ZyYW1lID0gZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgUGllY2VzXCIpO1xuICAgIGNvbnN0IHBsYXllclBpZWNlID0gcGxheWVyUGllY2VzRnJhbWUuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gY29sb3IpLmNsb25lKCk7XG4gICAgZGl4bWFCb2FyZFBhZ2UuYXBwZW5kQ2hpbGQocGxheWVyUGllY2UpO1xuICAgIHBsYXllclBpZWNlLnggKz0gcGxheWVyUGllY2VzRnJhbWUueDtcbiAgICBwbGF5ZXJQaWVjZS55ICs9IHBsYXllclBpZWNlc0ZyYW1lLnk7XG59O1xuY29uc3QgcmVzZXRUb2tlbnMgPSAoKSA9PiB7XG4gICAgY29uc3QgdG9rZW5zT25Cb2FyZCA9IGNhcmRQbGF5RnJhbWUuZmluZEFsbCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgIHRva2Vuc09uQm9hcmQuZm9yRWFjaCh0b2tlbiA9PiB7IHRva2VuLnJlbW92ZSgpOyB9KTtcbiAgICBwbGF5ZXJOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBjb25zdCBwYWdlID0gbm9kZS5wYWdlO1xuICAgICAgICBjb25zdCBWb3RpbmdUb2tlbnNGcmFtZXMgPSBwYWdlLmZpbmRDaGlsZHJlbihjaGlsZCA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlbnNcIik7XG4gICAgICAgIFZvdGluZ1Rva2Vuc0ZyYW1lcy5mb3JFYWNoKGZyYW1lID0+IHsgZnJhbWUucmVtb3ZlKCk7IH0pO1xuICAgICAgICBjb25zdCB0b2tlbnNJblVzZSA9IHBhZ2UuZmluZEFsbCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgICAgICB0b2tlbnNJblVzZS5mb3JFYWNoKHRva2VuID0+IHtcbiAgICAgICAgICAgIGlmICh0b2tlbi5wYXJlbnQudHlwZSA9PT0gJ1BBR0UnIHx8IHRva2VuLnBhcmVudC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdG9rZW4ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBjdXN0b21QbGF5ZXJCb2FyZCA9IHBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgUGFnZSBUZW1wbGF0ZVwiKTtcbiAgICAgICAgbW92ZVZvdGluZ1Rva2VucyhwYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgfSk7XG59O1xuY29uc3QgbmV4dFN0b3J5dGVsbGVyID0gKG5ld1N0b3J5dGVsbGVyKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBuZXdTdG9yeXRlbGxlciA9PSAnbnVtYmVyJykge1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IG5ld1N0b3J5dGVsbGVyO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSAoY3VycmVudFN0b3J5dGVsbGVySW5kZXggKyAxKSAlIHBsYXllcnMubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdCBjdXJyQ29sb3IgPSBwbGF5ZXJzW2N1cnJlbnRTdG9yeXRlbGxlckluZGV4XS5jb2xvcjtcbiAgICBjb25zdCBzdG9yeXRlbGxlclRva2VuID0gZGl4bWFCb2FyZFBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU3Rvcnl0ZWxsZXIgQmFkZ2VcIik7XG4gICAgY29uc3Qgc3Rvcnl0ZWxsZXJJZHggPSBQTEFZRVJfT1JERVIuaW5kZXhPZihjdXJyQ29sb3IpO1xuICAgIHN0b3J5dGVsbGVyVG9rZW4ueSA9IDEwMiArIDQ0ICogc3Rvcnl0ZWxsZXJJZHg7XG59O1xuY29uc3QgcmVzZXREZWFsdENhcmRzID0gKCkgPT4ge1xuICAgIGRlY2tQYWdlLmNoaWxkcmVuLmZvckVhY2goKGltYWdlKSA9PiBpbWFnZS5zZXRQbHVnaW5EYXRhKFwiZGVhbHRcIiwgXCJmYWxzZVwiKSk7XG59O1xuY29uc3QgY2xlYXJQbGF5ZXJQaWVjZXNGcm9tQm9hcmQgPSAoKSA9PiB7XG4gICAgY29uc3QgcGxheWVyUGllY2VzID0gZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkcmVuKGMgPT4gKFBMQVlFUl9PUkRFUi5pbmRleE9mKGMubmFtZSkgPiAtMSkpO1xuICAgIHBsYXllclBpZWNlcy5mb3JFYWNoKHBpZWNlID0+IHsgcGllY2UucmVtb3ZlKCk7IH0pO1xufTtcbmNvbnN0IGNsZWFyUGxheWVyTmFtZXMgPSAoKSA9PiB7XG4gICAgcGxheWVyc0ZyYW1lLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIC8vIElnbm9yZSBpbnN0cnVjdGlvbiB0ZXh0IG5vZGVzLCB3ZSBvbmx5IG5lZWQgdG8gbG9vayBhdCB0aGUgcGxheWVyc1xuICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJOYW1lID0gY2hpbGQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJwbGF5ZXIgbmFtZVwiKTtcbiAgICAgICAgICAgIGZpZ21hXG4gICAgICAgICAgICAgICAgLmxvYWRGb250QXN5bmMoeyBmYW1pbHk6IFwiUm9ib3RvIFNsYWJcIiwgc3R5bGU6IFwiUmVndWxhclwiIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gKHBsYXllck5hbWUuY2hhcmFjdGVycyA9IEVNUFRZX1BMQVlFUl9TVFJJTkcpKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmNvbnN0IHJlc2V0R2FtZSA9ICgpID0+IHtcbiAgICBnYW1lUGhhc2UgPSBQSEFTRVMuTk9fR0FNRTtcbiAgICBwbGF5ZXJzID0gW107XG4gICAgcGxheWVyTm9kZXMgPSBbXTtcbiAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IDA7XG4gICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICBjbGVhckNhcmRzRnJvbVBsYXlBcmVhKCk7XG4gICAgZGVsZXRlUGxheWVyUGFnZXMoKTtcbiAgICByZXNldERlYWx0Q2FyZHMoKTtcbiAgICBjbGVhclBsYXllclBpZWNlc0Zyb21Cb2FyZCgpO1xufTtcbi8vIFJVTlMgT04gTEFVTkNIIC0gY2hlY2sgZm9yIGdhbWUgc3RhdGUgZXZlcnkgc2Vjb25kXG5pZiAocGllY2VzQXJlUmVhZHkoKSkge1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICB1cGRhdGVQbHVnaW5TdGF0ZUZyb21Eb2N1bWVudCgpO1xuICAgIH0sIDEwMDApO1xufVxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuY29uc3QgaGV4VG9SR0IgPSAoaGV4KSA9PiB7XG4gICAgY29uc3QgaCA9IChoZXguY2hhckF0KDApID09IFwiI1wiKSA/IGhleC5zdWJzdHJpbmcoMSwgNykgOiBoZXg7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcjogcGFyc2VJbnQoaC5zdWJzdHJpbmcoMCwgMiksIDE2KSAvIDI1NSxcbiAgICAgICAgZzogcGFyc2VJbnQoaC5zdWJzdHJpbmcoMiwgNCksIDE2KSAvIDI1NSxcbiAgICAgICAgYjogcGFyc2VJbnQoaC5zdWJzdHJpbmcoNCwgNiksIDE2KSAvIDI1NVxuICAgIH07XG59O1xuY29uc3QgY2xvbmUgPSAodmFsdWUpID0+IHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xufTtcbmNvbnN0IHNjYWxlSW1hZ2UgPSAoaW1hZ2UsIG1heFdpZHRoLCBtYXhIZWlnaHQpID0+IHtcbiAgICBpZiAoaW1hZ2Uud2lkdGggPiBtYXhXaWR0aCkge1xuICAgICAgICBjb25zdCBuZXdIZWlnaHQgPSBpbWFnZS5oZWlnaHQgLyAoaW1hZ2Uud2lkdGggLyBtYXhXaWR0aCk7XG4gICAgICAgIGlmIChuZXdIZWlnaHQgPiBtYXhIZWlnaHQpIHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1dpZHRoID0gbWF4V2lkdGggLyAobmV3SGVpZ2h0IC8gbWF4SGVpZ2h0KTtcbiAgICAgICAgICAgIGltYWdlLnJlc2l6ZShuZXdXaWR0aCwgbWF4SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGltYWdlLnJlc2l6ZShtYXhXaWR0aCwgbmV3SGVpZ2h0KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5mdW5jdGlvbiBkZWVwRXF1YWwob2JqZWN0MSwgb2JqZWN0Mikge1xuICAgIGNvbnN0IGtleXMxID0gT2JqZWN0LmtleXMob2JqZWN0MSk7XG4gICAgY29uc3Qga2V5czIgPSBPYmplY3Qua2V5cyhvYmplY3QyKTtcbiAgICBpZiAoa2V5czEubGVuZ3RoICE9PSBrZXlzMi5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzMSkge1xuICAgICAgICBjb25zdCB2YWwxID0gb2JqZWN0MVtrZXldO1xuICAgICAgICBjb25zdCB2YWwyID0gb2JqZWN0MltrZXldO1xuICAgICAgICBjb25zdCBhcmVPYmplY3RzID0gaXNPYmplY3QodmFsMSkgJiYgaXNPYmplY3QodmFsMik7XG4gICAgICAgIGlmIChhcmVPYmplY3RzICYmICFkZWVwRXF1YWwodmFsMSwgdmFsMikgfHxcbiAgICAgICAgICAgICFhcmVPYmplY3RzICYmIHZhbDEgIT09IHZhbDIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3QgIT0gbnVsbCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0Jztcbn1cbi8vICBEdXJzdGVuZmVsZCBTaHVmZmxlLCBjb3BpZWQgZnJvbSBTdGFjayBPdmVyZmxvd1xuZnVuY3Rpb24gc2h1ZmZsZUFycmF5KGFycmF5KSB7XG4gICAgbGV0IGFycmF5Q29weSA9IGNsb25lKGFycmF5KTtcbiAgICBmb3IgKGxldCBpID0gYXJyYXlDb3B5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgaiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChpICsgMSkpO1xuICAgICAgICBbYXJyYXlDb3B5W2ldLCBhcnJheUNvcHlbal1dID0gW2FycmF5Q29weVtqXSwgYXJyYXlDb3B5W2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5Q29weTtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=