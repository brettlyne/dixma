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
    let availableCards = deckPage.children.filter(card => !(card.getPluginData("dealt") && card.getPluginData("dealt") === "true"));
    playerNodes.forEach(playerNode => {
        const playerPage = playerNode.page;
        const cards = playerPage.findChildren((child) => child.name === CARD_NAME);
        for (let i = cards.length; i < 6; i++) {
            const randomIndex = Math.floor(Math.random() * availableCards.length);
            const randomImage = availableCards.splice(randomIndex, 1)[0];
            randomImage.setPluginData("dealt", "true");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsT0FBTztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmZpZ21hLnVpLnJlc2l6ZSgzMjAsIDY2MCk7XG4vLyB2YXJpYWJsZXMgdG8gc3RvcmUgZ2FtZSBwaWVjZSBub2RlcyAocGFnZXMsZnJhbWVzLGV0YylcbmxldCBkaXhtYUJvYXJkUGFnZTtcbmxldCBkZWNrUGFnZTtcbmxldCBjb21wb25lbnRzUGFnZTtcbmxldCBwbGF5ZXJQYWdlVGVtcGxhdGU7XG5sZXQgY2FyZFBsYXlGcmFtZTtcbmxldCBwbGF5ZXJzRnJhbWU7XG5sZXQgc3Rvcnl0ZWxsZXJCYWRnZU5vZGU7XG4vLyBjb25zdGFudHNcbmNvbnN0IFBIQVNFUyA9IHtcbiAgICBQSUVDRVNfTUlTU0lORzogXCJyZXF1aXJlZCBnYW1lIGVsZW1lbnRzIG5vdCBwcmVzZW50IGluIGZpbGVcIixcbiAgICBOT19HQU1FOiBcIm5vIGFjdGl2ZSBnYW1lXCIsXG4gICAgUElDS0lORzogXCJwbGF5ZXJzIGFyZSBwaWNraW5nIGNhcmRzXCIsXG4gICAgVk9USU5HOiBcInBsYXllcnMgYXJlIHZvdGluZ1wiLFxuICAgIFNDT1JJTkc6IFwicGxheWVycyBhcmUgbW92aW5nIHRoZWlyIHRva2VucyBvbiB0aGUgc2NvcmUgdHJhY2tpbmcgYm9hcmRcIlxufTtcbmNvbnN0IEVNUFRZX1BMQVlFUl9TVFJJTkcgPSBcIn4gfiB+IH4gfiB+IH4gflwiO1xuY29uc3QgUExBWUVSX09SREVSID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwiZ29sZFwiLCBcImxpbWVcIiwgXCJncmVlblwiLCBcInR1cnF1b2lzZVwiLCBcImJsdWVcIiwgXCJ2aW9sZXRcIiwgXCJwdXJwbGVcIiwgXCJibGFja1wiLCBcInNpbHZlclwiLCBcIndoaXRlXCJdO1xuY29uc3QgQ09MT1JTX0FTX0hFWCA9IHtcbiAgICByZWQ6IFwiRkYwMDAwXCIsIG9yYW5nZTogXCJGRjgwMEFcIiwgZ29sZDogXCJGRkQ3MDBcIiwgbGltZTogXCJCREZGMDBcIixcbiAgICBncmVlbjogXCIwMDgwMDBcIiwgdHVycXVvaXNlOiBcIjQwRTBEMFwiLCBibHVlOiBcIjAwMDBDRFwiLCB2aW9sZXQ6IFwiRUU4MkVFXCIsXG4gICAgcHVycGxlOiBcIjgwMDA4MFwiLCBibGFjazogXCIwMDAwMDBcIiwgc2lsdmVyOiBcIkMwQzBDMFwiLCB3aGl0ZTogXCJGRkZGRkZcIlxufTtcbmNvbnN0IFZPVElOR19UT0tFTlNfTkFNRSA9IFwiVm90aW5nIFRva2Vuc1wiO1xuY29uc3QgQ0FSRF9OQU1FID0gXCJDYXJkXCI7XG5jb25zdCBDQVJEX1NMT1RfUEFERElORyA9IDU7XG5jb25zdCBDQVJEX1NJWkUgPSAxNTA7XG4vLyBnYW1lIHN0YXRlIHZhcmlhYmxlc1xubGV0IHBsYXllcnMgPSBbXTtcbmxldCBwbGF5ZXJOb2RlcyA9IFtdO1xubGV0IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gMDsgLy8gcGxheWVyIGluZGV4IG9mIGN1cnJlbnQgc3Rvcnl0ZWxsZXJcbmxldCBnYW1lUGhhc2UgPSBQSEFTRVMuTk9fR0FNRTtcbi8vIGhhbmRsZSBtZXNzYWdlcyBmcm9tIHBsdWdpbiBVSVxuZmlnbWEudWkub25tZXNzYWdlID0gKG1zZykgPT4ge1xuICAgIHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50KCk7XG4gICAgaWYgKG1zZy50eXBlID09PSBcInRlc3RpbmdcIikge1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwic3RhcnQtZ2FtZVwiKSB7XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5OT19HQU1FICYmIHBpZWNlc0FyZVJlYWR5KCkgJiYgcGxheWVyc0FyZVJlYWR5KCkpIHtcbiAgICAgICAgICAgIC8vIHN0YXJ0IHRoZSBnYW1lXG4gICAgICAgICAgICBzZXR1cFBsYXllclBpZWNlc09uR2FtZUJvYXJkKCk7XG4gICAgICAgICAgICBnYW1lUGhhc2UgPSBQSEFTRVMuUElDS0lORztcbiAgICAgICAgICAgIG5leHRTdG9yeXRlbGxlcigwKTtcbiAgICAgICAgICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICAgICAgICAgIGNyZWF0ZVBsYXllclBhZ2UocGxheWVyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgICAgICAgICAgZGVhbENhcmRzKCk7XG4gICAgICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXZlYWwtY2FyZHNcIiAmJiBnYW1lUGhhc2UgPT09IFBIQVNFUy5QSUNLSU5HKSB7XG4gICAgICAgIG1vdmVDYXJkc1RvR2FtZUJvYXJkKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXZlYWwtdG9rZW5zXCIgJiYgZ2FtZVBoYXNlID09PSBQSEFTRVMuVk9USU5HKSB7XG4gICAgICAgIG1vdmVUb2tlbnNUb0dhbWVCb2FyZCgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwibmV3LXJvdW5kXCIgJiYgZ2FtZVBoYXNlID09PSBQSEFTRVMuU0NPUklORykge1xuICAgICAgICBjbGVhckNhcmRzRnJvbVBsYXlBcmVhKCk7XG4gICAgICAgIGRlYWxDYXJkcygpO1xuICAgICAgICByZXNldFRva2VucygpO1xuICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIoKTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlBJQ0tJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJuZXctcGxheWVyc1wiKSB7XG4gICAgICAgIGNvbnN0IG9sZFBsYXllck5hbWVzID0gcGxheWVycy5tYXAocGxheWVyID0+IHBsYXllci5uYW1lKTtcbiAgICAgICAgaWYgKHBsYXllcnNBcmVSZWFkeSgpKSB7XG4gICAgICAgICAgICBwbGF5ZXJzLmZvckVhY2goKHBsYXllciwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChvbGRQbGF5ZXJOYW1lcy5pbmRleE9mKHBsYXllci5uYW1lKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KGAke3BsYXllci5uYW1lfSB3aWxsIGdldCBjYXJkcyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBuZXh0IHJvdW5kLmApO1xuICAgICAgICAgICAgICAgICAgICBjcmVhdGVQbGF5ZXJQYWdlKHBsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIGFkZFBsYXllclBpZWNlKHBsYXllci5jb2xvcik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpIDw9IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgICAgICAgICAgZGVhbENhcmRzKCk7XG4gICAgICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtc2cudHlwZS5zdGFydHNXaXRoKCdzZXQtc3Rvcnl0ZWxsZXItaW5kZXgtJykpIHtcbiAgICAgICAgY29uc3QgbmV3U3Rvcnl0ZWxsZXIgPSBwYXJzZUludChtc2cudHlwZS5yZXBsYWNlKCdzZXQtc3Rvcnl0ZWxsZXItaW5kZXgtJywgJycpKTtcbiAgICAgICAgaWYgKCFpc05hTihuZXdTdG9yeXRlbGxlcikgJiYgbmV3U3Rvcnl0ZWxsZXIgPj0gMCAmJiBuZXdTdG9yeXRlbGxlciA8IHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBuZXh0U3Rvcnl0ZWxsZXIobmV3U3Rvcnl0ZWxsZXIpO1xuICAgICAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmVzZXQtZ2FtZVwiKSB7XG4gICAgICAgIHJlc2V0R2FtZSgpO1xuICAgIH1cbiAgICBpZiAobXNnLnR5cGUgPT09IFwicmVzZXQtZ2FtZS1hbmQtY2xlYXItcGxheWVyc1wiKSB7XG4gICAgICAgIHJlc2V0R2FtZSgpO1xuICAgICAgICBjbGVhclBsYXllck5hbWVzKCk7XG4gICAgfVxufTtcbmNvbnN0IHBpZWNlc0FyZVJlYWR5ID0gKCkgPT4ge1xuICAgIGRpeG1hQm9hcmRQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRpeG1hIEJvYXJkXCIpO1xuICAgIGRlY2tQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRlY2tcIik7XG4gICAgY29tcG9uZW50c1BhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ29tcG9uZW50c1wiKTtcbiAgICBwbGF5ZXJQYWdlVGVtcGxhdGUgPSBjb21wb25lbnRzUGFnZSAmJiBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQYWdlIFRlbXBsYXRlXCIpO1xuICAgIGNhcmRQbGF5RnJhbWUgPSBkaXhtYUJvYXJkUGFnZSAmJiBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgUGxheSBBcmVhXCIpO1xuICAgIHBsYXllcnNGcmFtZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyc1wiKTtcbiAgICBzdG9yeXRlbGxlckJhZGdlTm9kZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlN0b3J5dGVsbGVyIEJhZGdlXCIpO1xuICAgIGlmICghKGRpeG1hQm9hcmRQYWdlICYmIGRlY2tQYWdlICYmIGNvbXBvbmVudHNQYWdlICYmIHBsYXllclBhZ2VUZW1wbGF0ZSAmJiBjYXJkUGxheUZyYW1lICYmIHBsYXllcnNGcmFtZSAmJiBzdG9yeXRlbGxlckJhZGdlTm9kZSkpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiR2FtZSBwaWVjZSBub3QgZm91bmQuIFVzZSBEaXhtYSB0ZW1wbGF0ZSBmaWxlIC8gY2hlY2sgdGhhdCBub3RoaW5nIHdhcyBhY2NpZGVudGFsbHkgZGVsZXRlZCBvciByZW5hbWVkLiBTZWUgY29uc29sZS4uLlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJFYWNoIG9mIHRoZSBmb2xsb3dpbmcgc2hvdWxkIGJlIGRlZmluZWQuXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBkaXhtYUJvYXJkUGFnZSwgZGVja1BhZ2UsIGNvbXBvbmVudHNQYWdlLCBwbGF5ZXJQYWdlVGVtcGxhdGUsXG4gICAgICAgICAgICBjYXJkUGxheUZyYW1lLCBwbGF5ZXJzRnJhbWUsIHN0b3J5dGVsbGVyQmFkZ2VOb2RlXG4gICAgICAgIH0pLnNwbGl0KCcsJykuam9pbignXFxuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHBsYXllcnNBcmVSZWFkeSA9ICgpID0+IHtcbiAgICBsZXQgbmV3UGxheWVycyA9IFtdO1xuICAgIHBsYXllcnNGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgaW5zdHJ1Y3Rpb24gdGV4dCBub2Rlcywgd2Ugb25seSBuZWVkIHRvIGxvb2sgYXQgdGhlIHBsYXllcnNcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09IFwiSU5TVEFOQ0VcIikge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZU5vZGUgPSBjaGlsZC5maW5kQ2hpbGQoKGdyYW5kY2hpbGQpID0+IGdyYW5kY2hpbGQubmFtZSA9PT0gXCJwbGF5ZXIgbmFtZVwiKTtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWUgPSBwbGF5ZXJOYW1lTm9kZS5jaGFyYWN0ZXJzO1xuICAgICAgICAgICAgaWYgKHBsYXllck5hbWUgJiYgcGxheWVyTmFtZSAhPT0gRU1QVFlfUExBWUVSX1NUUklORykge1xuICAgICAgICAgICAgICAgIG5ld1BsYXllcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBsYXllck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjaGlsZC5uYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAobmV3UGxheWVycy5sZW5ndGggPCA0KSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeSgnTmVlZCBhdCBsZWFzdCA0IHBsYXllcnMgdG8gc3RhcnQgYSBnYW1lLicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHBsYXllck5hbWVzID0gbmV3UGxheWVycy5tYXAocGxheWVyID0+IHBsYXllci5uYW1lKTtcbiAgICBpZiAocGxheWVyTmFtZXMubGVuZ3RoICE9PSBuZXcgU2V0KHBsYXllck5hbWVzKS5zaXplKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeSgnRHVwbGljYXRlIG5hbWVzIG5vdCBhbGxvd2VkLicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHBsYXllcnMgPSBuZXdQbGF5ZXJzO1xuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcInBsYXllcnNcIiwgSlNPTi5zdHJpbmdpZnkocGxheWVycykpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImdhbWVQaGFzZVwiLCBnYW1lUGhhc2UpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImN1cnJlbnRTdG9yeXRlbGxlckluZGV4XCIsIGAke2N1cnJlbnRTdG9yeXRlbGxlckluZGV4fWApO1xufTtcbmNvbnN0IHJlc2V0RG9jdW1lbnRTdGF0ZSA9ICgpID0+IHtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJwbGF5ZXJzXCIsIEpTT04uc3RyaW5naWZ5KFtdKSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiZ2FtZVBoYXNlXCIsIFBIQVNFUy5OT19HQU1FKTtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleFwiLCAnMCcpO1xufTtcbmNvbnN0IHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IHBsYXllckRhdGEgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ3BsYXllcnMnKTtcbiAgICBjb25zdCBuZXdHYW1lUGhhc2UgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ2dhbWVQaGFzZScpO1xuICAgIGlmICghcGxheWVyRGF0YSB8fCAhbmV3R2FtZVBoYXNlKSB7XG4gICAgICAgIHJlc2V0RG9jdW1lbnRTdGF0ZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG5ld1BsYXllcnMgPSBKU09OLnBhcnNlKHBsYXllckRhdGEpO1xuICAgIGNvbnN0IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gcGFyc2VJbnQoZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCcpKTtcbiAgICBpZiAoZ2FtZVBoYXNlICE9PSBuZXdHYW1lUGhhc2UgfHxcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggIT09IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4KSB7XG4gICAgICAgIGdhbWVQaGFzZSA9IG5ld0dhbWVQaGFzZTtcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSBuZXdDdXJyZW50U3Rvcnl0ZWxsZXJJbmRleDtcbiAgICB9XG4gICAgaWYgKCFkZWVwRXF1YWwocGxheWVycywgbmV3UGxheWVycykpIHtcbiAgICAgICAgcGxheWVycyA9IG5ld1BsYXllcnM7XG4gICAgICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbiAgICB9XG4gICAgY29uc3QgcGxheWVyc1dpdGhTdGF0dXMgPSBnZXRQbGF5ZXJzV2l0aFN0YXR1cygpO1xuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHtcbiAgICAgICAgdHlwZTogJ0dBTUVfU1RBVEUnLFxuICAgICAgICBwbGF5ZXJzOiBwbGF5ZXJzV2l0aFN0YXR1cyxcbiAgICAgICAgZ2FtZVBoYXNlLFxuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleFxuICAgIH0pO1xufTtcbmNvbnN0IHBvcHVsYXRlUGxheWVyTm9kZXMgPSAoKSA9PiB7XG4gICAgcGxheWVyTm9kZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICAgICAgY29uc3QgcGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gcGxheWVyLm5hbWUpO1xuICAgICAgICBpZiAoIXBhZ2UpIHtcbiAgICAgICAgICAgIHJlbW92ZVBsYXllckJ5SW5kZXgoaSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzZWxlY3RlZENhcmRBcmVhID0gcGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDYXJkIFNlbGVjdGlvbiBBcmVhXCIpO1xuICAgICAgICBjb25zdCBzZWxlY3RlZFRva2VuQXJlYSA9IHBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVG9rZW4gU2VsZWN0aW9uIEFyZWFcIik7XG4gICAgICAgIHBsYXllck5vZGVzLnB1c2goeyBwYWdlLCBzZWxlY3RlZENhcmRBcmVhLCBzZWxlY3RlZFRva2VuQXJlYSB9KTtcbiAgICB9XG59O1xuY29uc3QgZ2V0UGxheWVyc1dpdGhTdGF0dXMgPSAoKSA9PiB7XG4gICAgY29uc3QgcGxheWVyc1dpdGhTdGF0dXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgcGxheWVyID0gcGxheWVyc1tpXTtcbiAgICAgICAgY29uc3QgaXNTdG9yeXRlbGxlciA9IChpID09PSBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCk7XG4gICAgICAgIGNvbnN0IHBsYXllck5vZGUgPSBwbGF5ZXJOb2Rlc1tpXTtcbiAgICAgICAgaWYgKCFwbGF5ZXJOb2RlLnBhZ2UgfHwgcGxheWVyTm9kZS5wYWdlLnJlbW92ZWQpIHsgLy8gcGFnZSBoYXMgYmVlbiBkZWxldGVkIC0+IHJlbW92ZSBwbGF5ZXJcbiAgICAgICAgICAgIHJlbW92ZVBsYXllckJ5SW5kZXgoaSk7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UGxheWVyc1dpdGhTdGF0dXMoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc3RhdHVzO1xuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuUElDS0lORykge1xuICAgICAgICAgICAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gcGxheWVyTm9kZS5zZWxlY3RlZENhcmRBcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSk7XG4gICAgICAgICAgICBzdGF0dXMgPSAoc2VsZWN0ZWRDYXJkID8gXCJkb25lLXdpdGgtYWN0aW9uXCIgOiBcInBpY2tpbmctY2FyZFwiKTtcbiAgICAgICAgICAgIGlmIChpc1N0b3J5dGVsbGVyKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gXCJzdG9yeXRlbGxlci1cIiArIHN0YXR1cztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuVk9USU5HKSB7XG4gICAgICAgICAgICBpZiAoaXNTdG9yeXRlbGxlcikge1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9ICdzdG9yeXRlbGxlcic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzZWxlY3RlZFRva2VuID0gcGxheWVyTm9kZS5zZWxlY3RlZFRva2VuQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlblwiKTtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSAoc2VsZWN0ZWRUb2tlbiA/IFwiZG9uZS13aXRoLWFjdGlvblwiIDogXCJ2b3RpbmdcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLlNDT1JJTkcpIHtcbiAgICAgICAgICAgIHN0YXR1cyA9IChpc1N0b3J5dGVsbGVyID8gJ3N0b3J5dGVsbGVyLXNjb3JpbmcnIDogJ3Njb3JpbmcnKTtcbiAgICAgICAgfVxuICAgICAgICBwbGF5ZXJzV2l0aFN0YXR1cy5wdXNoKE9iamVjdC5hc3NpZ24oT2JqZWN0LmFzc2lnbih7fSwgcGxheWVyKSwgeyBzdGF0dXMgfSkpO1xuICAgIH1cbiAgICA7XG4gICAgcmV0dXJuIHBsYXllcnNXaXRoU3RhdHVzO1xufTtcbi8vIGNhbGxlZCB0byByZW1vdmUgYSBwbGF5ZXIgZnJvbSB0aGUgZ2FtZSBzdGF0ZSAocHJvYmFibHkgYmVjYXVzZSB0aGV5IG5vIGxvbmdlciBoYXZlIGEgcGxheWVyIHBhZ2UpXG5jb25zdCByZW1vdmVQbGF5ZXJCeUluZGV4ID0gKGkpID0+IHtcbiAgICBwbGF5ZXJzLnNwbGljZShpLCAxKTtcbiAgICBpZiAoaSA8IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4KSB7XG4gICAgICAgIG5leHRTdG9yeXRlbGxlcihjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCAtIDEpO1xuICAgIH1cbiAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIHBvcHVsYXRlUGxheWVyTm9kZXMoKTtcbn07XG5jb25zdCBjcmVhdGVQbGF5ZXJQYWdlID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IHBsYXllclBhZ2UgPSBmaWdtYS5jcmVhdGVQYWdlKCk7XG4gICAgcGxheWVyUGFnZS5zZXRQbHVnaW5EYXRhKCdpc1BsYXllclBhZ2UnLCAndHJ1ZScpO1xuICAgIHBsYXllclBhZ2UubmFtZSA9IHBsYXllci5uYW1lO1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gY3JlYXRlUGxheWVyQm9hcmQocGxheWVyKTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICBjdXN0b21QbGF5ZXJCb2FyZC5sb2NrZWQgPSB0cnVlO1xuICAgIG1vdmVWb3RpbmdUb2tlbnMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIC8vIGRlYWxGaXJzdEhhbmQocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHJldHVybiBwbGF5ZXJQYWdlO1xufTtcbmNvbnN0IGNyZWF0ZVBsYXllckJvYXJkID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gcGxheWVyUGFnZVRlbXBsYXRlLmNsb25lKCk7XG4gICAgLy8gQ3VzdG9taXplIHBhZ2Ugd2l0aCBwbGF5ZXIgbmFtZVxuICAgIGNvbnN0IHBsYXllck5hbWVFbGVtZW50ID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIE5hbWUgVGV4dFwiKTtcbiAgICBmaWdtYVxuICAgICAgICAubG9hZEZvbnRBc3luYyh7IGZhbWlseTogXCJBbWVyaWNhbiBUeXBld3JpdGVyXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9KVxuICAgICAgICAudGhlbigoKSA9PiAocGxheWVyTmFtZUVsZW1lbnQuY2hhcmFjdGVycyA9IHBsYXllci5uYW1lKSk7XG4gICAgLy8gQ29weSBpbiBwbGF5ZXIgdG9rZW4gZnJvbSBDb21wb25lbnRzIFBhZ2VcbiAgICBjb25zdCBwbGF5ZXJUb2tlbnNGcmFtZSA9IGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFRva2Vuc1wiKTtcbiAgICBjb25zdCBwbGF5ZXJUb2tlbiA9IHBsYXllclRva2Vuc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IHBsYXllci5jb2xvcikuY2xvbmUoKTtcbiAgICBwbGF5ZXJUb2tlbi5yZXNpemUoNDAsIDQwKTtcbiAgICBwbGF5ZXJUb2tlbi54ID0gNzg7XG4gICAgcGxheWVyVG9rZW4ueSA9IDc4O1xuICAgIGN1c3RvbVBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclRva2VuKTtcbiAgICAvLyBDaGFuZ2UgY29sb3Igb2Ygdm90aW5nIHRva2Vuc1xuICAgIGNvbnN0IHZvdGluZ1Rva2VucyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFZPVElOR19UT0tFTlNfTkFNRSk7XG4gICAgdm90aW5nVG9rZW5zLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuID0gY2hpbGQ7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuRmlsbHMgPSBjbG9uZSh2b3RpbmdUb2tlbi5maWxscyk7XG4gICAgICAgIHZvdGluZ1Rva2VuRmlsbHNbMF0uY29sb3IgPSBoZXhUb1JHQihDT0xPUlNfQVNfSEVYW3BsYXllci5jb2xvcl0pO1xuICAgICAgICB2b3RpbmdUb2tlbi5maWxscyA9IHZvdGluZ1Rva2VuRmlsbHM7XG4gICAgfSk7XG4gICAgcmV0dXJuIGN1c3RvbVBsYXllckJvYXJkO1xufTtcbi8vIE1vdmUgdGhlIHZvdGluZyB0b2tlbnMgb3V0IG9mIHRoZSBjb21wb25lbnQgc28gdGhleSBjYW4gYmUgZWFzaWx5IGRyYWdnZWRcbmNvbnN0IG1vdmVWb3RpbmdUb2tlbnMgPSAocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpID0+IHtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnMgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gVk9USU5HX1RPS0VOU19OQU1FKTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNQb3NpdGlvbiA9IHZvdGluZ1Rva2Vucy5hYnNvbHV0ZVRyYW5zZm9ybTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNDbG9uZSA9IHZvdGluZ1Rva2Vucy5jbG9uZSgpO1xuICAgIHZvdGluZ1Rva2Vucy52aXNpYmxlID0gZmFsc2U7XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh2b3RpbmdUb2tlbnNDbG9uZSk7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUudmlzaWJsZSA9IHRydWU7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUueCA9IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uWzBdWzJdO1xuICAgIHZvdGluZ1Rva2Vuc0Nsb25lLnkgPSB2b3RpbmdUb2tlbnNQb3NpdGlvblsxXVsyXTtcbn07XG4vLyBTZXQgdXAgYXJlYXMgb24gcGxheWVyIGJvYXJkIHRvIHNlbGVjdCBjYXJkcyAmIHRva2VucyBieSBkcm9wcGluZyB0aGVtIGluIGEgZnJhbWVcbmZ1bmN0aW9uIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpIHtcbiAgICBjb25zdCBjYXJkU2VsZWN0aW9uQXJlYSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTZWxlY3RlZCBjYXJkXCIpO1xuICAgIGNvbnN0IGNhcmRGaWxscyA9IGNsb25lKGNhcmRTZWxlY3Rpb25BcmVhLmZpbGxzKTtcbiAgICBjYXJkRmlsbHNbMF0ub3BhY2l0eSA9IDA7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEubmFtZSA9IFwiQ2FyZCBTZWxlY3Rpb24gQXJlYVwiO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnJlc2l6ZShzZWxlY3RlZENhcmQud2lkdGgsIHNlbGVjdGVkQ2FyZC5oZWlnaHQpO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnggPSBzZWxlY3RlZENhcmQuYWJzb2x1dGVUcmFuc2Zvcm1bMF1bMl07XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkQ2FyZC5hYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGNhcmRTZWxlY3Rpb25BcmVhKTtcbiAgICBjb25zdCB0b2tlblNlbGVjdGlvbkFyZWEgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkVG9rZW4gPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlNlbGVjdGVkIHZvdGluZyB0b2tlblwiKTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLm5hbWUgPSBcIlRva2VuIFNlbGVjdGlvbiBBcmVhXCI7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLmNvcm5lclJhZGl1cyA9IDEwO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5yZXNpemUoc2VsZWN0ZWRUb2tlbi53aWR0aCwgc2VsZWN0ZWRUb2tlbi5oZWlnaHQpO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS54ID0gc2VsZWN0ZWRUb2tlbi5hYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkVG9rZW4uYWJzb2x1dGVUcmFuc2Zvcm1bMV1bMl07XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh0b2tlblNlbGVjdGlvbkFyZWEpO1xufVxuY29uc3QgSEFORF9YID0gODc7XG5jb25zdCBIQU5EX1kgPSAzMTY7XG5jb25zdCBIQU5EX1NQQUNJTkcgPSAxNzQ7XG5jb25zdCBkZWFsQ2FyZHMgPSAoKSA9PiB7XG4gICAgbGV0IGF2YWlsYWJsZUNhcmRzID0gZGVja1BhZ2UuY2hpbGRyZW4uZmlsdGVyKGNhcmQgPT4gIShjYXJkLmdldFBsdWdpbkRhdGEoXCJkZWFsdFwiKSAmJiBjYXJkLmdldFBsdWdpbkRhdGEoXCJkZWFsdFwiKSA9PT0gXCJ0cnVlXCIpKTtcbiAgICBwbGF5ZXJOb2Rlcy5mb3JFYWNoKHBsYXllck5vZGUgPT4ge1xuICAgICAgICBjb25zdCBwbGF5ZXJQYWdlID0gcGxheWVyTm9kZS5wYWdlO1xuICAgICAgICBjb25zdCBjYXJkcyA9IHBsYXllclBhZ2UuZmluZENoaWxkcmVuKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IGNhcmRzLmxlbmd0aDsgaSA8IDY7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcmFuZG9tSW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhdmFpbGFibGVDYXJkcy5sZW5ndGgpO1xuICAgICAgICAgICAgY29uc3QgcmFuZG9tSW1hZ2UgPSBhdmFpbGFibGVDYXJkcy5zcGxpY2UocmFuZG9tSW5kZXgsIDEpWzBdO1xuICAgICAgICAgICAgcmFuZG9tSW1hZ2Uuc2V0UGx1Z2luRGF0YShcImRlYWx0XCIsIFwidHJ1ZVwiKTtcbiAgICAgICAgICAgIGNvbnN0IG5ld0NhcmQgPSBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNBUkRfVEVNUExBVEVcIikuY2xvbmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGltYWdlRmlsbCA9IE9iamVjdC5hc3NpZ24oe30sIG5ld0NhcmQuZmlsbHNbMV0pO1xuICAgICAgICAgICAgaW1hZ2VGaWxsLmltYWdlSGFzaCA9IHJhbmRvbUltYWdlLmZpbGxzWzBdLmltYWdlSGFzaDtcbiAgICAgICAgICAgIGNvbnN0IG5ld0ZpbGxzID0gW25ld0NhcmQuZmlsbHNbMF0sIGltYWdlRmlsbF07XG4gICAgICAgICAgICBuZXdDYXJkLmZpbGxzID0gbmV3RmlsbHM7XG4gICAgICAgICAgICBuZXdDYXJkLm5hbWUgPSBDQVJEX05BTUU7XG4gICAgICAgICAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKG5ld0NhcmQpO1xuICAgICAgICAgICAgY2FyZHMucHVzaChuZXdDYXJkKTtcbiAgICAgICAgfVxuICAgICAgICBjYXJkcy5zb3J0KChhLCBiKSA9PiAoYS54IC0gYi54KSk7XG4gICAgICAgIGNhcmRzLmZvckVhY2goKGNhcmQsIGkpID0+IHtcbiAgICAgICAgICAgIGNhcmQueCA9IEhBTkRfWCArIGkgKiBIQU5EX1NQQUNJTkc7XG4gICAgICAgICAgICBjYXJkLnkgPSBIQU5EX1k7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcbmNvbnN0IG1vdmVDYXJkc1RvR2FtZUJvYXJkID0gKCkgPT4ge1xuICAgIGxldCBjYXJkc1RvTW92ZSA9IHBsYXllck5vZGVzLm1hcChub2RlID0+IG5vZGUuc2VsZWN0ZWRDYXJkQXJlYS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpKTtcbiAgICBsZXQgYWxsUGxheWVyc0FyZVJlYWR5ID0gdHJ1ZTtcbiAgICBsZXQgc2h1ZmZsZWRJbmRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjYXJkc1RvTW92ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBzaHVmZmxlZEluZGljZXMucHVzaChpKTtcbiAgICAgICAgaWYgKCFjYXJkc1RvTW92ZVtpXSkge1xuICAgICAgICAgICAgYWxsUGxheWVyc0FyZVJlYWR5ID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBzaHVmZmxlZEluZGljZXMgPSBzaHVmZmxlQXJyYXkoc2h1ZmZsZWRJbmRpY2VzKTtcbiAgICBpZiAoYWxsUGxheWVyc0FyZVJlYWR5KSB7XG4gICAgICAgIGNhcmRzVG9Nb3ZlLmZvckVhY2goKHNlbGVjdGVkQ2FyZCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHBsYWNlQ2FyZEluR2FtZUJvYXJkKHNlbGVjdGVkQ2FyZCwgc2h1ZmZsZWRJbmRpY2VzW2luZGV4XSk7XG4gICAgICAgIH0pO1xuICAgICAgICBnYW1lUGhhc2UgPSBQSEFTRVMuVk9USU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiTm90IGFsbCBwbGF5ZXJzIGhhdmUgc2VsZWN0ZWQgYSBjYXJkLlwiKTtcbiAgICB9XG59O1xuY29uc3QgbW92ZVRva2Vuc1RvR2FtZUJvYXJkID0gKCkgPT4ge1xuICAgIGNvbnN0IHRva2Vuc1RvTW92ZSA9IFtdO1xuICAgIGxldCBhbGxSZWFkeSA9IHRydWU7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwbGF5ZXJOb2Rlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY3VycmVudFN0b3J5dGVsbGVySW5kZXggPT09IGkpXG4gICAgICAgICAgICBjb250aW51ZTsgLy8gc3Rvcnl0ZWxsZXIgZG9lcyBub3Qgdm90ZVxuICAgICAgICBjb25zdCBzZWxlY3RlZFRva2VuQXJlYSA9IHBsYXllck5vZGVzW2ldLnNlbGVjdGVkVG9rZW5BcmVhO1xuICAgICAgICBjb25zdCB0b2tlbiA9IHNlbGVjdGVkVG9rZW5BcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgICAgICB0b2tlbi5zZXRQbHVnaW5EYXRhKFwiY29sb3JcIiwgcGxheWVyc1tpXS5jb2xvcik7XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgICAgdG9rZW5zVG9Nb3ZlLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYWxsUmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChhbGxSZWFkeSkge1xuICAgICAgICB0b2tlbnNUb01vdmUuZm9yRWFjaCgodG9rZW4sIGkpID0+IHsgcGxhY2VUb2tlbkluR2FtZUJvYXJkKHRva2VuLCBpKTsgfSk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5TQ09SSU5HO1xuICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiTm90IGFsbCBwbGF5ZXJzIGhhdmUgdm90ZWQuXCIpO1xuICAgIH1cbn07XG5jb25zdCBDQVJEU19YX09GRlNFVCA9IDY1O1xuY29uc3QgQ0FSRFNfWV9PRkZTRVQgPSA5MDtcbmNvbnN0IENBUkRTX0NPTF9XSURUSCA9IDE4ODtcbmNvbnN0IENBUkRTX1JPV19IRUlHSFQgPSAyMjA7XG5jb25zdCBDQVJEU19TSVpFID0gMTYwO1xuY29uc3QgcGxhY2VDYXJkSW5HYW1lQm9hcmQgPSAoY2FyZCwgY2FyZEluZGV4KSA9PiB7XG4gICAgY2FyZC54ID0gQ0FSRFNfWF9PRkZTRVQgKyAoY2FyZEluZGV4ICUgNCkgKiBDQVJEU19DT0xfV0lEVEggKyAoQ0FSRFNfU0laRSAtIGNhcmQud2lkdGgpIC8gMjtcbiAgICBjYXJkLnkgPVxuICAgICAgICBDQVJEU19ZX09GRlNFVCArXG4gICAgICAgICAgICBNYXRoLmZsb29yKGNhcmRJbmRleCAvIDQpICogQ0FSRFNfUk9XX0hFSUdIVCArXG4gICAgICAgICAgICAoQ0FSRFNfU0laRSAtIGNhcmQuaGVpZ2h0KSAvIDI7XG4gICAgY2FyZFBsYXlGcmFtZS5hcHBlbmRDaGlsZChjYXJkKTtcbn07XG5jb25zdCBwbGFjZVRva2VuSW5HYW1lQm9hcmQgPSAodG9rZW4sIGkpID0+IHtcbiAgICBjb25zdCB2b3RlSWR4ID0gcGFyc2VJbnQodG9rZW4uY2hpbGRyZW5bMF0uY2hhcmFjdGVycykgLSAxO1xuICAgIHRva2VuLnggPSBDQVJEU19YX09GRlNFVCArICh2b3RlSWR4ICUgNCkgKiBDQVJEU19DT0xfV0lEVEggKyAoMjAgKiAoaSAlIDcpKTtcbiAgICB0b2tlbi55ID0gKENBUkRTX1lfT0ZGU0VUICsgTWF0aC5mbG9vcih2b3RlSWR4IC8gNCkgKiBDQVJEU19ST1dfSEVJR0hUICsgKDIwICogaSkpIC0gKDgwICogTWF0aC5mbG9vcihpIC8gNykpO1xuICAgIGNvbnN0IGNvbG9yID0gdG9rZW4uZ2V0UGx1Z2luRGF0YShcImNvbG9yXCIpO1xuICAgIGlmIChjb2xvcikge1xuICAgICAgICAvLyBDb3B5IGluIHBsYXllciB0b2tlbiBmcm9tIENvbXBvbmVudHMgUGFnZVxuICAgICAgICBjb25zdCBwbGF5ZXJUb2tlbnNGcmFtZSA9IGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFRva2Vuc1wiKTtcbiAgICAgICAgY29uc3QgcGxheWVyVG9rZW4gPSBwbGF5ZXJUb2tlbnNGcmFtZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBjb2xvcikuY2xvbmUoKTtcbiAgICAgICAgcGxheWVyVG9rZW4ucmVzaXplKDM2LCAzNik7XG4gICAgICAgIHBsYXllclRva2VuLnggPSAyO1xuICAgICAgICBwbGF5ZXJUb2tlbi55ID0gMjtcbiAgICAgICAgdG9rZW4uYXBwZW5kQ2hpbGQocGxheWVyVG9rZW4pO1xuICAgIH1cbiAgICBjYXJkUGxheUZyYW1lLmFwcGVuZENoaWxkKHRva2VuKTtcbn07XG5jb25zdCBkZWxldGVQbGF5ZXJQYWdlcyA9ICgpID0+IHtcbiAgICBmaWdtYS5yb290LmNoaWxkcmVuLmZvckVhY2gocGFnZSA9PiB7XG4gICAgICAgIGlmIChwYWdlLmdldFBsdWdpbkRhdGEoXCJpc1BsYXllclBhZ2VcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHBhZ2UucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoYENvdWxkIG5vdCByZW1vdmUgcGxheWVyIHBhZ2U6ICR7cGFnZS5uYW1lfSDigJM+IFRyeSBhZ2FpbiBvciByZW1vdmUgbWFudWFsbHkuYCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENvdWxkIG5vdCByZW1vdmUgcGxheWVyIHBhZ2U6ICR7cGFnZS5uYW1lfSDigJM+IFRyeSBhZ2FpbiBvciByZW1vdmUgbWFudWFsbHkuYCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59O1xuY29uc3QgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSA9ICgpID0+IHtcbiAgICBjYXJkUGxheUZyYW1lLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIGlmIChjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpIHtcbiAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuY29uc3Qgc2V0dXBQbGF5ZXJQaWVjZXNPbkdhbWVCb2FyZCA9ICgpID0+IHtcbiAgICBwbGF5ZXJzLmZvckVhY2gocGxheWVyID0+IHtcbiAgICAgICAgYWRkUGxheWVyUGllY2UocGxheWVyLmNvbG9yKTtcbiAgICB9KTtcbn07XG5jb25zdCBhZGRQbGF5ZXJQaWVjZSA9IChjb2xvcikgPT4ge1xuICAgIGNvbnN0IHBsYXllclBpZWNlc0ZyYW1lID0gZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgUGllY2VzXCIpO1xuICAgIGNvbnN0IHBsYXllclBpZWNlID0gcGxheWVyUGllY2VzRnJhbWUuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gY29sb3IpLmNsb25lKCk7XG4gICAgZGl4bWFCb2FyZFBhZ2UuYXBwZW5kQ2hpbGQocGxheWVyUGllY2UpO1xuICAgIHBsYXllclBpZWNlLnggKz0gcGxheWVyUGllY2VzRnJhbWUueDtcbiAgICBwbGF5ZXJQaWVjZS55ICs9IHBsYXllclBpZWNlc0ZyYW1lLnk7XG59O1xuY29uc3QgcmVzZXRUb2tlbnMgPSAoKSA9PiB7XG4gICAgY29uc3QgdG9rZW5zT25Cb2FyZCA9IGNhcmRQbGF5RnJhbWUuZmluZEFsbCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgIHRva2Vuc09uQm9hcmQuZm9yRWFjaCh0b2tlbiA9PiB7IHRva2VuLnJlbW92ZSgpOyB9KTtcbiAgICBwbGF5ZXJOb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICBjb25zdCBwYWdlID0gbm9kZS5wYWdlO1xuICAgICAgICBjb25zdCBWb3RpbmdUb2tlbnNGcmFtZXMgPSBwYWdlLmZpbmRDaGlsZHJlbihjaGlsZCA9PiBjaGlsZC5uYW1lID09PSBcIlZvdGluZyBUb2tlbnNcIik7XG4gICAgICAgIFZvdGluZ1Rva2Vuc0ZyYW1lcy5mb3JFYWNoKGZyYW1lID0+IHsgZnJhbWUucmVtb3ZlKCk7IH0pO1xuICAgICAgICBjb25zdCB0b2tlbnNJblVzZSA9IHBhZ2UuZmluZEFsbCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgICAgICB0b2tlbnNJblVzZS5mb3JFYWNoKHRva2VuID0+IHtcbiAgICAgICAgICAgIGlmICh0b2tlbi5wYXJlbnQudHlwZSA9PT0gJ1BBR0UnIHx8IHRva2VuLnBhcmVudC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdG9rZW4ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBjdXN0b21QbGF5ZXJCb2FyZCA9IHBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgUGFnZSBUZW1wbGF0ZVwiKTtcbiAgICAgICAgbW92ZVZvdGluZ1Rva2VucyhwYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgfSk7XG59O1xuY29uc3QgbmV4dFN0b3J5dGVsbGVyID0gKG5ld1N0b3J5dGVsbGVyKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBuZXdTdG9yeXRlbGxlciA9PSAnbnVtYmVyJykge1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IG5ld1N0b3J5dGVsbGVyO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSAoY3VycmVudFN0b3J5dGVsbGVySW5kZXggKyAxKSAlIHBsYXllcnMubGVuZ3RoO1xuICAgIH1cbiAgICBjb25zdCBjdXJyQ29sb3IgPSBwbGF5ZXJzW2N1cnJlbnRTdG9yeXRlbGxlckluZGV4XS5jb2xvcjtcbiAgICBjb25zdCBzdG9yeXRlbGxlclRva2VuID0gZGl4bWFCb2FyZFBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU3Rvcnl0ZWxsZXIgQmFkZ2VcIik7XG4gICAgY29uc3Qgc3Rvcnl0ZWxsZXJJZHggPSBQTEFZRVJfT1JERVIuaW5kZXhPZihjdXJyQ29sb3IpO1xuICAgIHN0b3J5dGVsbGVyVG9rZW4ueSA9IDEwMiArIDQ0ICogc3Rvcnl0ZWxsZXJJZHg7XG59O1xuY29uc3QgcmVzZXREZWFsdENhcmRzID0gKCkgPT4ge1xuICAgIGRlY2tQYWdlLmNoaWxkcmVuLmZvckVhY2goKGltYWdlKSA9PiBpbWFnZS5zZXRQbHVnaW5EYXRhKFwiZGVhbHRcIiwgXCJmYWxzZVwiKSk7XG59O1xuY29uc3QgY2xlYXJQbGF5ZXJQaWVjZXNGcm9tQm9hcmQgPSAoKSA9PiB7XG4gICAgY29uc3QgcGxheWVyUGllY2VzID0gZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkcmVuKGMgPT4gKFBMQVlFUl9PUkRFUi5pbmRleE9mKGMubmFtZSkgPiAtMSkpO1xuICAgIHBsYXllclBpZWNlcy5mb3JFYWNoKHBpZWNlID0+IHsgcGllY2UucmVtb3ZlKCk7IH0pO1xufTtcbmNvbnN0IGNsZWFyUGxheWVyTmFtZXMgPSAoKSA9PiB7XG4gICAgcGxheWVyc0ZyYW1lLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIC8vIElnbm9yZSBpbnN0cnVjdGlvbiB0ZXh0IG5vZGVzLCB3ZSBvbmx5IG5lZWQgdG8gbG9vayBhdCB0aGUgcGxheWVyc1xuICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJOYW1lID0gY2hpbGQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJwbGF5ZXIgbmFtZVwiKTtcbiAgICAgICAgICAgIGZpZ21hXG4gICAgICAgICAgICAgICAgLmxvYWRGb250QXN5bmMoeyBmYW1pbHk6IFwiUm9ib3RvIFNsYWJcIiwgc3R5bGU6IFwiUmVndWxhclwiIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4gKHBsYXllck5hbWUuY2hhcmFjdGVycyA9IEVNUFRZX1BMQVlFUl9TVFJJTkcpKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbmNvbnN0IHJlc2V0R2FtZSA9ICgpID0+IHtcbiAgICBnYW1lUGhhc2UgPSBQSEFTRVMuTk9fR0FNRTtcbiAgICBwbGF5ZXJzID0gW107XG4gICAgcGxheWVyTm9kZXMgPSBbXTtcbiAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IDA7XG4gICAgcmVzZXRUb2tlbnMoKTtcbiAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgIGNsZWFyQ2FyZHNGcm9tUGxheUFyZWEoKTtcbiAgICBkZWxldGVQbGF5ZXJQYWdlcygpO1xuICAgIHJlc2V0RGVhbHRDYXJkcygpO1xuICAgIGNsZWFyUGxheWVyUGllY2VzRnJvbUJvYXJkKCk7XG59O1xuLy8gUlVOUyBPTiBMQVVOQ0ggLSBjaGVjayBmb3IgZ2FtZSBzdGF0ZSBldmVyeSBzZWNvbmRcbmlmIChwaWVjZXNBcmVSZWFkeSgpKSB7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgIHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50KCk7XG4gICAgfSwgMTAwMCk7XG59XG4vLyBIRUxQRVIgRlVOQ1RJT05TXG5jb25zdCBoZXhUb1JHQiA9IChoZXgpID0+IHtcbiAgICBjb25zdCBoID0gKGhleC5jaGFyQXQoMCkgPT0gXCIjXCIpID8gaGV4LnN1YnN0cmluZygxLCA3KSA6IGhleDtcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChoLnN1YnN0cmluZygwLCAyKSwgMTYpIC8gMjU1LFxuICAgICAgICBnOiBwYXJzZUludChoLnN1YnN0cmluZygyLCA0KSwgMTYpIC8gMjU1LFxuICAgICAgICBiOiBwYXJzZUludChoLnN1YnN0cmluZyg0LCA2KSwgMTYpIC8gMjU1XG4gICAgfTtcbn07XG5jb25zdCBjbG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG59O1xuY29uc3Qgc2NhbGVJbWFnZSA9IChpbWFnZSwgbWF4V2lkdGgsIG1heEhlaWdodCkgPT4ge1xuICAgIGlmIChpbWFnZS53aWR0aCA+IG1heFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IGltYWdlLmhlaWdodCAvIChpbWFnZS53aWR0aCAvIG1heFdpZHRoKTtcbiAgICAgICAgaWYgKG5ld0hlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgICAgICAgY29uc3QgbmV3V2lkdGggPSBtYXhXaWR0aCAvIChuZXdIZWlnaHQgLyBtYXhIZWlnaHQpO1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG5ld1dpZHRoLCBtYXhIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG1heFdpZHRoLCBuZXdIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufTtcbmZ1bmN0aW9uIGRlZXBFcXVhbChvYmplY3QxLCBvYmplY3QyKSB7XG4gICAgY29uc3Qga2V5czEgPSBPYmplY3Qua2V5cyhvYmplY3QxKTtcbiAgICBjb25zdCBrZXlzMiA9IE9iamVjdC5rZXlzKG9iamVjdDIpO1xuICAgIGlmIChrZXlzMS5sZW5ndGggIT09IGtleXMyLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMxKSB7XG4gICAgICAgIGNvbnN0IHZhbDEgPSBvYmplY3QxW2tleV07XG4gICAgICAgIGNvbnN0IHZhbDIgPSBvYmplY3QyW2tleV07XG4gICAgICAgIGNvbnN0IGFyZU9iamVjdHMgPSBpc09iamVjdCh2YWwxKSAmJiBpc09iamVjdCh2YWwyKTtcbiAgICAgICAgaWYgKGFyZU9iamVjdHMgJiYgIWRlZXBFcXVhbCh2YWwxLCB2YWwyKSB8fFxuICAgICAgICAgICAgIWFyZU9iamVjdHMgJiYgdmFsMSAhPT0gdmFsMikge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gaXNPYmplY3Qob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCAhPSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnO1xufVxuLy8gIER1cnN0ZW5mZWxkIFNodWZmbGUsIGNvcGllZCBmcm9tIFN0YWNrIE92ZXJmbG93XG5mdW5jdGlvbiBzaHVmZmxlQXJyYXkoYXJyYXkpIHtcbiAgICBsZXQgYXJyYXlDb3B5ID0gY2xvbmUoYXJyYXkpO1xuICAgIGZvciAobGV0IGkgPSBhcnJheUNvcHkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgICAgICBjb25zdCBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgICAgIFthcnJheUNvcHlbaV0sIGFycmF5Q29weVtqXV0gPSBbYXJyYXlDb3B5W2pdLCBhcnJheUNvcHlbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXlDb3B5O1xufVxuIl0sInNvdXJjZVJvb3QiOiIifQ==