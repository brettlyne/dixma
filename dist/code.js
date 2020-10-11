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
    availableCards = availableCards.filter((card, index) => {
        if (availableCards.findIndex(c2 => c2.name === card.name) === index) {
            return true;
        }
        else {
            console.log(card.name, 'is a duplicate card. Each card must have a unique name.');
            return false;
        }
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxPQUFPO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvZGUudHNcIik7XG4iLCJmaWdtYS5zaG93VUkoX19odG1sX18pO1xuZmlnbWEudWkucmVzaXplKDMyMCwgNjYwKTtcbi8vIHZhcmlhYmxlcyB0byBzdG9yZSBnYW1lIHBpZWNlIG5vZGVzIChwYWdlcyxmcmFtZXMsZXRjKVxubGV0IGRpeG1hQm9hcmRQYWdlO1xubGV0IGRlY2tQYWdlO1xubGV0IGNvbXBvbmVudHNQYWdlO1xubGV0IHBsYXllclBhZ2VUZW1wbGF0ZTtcbmxldCBjYXJkUGxheUZyYW1lO1xubGV0IHBsYXllcnNGcmFtZTtcbmxldCBzdG9yeXRlbGxlckJhZGdlTm9kZTtcbi8vIGNvbnN0YW50c1xuY29uc3QgUEhBU0VTID0ge1xuICAgIFBJRUNFU19NSVNTSU5HOiBcInJlcXVpcmVkIGdhbWUgZWxlbWVudHMgbm90IHByZXNlbnQgaW4gZmlsZVwiLFxuICAgIE5PX0dBTUU6IFwibm8gYWN0aXZlIGdhbWVcIixcbiAgICBQSUNLSU5HOiBcInBsYXllcnMgYXJlIHBpY2tpbmcgY2FyZHNcIixcbiAgICBWT1RJTkc6IFwicGxheWVycyBhcmUgdm90aW5nXCIsXG4gICAgU0NPUklORzogXCJwbGF5ZXJzIGFyZSBtb3ZpbmcgdGhlaXIgdG9rZW5zIG9uIHRoZSBzY29yZSB0cmFja2luZyBib2FyZFwiXG59O1xuY29uc3QgRU1QVFlfUExBWUVSX1NUUklORyA9IFwifiB+IH4gfiB+IH4gfiB+XCI7XG5jb25zdCBQTEFZRVJfT1JERVIgPSBbXCJyZWRcIiwgXCJvcmFuZ2VcIiwgXCJnb2xkXCIsIFwibGltZVwiLCBcImdyZWVuXCIsIFwidHVycXVvaXNlXCIsIFwiYmx1ZVwiLCBcInZpb2xldFwiLCBcInB1cnBsZVwiLCBcImJsYWNrXCIsIFwic2lsdmVyXCIsIFwid2hpdGVcIl07XG5jb25zdCBDT0xPUlNfQVNfSEVYID0ge1xuICAgIHJlZDogXCJGRjAwMDBcIiwgb3JhbmdlOiBcIkZGODAwQVwiLCBnb2xkOiBcIkZGRDcwMFwiLCBsaW1lOiBcIkJERkYwMFwiLFxuICAgIGdyZWVuOiBcIjAwODAwMFwiLCB0dXJxdW9pc2U6IFwiNDBFMEQwXCIsIGJsdWU6IFwiMDAwMENEXCIsIHZpb2xldDogXCJFRTgyRUVcIixcbiAgICBwdXJwbGU6IFwiODAwMDgwXCIsIGJsYWNrOiBcIjAwMDAwMFwiLCBzaWx2ZXI6IFwiQzBDMEMwXCIsIHdoaXRlOiBcIkZGRkZGRlwiXG59O1xuY29uc3QgVk9USU5HX1RPS0VOU19OQU1FID0gXCJWb3RpbmcgVG9rZW5zXCI7XG5jb25zdCBDQVJEX05BTUUgPSBcIkNhcmRcIjtcbmNvbnN0IENBUkRfU0xPVF9QQURESU5HID0gNTtcbmNvbnN0IENBUkRfU0laRSA9IDE1MDtcbi8vIGdhbWUgc3RhdGUgdmFyaWFibGVzXG5sZXQgcGxheWVycyA9IFtdO1xubGV0IHBsYXllck5vZGVzID0gW107XG5sZXQgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSAwOyAvLyBwbGF5ZXIgaW5kZXggb2YgY3VycmVudCBzdG9yeXRlbGxlclxubGV0IGdhbWVQaGFzZSA9IFBIQVNFUy5OT19HQU1FO1xuLy8gaGFuZGxlIG1lc3NhZ2VzIGZyb20gcGx1Z2luIFVJXG5maWdtYS51aS5vbm1lc3NhZ2UgPSAobXNnKSA9PiB7XG4gICAgdXBkYXRlUGx1Z2luU3RhdGVGcm9tRG9jdW1lbnQoKTtcbiAgICBpZiAobXNnLnR5cGUgPT09IFwidGVzdGluZ1wiKSB7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJzdGFydC1nYW1lXCIpIHtcbiAgICAgICAgaWYgKGdhbWVQaGFzZSA9PT0gUEhBU0VTLk5PX0dBTUUgJiYgcGllY2VzQXJlUmVhZHkoKSAmJiBwbGF5ZXJzQXJlUmVhZHkoKSkge1xuICAgICAgICAgICAgLy8gc3RhcnQgdGhlIGdhbWVcbiAgICAgICAgICAgIHNldHVwUGxheWVyUGllY2VzT25HYW1lQm9hcmQoKTtcbiAgICAgICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5QSUNLSU5HO1xuICAgICAgICAgICAgbmV4dFN0b3J5dGVsbGVyKDApO1xuICAgICAgICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlUGxheWVyUGFnZShwbGF5ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwb3B1bGF0ZVBsYXllck5vZGVzKCk7XG4gICAgICAgICAgICBkZWFsQ2FyZHMoKTtcbiAgICAgICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInJldmVhbC1jYXJkc1wiICYmIGdhbWVQaGFzZSA9PT0gUEhBU0VTLlBJQ0tJTkcpIHtcbiAgICAgICAgbW92ZUNhcmRzVG9HYW1lQm9hcmQoKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcInJldmVhbC10b2tlbnNcIiAmJiBnYW1lUGhhc2UgPT09IFBIQVNFUy5WT1RJTkcpIHtcbiAgICAgICAgbW92ZVRva2Vuc1RvR2FtZUJvYXJkKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJuZXctcm91bmRcIiAmJiBnYW1lUGhhc2UgPT09IFBIQVNFUy5TQ09SSU5HKSB7XG4gICAgICAgIGNsZWFyQ2FyZHNGcm9tUGxheUFyZWEoKTtcbiAgICAgICAgZGVhbENhcmRzKCk7XG4gICAgICAgIHJlc2V0VG9rZW5zKCk7XG4gICAgICAgIG5leHRTdG9yeXRlbGxlcigpO1xuICAgICAgICBnYW1lUGhhc2UgPSBQSEFTRVMuUElDS0lORztcbiAgICAgICAgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4oKTtcbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcIm5ldy1wbGF5ZXJzXCIpIHtcbiAgICAgICAgY29uc3Qgb2xkUGxheWVyTmFtZXMgPSBwbGF5ZXJzLm1hcChwbGF5ZXIgPT4gcGxheWVyLm5hbWUpO1xuICAgICAgICBpZiAocGxheWVyc0FyZVJlYWR5KCkpIHtcbiAgICAgICAgICAgIHBsYXllcnMuZm9yRWFjaCgocGxheWVyLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG9sZFBsYXllck5hbWVzLmluZGV4T2YocGxheWVyLm5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBmaWdtYS5ub3RpZnkoYCR7cGxheWVyLm5hbWV9IHdpbGwgZ2V0IGNhcmRzIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIG5leHQgcm91bmQuYCk7XG4gICAgICAgICAgICAgICAgICAgIGNyZWF0ZVBsYXllclBhZ2UocGxheWVyKTtcbiAgICAgICAgICAgICAgICAgICAgYWRkUGxheWVyUGllY2UocGxheWVyLmNvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPD0gY3VycmVudFN0b3J5dGVsbGVySW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRTdG9yeXRlbGxlcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBwb3B1bGF0ZVBsYXllck5vZGVzKCk7XG4gICAgICAgICAgICBkZWFsQ2FyZHMoKTtcbiAgICAgICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1zZy50eXBlLnN0YXJ0c1dpdGgoJ3NldC1zdG9yeXRlbGxlci1pbmRleC0nKSkge1xuICAgICAgICBjb25zdCBuZXdTdG9yeXRlbGxlciA9IHBhcnNlSW50KG1zZy50eXBlLnJlcGxhY2UoJ3NldC1zdG9yeXRlbGxlci1pbmRleC0nLCAnJykpO1xuICAgICAgICBpZiAoIWlzTmFOKG5ld1N0b3J5dGVsbGVyKSAmJiBuZXdTdG9yeXRlbGxlciA+PSAwICYmIG5ld1N0b3J5dGVsbGVyIDwgcGxheWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIG5leHRTdG9yeXRlbGxlcihuZXdTdG9yeXRlbGxlcik7XG4gICAgICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXNldC1nYW1lXCIpIHtcbiAgICAgICAgcmVzZXRHYW1lKCk7XG4gICAgfVxuICAgIGlmIChtc2cudHlwZSA9PT0gXCJyZXNldC1nYW1lLWFuZC1jbGVhci1wbGF5ZXJzXCIpIHtcbiAgICAgICAgcmVzZXRHYW1lKCk7XG4gICAgICAgIGNsZWFyUGxheWVyTmFtZXMoKTtcbiAgICB9XG59O1xuY29uc3QgcGllY2VzQXJlUmVhZHkgPSAoKSA9PiB7XG4gICAgZGl4bWFCb2FyZFBhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiRGl4bWEgQm9hcmRcIik7XG4gICAgZGVja1BhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiRGVja1wiKTtcbiAgICBjb21wb25lbnRzUGFnZSA9IGZpZ21hLnJvb3QuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJDb21wb25lbnRzXCIpO1xuICAgIHBsYXllclBhZ2VUZW1wbGF0ZSA9IGNvbXBvbmVudHNQYWdlICYmIGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFBhZ2UgVGVtcGxhdGVcIik7XG4gICAgY2FyZFBsYXlGcmFtZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ2FyZCBQbGF5IEFyZWFcIik7XG4gICAgcGxheWVyc0ZyYW1lID0gZGl4bWFCb2FyZFBhZ2UgJiYgZGl4bWFCb2FyZFBhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXJzXCIpO1xuICAgIHN0b3J5dGVsbGVyQmFkZ2VOb2RlID0gZGl4bWFCb2FyZFBhZ2UgJiYgZGl4bWFCb2FyZFBhZ2UuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU3Rvcnl0ZWxsZXIgQmFkZ2VcIik7XG4gICAgaWYgKCEoZGl4bWFCb2FyZFBhZ2UgJiYgZGVja1BhZ2UgJiYgY29tcG9uZW50c1BhZ2UgJiYgcGxheWVyUGFnZVRlbXBsYXRlICYmIGNhcmRQbGF5RnJhbWUgJiYgcGxheWVyc0ZyYW1lICYmIHN0b3J5dGVsbGVyQmFkZ2VOb2RlKSkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJHYW1lIHBpZWNlIG5vdCBmb3VuZC4gVXNlIERpeG1hIHRlbXBsYXRlIGZpbGUgLyBjaGVjayB0aGF0IG5vdGhpbmcgd2FzIGFjY2lkZW50YWxseSBkZWxldGVkIG9yIHJlbmFtZWQuIFNlZSBjb25zb2xlLi4uXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkVhY2ggb2YgdGhlIGZvbGxvd2luZyBzaG91bGQgYmUgZGVmaW5lZC5cIik7XG4gICAgICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIGRpeG1hQm9hcmRQYWdlLCBkZWNrUGFnZSwgY29tcG9uZW50c1BhZ2UsIHBsYXllclBhZ2VUZW1wbGF0ZSxcbiAgICAgICAgICAgIGNhcmRQbGF5RnJhbWUsIHBsYXllcnNGcmFtZSwgc3Rvcnl0ZWxsZXJCYWRnZU5vZGVcbiAgICAgICAgfSkuc3BsaXQoJywnKS5qb2luKCdcXG4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuY29uc3QgcGxheWVyc0FyZVJlYWR5ID0gKCkgPT4ge1xuICAgIGxldCBuZXdQbGF5ZXJzID0gW107XG4gICAgcGxheWVyc0ZyYW1lLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIC8vIElnbm9yZSBpbnN0cnVjdGlvbiB0ZXh0IG5vZGVzLCB3ZSBvbmx5IG5lZWQgdG8gbG9vayBhdCB0aGUgcGxheWVyc1xuICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgICAgICBjb25zdCBwbGF5ZXJOYW1lTm9kZSA9IGNoaWxkLmZpbmRDaGlsZCgoZ3JhbmRjaGlsZCkgPT4gZ3JhbmRjaGlsZC5uYW1lID09PSBcInBsYXllciBuYW1lXCIpO1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZSA9IHBsYXllck5hbWVOb2RlLmNoYXJhY3RlcnM7XG4gICAgICAgICAgICBpZiAocGxheWVyTmFtZSAmJiBwbGF5ZXJOYW1lICE9PSBFTVBUWV9QTEFZRVJfU1RSSU5HKSB7XG4gICAgICAgICAgICAgICAgbmV3UGxheWVycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogcGxheWVyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IGNoaWxkLm5hbWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmIChuZXdQbGF5ZXJzLmxlbmd0aCA8IDQpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KCdOZWVkIGF0IGxlYXN0IDQgcGxheWVycyB0byBzdGFydCBhIGdhbWUuJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgcGxheWVyTmFtZXMgPSBuZXdQbGF5ZXJzLm1hcChwbGF5ZXIgPT4gcGxheWVyLm5hbWUpO1xuICAgIGlmIChwbGF5ZXJOYW1lcy5sZW5ndGggIT09IG5ldyBTZXQocGxheWVyTmFtZXMpLnNpemUpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KCdEdXBsaWNhdGUgbmFtZXMgbm90IGFsbG93ZWQuJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcGxheWVycyA9IG5ld1BsYXllcnM7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuY29uc3QgdXBkYXRlRG9jdW1lbnRTdGF0ZUZyb21QbHVnaW4gPSAoKSA9PiB7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwicGxheWVyc1wiLCBKU09OLnN0cmluZ2lmeShwbGF5ZXJzKSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiZ2FtZVBoYXNlXCIsIGdhbWVQaGFzZSk7XG4gICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwiY3VycmVudFN0b3J5dGVsbGVySW5kZXhcIiwgYCR7Y3VycmVudFN0b3J5dGVsbGVySW5kZXh9YCk7XG59O1xuY29uc3QgcmVzZXREb2N1bWVudFN0YXRlID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcInBsYXllcnNcIiwgSlNPTi5zdHJpbmdpZnkoW10pKTtcbiAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJnYW1lUGhhc2VcIiwgUEhBU0VTLk5PX0dBTUUpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImN1cnJlbnRTdG9yeXRlbGxlckluZGV4XCIsICcwJyk7XG59O1xuY29uc3QgdXBkYXRlUGx1Z2luU3RhdGVGcm9tRG9jdW1lbnQgPSAoKSA9PiB7XG4gICAgY29uc3QgcGxheWVyRGF0YSA9IGZpZ21hLnJvb3QuZ2V0UGx1Z2luRGF0YSgncGxheWVycycpO1xuICAgIGNvbnN0IG5ld0dhbWVQaGFzZSA9IGZpZ21hLnJvb3QuZ2V0UGx1Z2luRGF0YSgnZ2FtZVBoYXNlJyk7XG4gICAgaWYgKCFwbGF5ZXJEYXRhIHx8ICFuZXdHYW1lUGhhc2UpIHtcbiAgICAgICAgcmVzZXREb2N1bWVudFN0YXRlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbmV3UGxheWVycyA9IEpTT04ucGFyc2UocGxheWVyRGF0YSk7XG4gICAgY29uc3QgbmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXggPSBwYXJzZUludChmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ2N1cnJlbnRTdG9yeXRlbGxlckluZGV4JykpO1xuICAgIGlmIChnYW1lUGhhc2UgIT09IG5ld0dhbWVQaGFzZSB8fFxuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCAhPT0gbmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXgpIHtcbiAgICAgICAgZ2FtZVBoYXNlID0gbmV3R2FtZVBoYXNlO1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4O1xuICAgIH1cbiAgICBpZiAoIWRlZXBFcXVhbChwbGF5ZXJzLCBuZXdQbGF5ZXJzKSkge1xuICAgICAgICBwbGF5ZXJzID0gbmV3UGxheWVycztcbiAgICAgICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xuICAgIH1cbiAgICBjb25zdCBwbGF5ZXJzV2l0aFN0YXR1cyA9IGdldFBsYXllcnNXaXRoU3RhdHVzKCk7XG4gICAgZmlnbWEudWkucG9zdE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiAnR0FNRV9TVEFURScsXG4gICAgICAgIHBsYXllcnM6IHBsYXllcnNXaXRoU3RhdHVzLFxuICAgICAgICBnYW1lUGhhc2UsXG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4XG4gICAgfSk7XG59O1xuY29uc3QgcG9wdWxhdGVQbGF5ZXJOb2RlcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJOb2RlcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBwbGF5ZXJzW2ldO1xuICAgICAgICBjb25zdCBwYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBwbGF5ZXIubmFtZSk7XG4gICAgICAgIGlmICghcGFnZSkge1xuICAgICAgICAgICAgcmVtb3ZlUGxheWVyQnlJbmRleChpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkQ2FyZEFyZWEgPSBwYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgU2VsZWN0aW9uIEFyZWFcIik7XG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVG9rZW5BcmVhID0gcGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJUb2tlbiBTZWxlY3Rpb24gQXJlYVwiKTtcbiAgICAgICAgcGxheWVyTm9kZXMucHVzaCh7IHBhZ2UsIHNlbGVjdGVkQ2FyZEFyZWEsIHNlbGVjdGVkVG9rZW5BcmVhIH0pO1xuICAgIH1cbn07XG5jb25zdCBnZXRQbGF5ZXJzV2l0aFN0YXR1cyA9ICgpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJzV2l0aFN0YXR1cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBwbGF5ZXIgPSBwbGF5ZXJzW2ldO1xuICAgICAgICBjb25zdCBpc1N0b3J5dGVsbGVyID0gKGkgPT09IGN1cnJlbnRTdG9yeXRlbGxlckluZGV4KTtcbiAgICAgICAgY29uc3QgcGxheWVyTm9kZSA9IHBsYXllck5vZGVzW2ldO1xuICAgICAgICBpZiAoIXBsYXllck5vZGUucGFnZSB8fCBwbGF5ZXJOb2RlLnBhZ2UucmVtb3ZlZCkgeyAvLyBwYWdlIGhhcyBiZWVuIGRlbGV0ZWQgLT4gcmVtb3ZlIHBsYXllclxuICAgICAgICAgICAgcmVtb3ZlUGxheWVyQnlJbmRleChpKTtcbiAgICAgICAgICAgIHJldHVybiBnZXRQbGF5ZXJzV2l0aFN0YXR1cygpO1xuICAgICAgICB9XG4gICAgICAgIGxldCBzdGF0dXM7XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5QSUNLSU5HKSB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RlZENhcmQgPSBwbGF5ZXJOb2RlLnNlbGVjdGVkQ2FyZEFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gQ0FSRF9OQU1FKTtcbiAgICAgICAgICAgIHN0YXR1cyA9IChzZWxlY3RlZENhcmQgPyBcImRvbmUtd2l0aC1hY3Rpb25cIiA6IFwicGlja2luZy1jYXJkXCIpO1xuICAgICAgICAgICAgaWYgKGlzU3Rvcnl0ZWxsZXIpIHtcbiAgICAgICAgICAgICAgICBzdGF0dXMgPSBcInN0b3J5dGVsbGVyLVwiICsgc3RhdHVzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lUGhhc2UgPT09IFBIQVNFUy5WT1RJTkcpIHtcbiAgICAgICAgICAgIGlmIChpc1N0b3J5dGVsbGVyKSB7XG4gICAgICAgICAgICAgICAgc3RhdHVzID0gJ3N0b3J5dGVsbGVyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkVG9rZW4gPSBwbGF5ZXJOb2RlLnNlbGVjdGVkVG9rZW5BcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2VuXCIpO1xuICAgICAgICAgICAgICAgIHN0YXR1cyA9IChzZWxlY3RlZFRva2VuID8gXCJkb25lLXdpdGgtYWN0aW9uXCIgOiBcInZvdGluZ1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZVBoYXNlID09PSBQSEFTRVMuU0NPUklORykge1xuICAgICAgICAgICAgc3RhdHVzID0gKGlzU3Rvcnl0ZWxsZXIgPyAnc3Rvcnl0ZWxsZXItc2NvcmluZycgOiAnc2NvcmluZycpO1xuICAgICAgICB9XG4gICAgICAgIHBsYXllcnNXaXRoU3RhdHVzLnB1c2goT2JqZWN0LmFzc2lnbihPYmplY3QuYXNzaWduKHt9LCBwbGF5ZXIpLCB7IHN0YXR1cyB9KSk7XG4gICAgfVxuICAgIDtcbiAgICByZXR1cm4gcGxheWVyc1dpdGhTdGF0dXM7XG59O1xuLy8gY2FsbGVkIHRvIHJlbW92ZSBhIHBsYXllciBmcm9tIHRoZSBnYW1lIHN0YXRlIChwcm9iYWJseSBiZWNhdXNlIHRoZXkgbm8gbG9uZ2VyIGhhdmUgYSBwbGF5ZXIgcGFnZSlcbmNvbnN0IHJlbW92ZVBsYXllckJ5SW5kZXggPSAoaSkgPT4ge1xuICAgIHBsYXllcnMuc3BsaWNlKGksIDEpO1xuICAgIGlmIChpIDwgY3VycmVudFN0b3J5dGVsbGVySW5kZXgpIHtcbiAgICAgICAgbmV4dFN0b3J5dGVsbGVyKGN1cnJlbnRTdG9yeXRlbGxlckluZGV4IC0gMSk7XG4gICAgfVxuICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgcG9wdWxhdGVQbGF5ZXJOb2RlcygpO1xufTtcbmNvbnN0IGNyZWF0ZVBsYXllclBhZ2UgPSAocGxheWVyKSA9PiB7XG4gICAgY29uc3QgcGxheWVyUGFnZSA9IGZpZ21hLmNyZWF0ZVBhZ2UoKTtcbiAgICBwbGF5ZXJQYWdlLnNldFBsdWdpbkRhdGEoJ2lzUGxheWVyUGFnZScsICd0cnVlJyk7XG4gICAgcGxheWVyUGFnZS5uYW1lID0gcGxheWVyLm5hbWU7XG4gICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBjcmVhdGVQbGF5ZXJCb2FyZChwbGF5ZXIpO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQoY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIGN1c3RvbVBsYXllckJvYXJkLmxvY2tlZCA9IHRydWU7XG4gICAgbW92ZVZvdGluZ1Rva2VucyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgc2V0VXBTZWxlY3Rpb25BcmVhcyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgLy8gZGVhbEZpcnN0SGFuZChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCk7XG4gICAgcmV0dXJuIHBsYXllclBhZ2U7XG59O1xuY29uc3QgY3JlYXRlUGxheWVyQm9hcmQgPSAocGxheWVyKSA9PiB7XG4gICAgY29uc3QgY3VzdG9tUGxheWVyQm9hcmQgPSBwbGF5ZXJQYWdlVGVtcGxhdGUuY2xvbmUoKTtcbiAgICAvLyBDdXN0b21pemUgcGFnZSB3aXRoIHBsYXllciBuYW1lXG4gICAgY29uc3QgcGxheWVyTmFtZUVsZW1lbnQgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgTmFtZSBUZXh0XCIpO1xuICAgIGZpZ21hXG4gICAgICAgIC5sb2FkRm9udEFzeW5jKHsgZmFtaWx5OiBcIkFtZXJpY2FuIFR5cGV3cml0ZXJcIiwgc3R5bGU6IFwiUmVndWxhclwiIH0pXG4gICAgICAgIC50aGVuKCgpID0+IChwbGF5ZXJOYW1lRWxlbWVudC5jaGFyYWN0ZXJzID0gcGxheWVyLm5hbWUpKTtcbiAgICAvLyBDb3B5IGluIHBsYXllciB0b2tlbiBmcm9tIENvbXBvbmVudHMgUGFnZVxuICAgIGNvbnN0IHBsYXllclRva2Vuc0ZyYW1lID0gY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgVG9rZW5zXCIpO1xuICAgIGNvbnN0IHBsYXllclRva2VuID0gcGxheWVyVG9rZW5zRnJhbWUuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gcGxheWVyLmNvbG9yKS5jbG9uZSgpO1xuICAgIHBsYXllclRva2VuLnJlc2l6ZSg0MCwgNDApO1xuICAgIHBsYXllclRva2VuLnggPSA3ODtcbiAgICBwbGF5ZXJUb2tlbi55ID0gNzg7XG4gICAgY3VzdG9tUGxheWVyQm9hcmQuYXBwZW5kQ2hpbGQocGxheWVyVG9rZW4pO1xuICAgIC8vIENoYW5nZSBjb2xvciBvZiB2b3RpbmcgdG9rZW5zXG4gICAgY29uc3Qgdm90aW5nVG9rZW5zID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gVk9USU5HX1RPS0VOU19OQU1FKTtcbiAgICB2b3RpbmdUb2tlbnMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgY29uc3Qgdm90aW5nVG9rZW4gPSBjaGlsZDtcbiAgICAgICAgY29uc3Qgdm90aW5nVG9rZW5GaWxscyA9IGNsb25lKHZvdGluZ1Rva2VuLmZpbGxzKTtcbiAgICAgICAgdm90aW5nVG9rZW5GaWxsc1swXS5jb2xvciA9IGhleFRvUkdCKENPTE9SU19BU19IRVhbcGxheWVyLmNvbG9yXSk7XG4gICAgICAgIHZvdGluZ1Rva2VuLmZpbGxzID0gdm90aW5nVG9rZW5GaWxscztcbiAgICB9KTtcbiAgICByZXR1cm4gY3VzdG9tUGxheWVyQm9hcmQ7XG59O1xuLy8gTW92ZSB0aGUgdm90aW5nIHRva2VucyBvdXQgb2YgdGhlIGNvbXBvbmVudCBzbyB0aGV5IGNhbiBiZSBlYXNpbHkgZHJhZ2dlZFxuY29uc3QgbW92ZVZvdGluZ1Rva2VucyA9IChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkgPT4ge1xuICAgIGNvbnN0IHZvdGluZ1Rva2VucyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBWT1RJTkdfVE9LRU5TX05BTUUpO1xuICAgIGNvbnN0IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uID0gdm90aW5nVG9rZW5zLmFic29sdXRlVHJhbnNmb3JtO1xuICAgIGNvbnN0IHZvdGluZ1Rva2Vuc0Nsb25lID0gdm90aW5nVG9rZW5zLmNsb25lKCk7XG4gICAgdm90aW5nVG9rZW5zLnZpc2libGUgPSBmYWxzZTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHZvdGluZ1Rva2Vuc0Nsb25lKTtcbiAgICB2b3RpbmdUb2tlbnNDbG9uZS52aXNpYmxlID0gdHJ1ZTtcbiAgICB2b3RpbmdUb2tlbnNDbG9uZS54ID0gdm90aW5nVG9rZW5zUG9zaXRpb25bMF1bMl07XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUueSA9IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uWzFdWzJdO1xufTtcbi8vIFNldCB1cCBhcmVhcyBvbiBwbGF5ZXIgYm9hcmQgdG8gc2VsZWN0IGNhcmRzICYgdG9rZW5zIGJ5IGRyb3BwaW5nIHRoZW0gaW4gYSBmcmFtZVxuZnVuY3Rpb24gc2V0VXBTZWxlY3Rpb25BcmVhcyhwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkge1xuICAgIGNvbnN0IGNhcmRTZWxlY3Rpb25BcmVhID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICBjb25zdCBzZWxlY3RlZENhcmQgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlNlbGVjdGVkIGNhcmRcIik7XG4gICAgY29uc3QgY2FyZEZpbGxzID0gY2xvbmUoY2FyZFNlbGVjdGlvbkFyZWEuZmlsbHMpO1xuICAgIGNhcmRGaWxsc1swXS5vcGFjaXR5ID0gMDtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS5maWxscyA9IGNhcmRGaWxscztcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS5uYW1lID0gXCJDYXJkIFNlbGVjdGlvbiBBcmVhXCI7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEucmVzaXplKHNlbGVjdGVkQ2FyZC53aWR0aCwgc2VsZWN0ZWRDYXJkLmhlaWdodCk7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEueCA9IHNlbGVjdGVkQ2FyZC5hYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgICBjYXJkU2VsZWN0aW9uQXJlYS55ID0gc2VsZWN0ZWRDYXJkLmFic29sdXRlVHJhbnNmb3JtWzFdWzJdO1xuICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQoY2FyZFNlbGVjdGlvbkFyZWEpO1xuICAgIGNvbnN0IHRva2VuU2VsZWN0aW9uQXJlYSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRUb2tlbiA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiU2VsZWN0ZWQgdm90aW5nIHRva2VuXCIpO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5maWxscyA9IGNhcmRGaWxscztcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEubmFtZSA9IFwiVG9rZW4gU2VsZWN0aW9uIEFyZWFcIjtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEuY29ybmVyUmFkaXVzID0gMTA7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLnJlc2l6ZShzZWxlY3RlZFRva2VuLndpZHRoLCBzZWxlY3RlZFRva2VuLmhlaWdodCk7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLnggPSBzZWxlY3RlZFRva2VuLmFic29sdXRlVHJhbnNmb3JtWzBdWzJdO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS55ID0gc2VsZWN0ZWRUb2tlbi5hYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHRva2VuU2VsZWN0aW9uQXJlYSk7XG59XG5jb25zdCBIQU5EX1ggPSA4NztcbmNvbnN0IEhBTkRfWSA9IDMxNjtcbmNvbnN0IEhBTkRfU1BBQ0lORyA9IDE3NDtcbmNvbnN0IGRlYWxDYXJkcyA9ICgpID0+IHtcbiAgICBsZXQgYXZhaWxhYmxlQ2FyZHMgPSBkZWNrUGFnZS5jaGlsZHJlbi5maWx0ZXIoY2FyZCA9PiAhKGNhcmQuZ2V0UGx1Z2luRGF0YShcImRlYWx0XCIpICYmIGNhcmQuZ2V0UGx1Z2luRGF0YShcImRlYWx0XCIpID09PSBcInRydWVcIikpO1xuICAgIGF2YWlsYWJsZUNhcmRzID0gYXZhaWxhYmxlQ2FyZHMuZmlsdGVyKChjYXJkLCBpbmRleCkgPT4ge1xuICAgICAgICBpZiAoYXZhaWxhYmxlQ2FyZHMuZmluZEluZGV4KGMyID0+IGMyLm5hbWUgPT09IGNhcmQubmFtZSkgPT09IGluZGV4KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGNhcmQubmFtZSwgJ2lzIGEgZHVwbGljYXRlIGNhcmQuIEVhY2ggY2FyZCBtdXN0IGhhdmUgYSB1bmlxdWUgbmFtZS4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHBsYXllck5vZGVzLmZvckVhY2gocGxheWVyTm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHBsYXllclBhZ2UgPSBwbGF5ZXJOb2RlLnBhZ2U7XG4gICAgICAgIGNvbnN0IGNhcmRzID0gcGxheWVyUGFnZS5maW5kQ2hpbGRyZW4oKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBDQVJEX05BTUUpO1xuICAgICAgICBmb3IgKGxldCBpID0gY2FyZHMubGVuZ3RoOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCByYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGF2YWlsYWJsZUNhcmRzLmxlbmd0aCk7XG4gICAgICAgICAgICBjb25zdCByYW5kb21JbWFnZSA9IGF2YWlsYWJsZUNhcmRzLnNwbGljZShyYW5kb21JbmRleCwgMSlbMF07XG4gICAgICAgICAgICByYW5kb21JbWFnZS5zZXRQbHVnaW5EYXRhKFwiZGVhbHRcIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgY29uc3QgbmV3Q2FyZCA9IGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ0FSRF9URU1QTEFURVwiKS5jbG9uZSgpO1xuICAgICAgICAgICAgY29uc3QgaW1hZ2VGaWxsID0gT2JqZWN0LmFzc2lnbih7fSwgbmV3Q2FyZC5maWxsc1sxXSk7XG4gICAgICAgICAgICBpbWFnZUZpbGwuaW1hZ2VIYXNoID0gcmFuZG9tSW1hZ2UuZmlsbHNbMF0uaW1hZ2VIYXNoO1xuICAgICAgICAgICAgY29uc3QgbmV3RmlsbHMgPSBbbmV3Q2FyZC5maWxsc1swXSwgaW1hZ2VGaWxsXTtcbiAgICAgICAgICAgIG5ld0NhcmQuZmlsbHMgPSBuZXdGaWxscztcbiAgICAgICAgICAgIG5ld0NhcmQubmFtZSA9IENBUkRfTkFNRTtcbiAgICAgICAgICAgIHBsYXllclBhZ2UuYXBwZW5kQ2hpbGQobmV3Q2FyZCk7XG4gICAgICAgICAgICBjYXJkcy5wdXNoKG5ld0NhcmQpO1xuICAgICAgICB9XG4gICAgICAgIGNhcmRzLnNvcnQoKGEsIGIpID0+IChhLnggLSBiLngpKTtcbiAgICAgICAgY2FyZHMuZm9yRWFjaCgoY2FyZCwgaSkgPT4ge1xuICAgICAgICAgICAgY2FyZC54ID0gSEFORF9YICsgaSAqIEhBTkRfU1BBQ0lORztcbiAgICAgICAgICAgIGNhcmQueSA9IEhBTkRfWTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuY29uc3QgbW92ZUNhcmRzVG9HYW1lQm9hcmQgPSAoKSA9PiB7XG4gICAgbGV0IGNhcmRzVG9Nb3ZlID0gcGxheWVyTm9kZXMubWFwKG5vZGUgPT4gbm9kZS5zZWxlY3RlZENhcmRBcmVhLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSkpO1xuICAgIGxldCBhbGxQbGF5ZXJzQXJlUmVhZHkgPSB0cnVlO1xuICAgIGxldCBzaHVmZmxlZEluZGljZXMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNhcmRzVG9Nb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNodWZmbGVkSW5kaWNlcy5wdXNoKGkpO1xuICAgICAgICBpZiAoIWNhcmRzVG9Nb3ZlW2ldKSB7XG4gICAgICAgICAgICBhbGxQbGF5ZXJzQXJlUmVhZHkgPSBmYWxzZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNodWZmbGVkSW5kaWNlcyA9IHNodWZmbGVBcnJheShzaHVmZmxlZEluZGljZXMpO1xuICAgIGlmIChhbGxQbGF5ZXJzQXJlUmVhZHkpIHtcbiAgICAgICAgY2FyZHNUb01vdmUuZm9yRWFjaCgoc2VsZWN0ZWRDYXJkLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgcGxhY2VDYXJkSW5HYW1lQm9hcmQoc2VsZWN0ZWRDYXJkLCBzaHVmZmxlZEluZGljZXNbaW5kZXhdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5WT1RJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJOb3QgYWxsIHBsYXllcnMgaGF2ZSBzZWxlY3RlZCBhIGNhcmQuXCIpO1xuICAgIH1cbn07XG5jb25zdCBtb3ZlVG9rZW5zVG9HYW1lQm9hcmQgPSAoKSA9PiB7XG4gICAgY29uc3QgdG9rZW5zVG9Nb3ZlID0gW107XG4gICAgbGV0IGFsbFJlYWR5ID0gdHJ1ZTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBsYXllck5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9PT0gaSlcbiAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBzdG9yeXRlbGxlciBkb2VzIG5vdCB2b3RlXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkVG9rZW5BcmVhID0gcGxheWVyTm9kZXNbaV0uc2VsZWN0ZWRUb2tlbkFyZWE7XG4gICAgICAgIGNvbnN0IHRva2VuID0gc2VsZWN0ZWRUb2tlbkFyZWEuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgIHRva2VuLnNldFBsdWdpbkRhdGEoXCJjb2xvclwiLCBwbGF5ZXJzW2ldLmNvbG9yKTtcbiAgICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgICAgICB0b2tlbnNUb01vdmUucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhbGxSZWFkeSA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGFsbFJlYWR5KSB7XG4gICAgICAgIHRva2Vuc1RvTW92ZS5mb3JFYWNoKCh0b2tlbiwgaSkgPT4geyBwbGFjZVRva2VuSW5HYW1lQm9hcmQodG9rZW4sIGkpOyB9KTtcbiAgICAgICAgZ2FtZVBoYXNlID0gUEhBU0VTLlNDT1JJTkc7XG4gICAgICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJOb3QgYWxsIHBsYXllcnMgaGF2ZSB2b3RlZC5cIik7XG4gICAgfVxufTtcbmNvbnN0IENBUkRTX1hfT0ZGU0VUID0gNjU7XG5jb25zdCBDQVJEU19ZX09GRlNFVCA9IDkwO1xuY29uc3QgQ0FSRFNfQ09MX1dJRFRIID0gMTg4O1xuY29uc3QgQ0FSRFNfUk9XX0hFSUdIVCA9IDIyMDtcbmNvbnN0IENBUkRTX1NJWkUgPSAxNjA7XG5jb25zdCBwbGFjZUNhcmRJbkdhbWVCb2FyZCA9IChjYXJkLCBjYXJkSW5kZXgpID0+IHtcbiAgICBjYXJkLnggPSBDQVJEU19YX09GRlNFVCArIChjYXJkSW5kZXggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArIChDQVJEU19TSVpFIC0gY2FyZC53aWR0aCkgLyAyO1xuICAgIGNhcmQueSA9XG4gICAgICAgIENBUkRTX1lfT0ZGU0VUICtcbiAgICAgICAgICAgIE1hdGguZmxvb3IoY2FyZEluZGV4IC8gNCkgKiBDQVJEU19ST1dfSEVJR0hUICtcbiAgICAgICAgICAgIChDQVJEU19TSVpFIC0gY2FyZC5oZWlnaHQpIC8gMjtcbiAgICBjYXJkUGxheUZyYW1lLmFwcGVuZENoaWxkKGNhcmQpO1xufTtcbmNvbnN0IHBsYWNlVG9rZW5JbkdhbWVCb2FyZCA9ICh0b2tlbiwgaSkgPT4ge1xuICAgIGNvbnN0IHZvdGVJZHggPSBwYXJzZUludCh0b2tlbi5jaGlsZHJlblswXS5jaGFyYWN0ZXJzKSAtIDE7XG4gICAgdG9rZW4ueCA9IENBUkRTX1hfT0ZGU0VUICsgKHZvdGVJZHggJSA0KSAqIENBUkRTX0NPTF9XSURUSCArICgyMCAqIChpICUgNykpO1xuICAgIHRva2VuLnkgPSAoQ0FSRFNfWV9PRkZTRVQgKyBNYXRoLmZsb29yKHZvdGVJZHggLyA0KSAqIENBUkRTX1JPV19IRUlHSFQgKyAoMjAgKiBpKSkgLSAoODAgKiBNYXRoLmZsb29yKGkgLyA3KSk7XG4gICAgY29uc3QgY29sb3IgPSB0b2tlbi5nZXRQbHVnaW5EYXRhKFwiY29sb3JcIik7XG4gICAgaWYgKGNvbG9yKSB7XG4gICAgICAgIC8vIENvcHkgaW4gcGxheWVyIHRva2VuIGZyb20gQ29tcG9uZW50cyBQYWdlXG4gICAgICAgIGNvbnN0IHBsYXllclRva2Vuc0ZyYW1lID0gY29tcG9uZW50c1BhZ2UuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJQbGF5ZXIgVG9rZW5zXCIpO1xuICAgICAgICBjb25zdCBwbGF5ZXJUb2tlbiA9IHBsYXllclRva2Vuc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IGNvbG9yKS5jbG9uZSgpO1xuICAgICAgICBwbGF5ZXJUb2tlbi5yZXNpemUoMzYsIDM2KTtcbiAgICAgICAgcGxheWVyVG9rZW4ueCA9IDI7XG4gICAgICAgIHBsYXllclRva2VuLnkgPSAyO1xuICAgICAgICB0b2tlbi5hcHBlbmRDaGlsZChwbGF5ZXJUb2tlbik7XG4gICAgfVxuICAgIGNhcmRQbGF5RnJhbWUuYXBwZW5kQ2hpbGQodG9rZW4pO1xufTtcbmNvbnN0IGRlbGV0ZVBsYXllclBhZ2VzID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3QuY2hpbGRyZW4uZm9yRWFjaChwYWdlID0+IHtcbiAgICAgICAgaWYgKHBhZ2UuZ2V0UGx1Z2luRGF0YShcImlzUGxheWVyUGFnZVwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGFnZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgQ291bGQgbm90IHJlbW92ZSBwbGF5ZXIgcGFnZTogJHtwYWdlLm5hbWV9IOKAkz4gVHJ5IGFnYWluIG9yIHJlbW92ZSBtYW51YWxseS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgQ291bGQgbm90IHJlbW92ZSBwbGF5ZXIgcGFnZTogJHtwYWdlLm5hbWV9IOKAkz4gVHJ5IGFnYWluIG9yIHJlbW92ZSBtYW51YWxseS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCBjbGVhckNhcmRzRnJvbVBsYXlBcmVhID0gKCkgPT4ge1xuICAgIGNhcmRQbGF5RnJhbWUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLm5hbWUgPT09IENBUkRfTkFNRSkge1xuICAgICAgICAgICAgY2hpbGQucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5jb25zdCBzZXR1cFBsYXllclBpZWNlc09uR2FtZUJvYXJkID0gKCkgPT4ge1xuICAgIHBsYXllcnMuZm9yRWFjaChwbGF5ZXIgPT4ge1xuICAgICAgICBhZGRQbGF5ZXJQaWVjZShwbGF5ZXIuY29sb3IpO1xuICAgIH0pO1xufTtcbmNvbnN0IGFkZFBsYXllclBpZWNlID0gKGNvbG9yKSA9PiB7XG4gICAgY29uc3QgcGxheWVyUGllY2VzRnJhbWUgPSBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQaWVjZXNcIik7XG4gICAgY29uc3QgcGxheWVyUGllY2UgPSBwbGF5ZXJQaWVjZXNGcmFtZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBjb2xvcikuY2xvbmUoKTtcbiAgICBkaXhtYUJvYXJkUGFnZS5hcHBlbmRDaGlsZChwbGF5ZXJQaWVjZSk7XG4gICAgcGxheWVyUGllY2UueCArPSBwbGF5ZXJQaWVjZXNGcmFtZS54O1xuICAgIHBsYXllclBpZWNlLnkgKz0gcGxheWVyUGllY2VzRnJhbWUueTtcbn07XG5jb25zdCByZXNldFRva2VucyA9ICgpID0+IHtcbiAgICBjb25zdCB0b2tlbnNPbkJvYXJkID0gY2FyZFBsYXlGcmFtZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgdG9rZW5zT25Cb2FyZC5mb3JFYWNoKHRva2VuID0+IHsgdG9rZW4ucmVtb3ZlKCk7IH0pO1xuICAgIHBsYXllck5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBub2RlLnBhZ2U7XG4gICAgICAgIGNvbnN0IFZvdGluZ1Rva2Vuc0ZyYW1lcyA9IHBhZ2UuZmluZENoaWxkcmVuKGNoaWxkID0+IGNoaWxkLm5hbWUgPT09IFwiVm90aW5nIFRva2Vuc1wiKTtcbiAgICAgICAgVm90aW5nVG9rZW5zRnJhbWVzLmZvckVhY2goZnJhbWUgPT4geyBmcmFtZS5yZW1vdmUoKTsgfSk7XG4gICAgICAgIGNvbnN0IHRva2Vuc0luVXNlID0gcGFnZS5maW5kQWxsKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJWb3RpbmcgVG9rZW5cIik7XG4gICAgICAgIHRva2Vuc0luVXNlLmZvckVhY2godG9rZW4gPT4ge1xuICAgICAgICAgICAgaWYgKHRva2VuLnBhcmVudC50eXBlID09PSAnUEFHRScgfHwgdG9rZW4ucGFyZW50LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICB0b2tlbi5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gcGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQYWdlIFRlbXBsYXRlXCIpO1xuICAgICAgICBtb3ZlVm90aW5nVG9rZW5zKHBhZ2UsIGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICB9KTtcbn07XG5jb25zdCBuZXh0U3Rvcnl0ZWxsZXIgPSAobmV3U3Rvcnl0ZWxsZXIpID0+IHtcbiAgICBpZiAodHlwZW9mIG5ld1N0b3J5dGVsbGVyID09ICdudW1iZXInKSB7XG4gICAgICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gbmV3U3Rvcnl0ZWxsZXI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCA9IChjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCArIDEpICUgcGxheWVycy5sZW5ndGg7XG4gICAgfVxuICAgIGNvbnN0IGN1cnJDb2xvciA9IHBsYXllcnNbY3VycmVudFN0b3J5dGVsbGVySW5kZXhdLmNvbG9yO1xuICAgIGNvbnN0IHN0b3J5dGVsbGVyVG9rZW4gPSBkaXhtYUJvYXJkUGFnZS5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTdG9yeXRlbGxlciBCYWRnZVwiKTtcbiAgICBjb25zdCBzdG9yeXRlbGxlcklkeCA9IFBMQVlFUl9PUkRFUi5pbmRleE9mKGN1cnJDb2xvcik7XG4gICAgc3Rvcnl0ZWxsZXJUb2tlbi55ID0gMTAyICsgNDQgKiBzdG9yeXRlbGxlcklkeDtcbn07XG5jb25zdCByZXNldERlYWx0Q2FyZHMgPSAoKSA9PiB7XG4gICAgZGVja1BhZ2UuY2hpbGRyZW4uZm9yRWFjaCgoaW1hZ2UpID0+IGltYWdlLnNldFBsdWdpbkRhdGEoXCJkZWFsdFwiLCBcImZhbHNlXCIpKTtcbn07XG5jb25zdCBjbGVhclBsYXllclBpZWNlc0Zyb21Cb2FyZCA9ICgpID0+IHtcbiAgICBjb25zdCBwbGF5ZXJQaWVjZXMgPSBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGRyZW4oYyA9PiAoUExBWUVSX09SREVSLmluZGV4T2YoYy5uYW1lKSA+IC0xKSk7XG4gICAgcGxheWVyUGllY2VzLmZvckVhY2gocGllY2UgPT4geyBwaWVjZS5yZW1vdmUoKTsgfSk7XG59O1xuY29uc3QgY2xlYXJQbGF5ZXJOYW1lcyA9ICgpID0+IHtcbiAgICBwbGF5ZXJzRnJhbWUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgLy8gSWdub3JlIGluc3RydWN0aW9uIHRleHQgbm9kZXMsIHdlIG9ubHkgbmVlZCB0byBsb29rIGF0IHRoZSBwbGF5ZXJzXG4gICAgICAgIGlmIChjaGlsZC50eXBlID09PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWUgPSBjaGlsZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcInBsYXllciBuYW1lXCIpO1xuICAgICAgICAgICAgZmlnbWFcbiAgICAgICAgICAgICAgICAubG9hZEZvbnRBc3luYyh7IGZhbWlseTogXCJSb2JvdG8gU2xhYlwiLCBzdHlsZTogXCJSZWd1bGFyXCIgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiAocGxheWVyTmFtZS5jaGFyYWN0ZXJzID0gRU1QVFlfUExBWUVSX1NUUklORykpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuY29uc3QgcmVzZXRHYW1lID0gKCkgPT4ge1xuICAgIGdhbWVQaGFzZSA9IFBIQVNFUy5OT19HQU1FO1xuICAgIHBsYXllcnMgPSBbXTtcbiAgICBwbGF5ZXJOb2RlcyA9IFtdO1xuICAgIGN1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gMDtcbiAgICByZXNldFRva2VucygpO1xuICAgIHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luKCk7XG4gICAgY2xlYXJDYXJkc0Zyb21QbGF5QXJlYSgpO1xuICAgIGRlbGV0ZVBsYXllclBhZ2VzKCk7XG4gICAgcmVzZXREZWFsdENhcmRzKCk7XG4gICAgY2xlYXJQbGF5ZXJQaWVjZXNGcm9tQm9hcmQoKTtcbn07XG4vLyBSVU5TIE9OIExBVU5DSCAtIGNoZWNrIGZvciBnYW1lIHN0YXRlIGV2ZXJ5IHNlY29uZFxuaWYgKHBpZWNlc0FyZVJlYWR5KCkpIHtcbiAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgdXBkYXRlUGx1Z2luU3RhdGVGcm9tRG9jdW1lbnQoKTtcbiAgICB9LCAxMDAwKTtcbn1cbi8vIEhFTFBFUiBGVU5DVElPTlNcbmNvbnN0IGhleFRvUkdCID0gKGhleCkgPT4ge1xuICAgIGNvbnN0IGggPSAoaGV4LmNoYXJBdCgwKSA9PSBcIiNcIikgPyBoZXguc3Vic3RyaW5nKDEsIDcpIDogaGV4O1xuICAgIHJldHVybiB7XG4gICAgICAgIHI6IHBhcnNlSW50KGguc3Vic3RyaW5nKDAsIDIpLCAxNikgLyAyNTUsXG4gICAgICAgIGc6IHBhcnNlSW50KGguc3Vic3RyaW5nKDIsIDQpLCAxNikgLyAyNTUsXG4gICAgICAgIGI6IHBhcnNlSW50KGguc3Vic3RyaW5nKDQsIDYpLCAxNikgLyAyNTVcbiAgICB9O1xufTtcbmNvbnN0IGNsb25lID0gKHZhbHVlKSA9PiB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbn07XG5jb25zdCBzY2FsZUltYWdlID0gKGltYWdlLCBtYXhXaWR0aCwgbWF4SGVpZ2h0KSA9PiB7XG4gICAgaWYgKGltYWdlLndpZHRoID4gbWF4V2lkdGgpIHtcbiAgICAgICAgY29uc3QgbmV3SGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0IC8gKGltYWdlLndpZHRoIC8gbWF4V2lkdGgpO1xuICAgICAgICBpZiAobmV3SGVpZ2h0ID4gbWF4SGVpZ2h0KSB7XG4gICAgICAgICAgICBjb25zdCBuZXdXaWR0aCA9IG1heFdpZHRoIC8gKG5ld0hlaWdodCAvIG1heEhlaWdodCk7XG4gICAgICAgICAgICBpbWFnZS5yZXNpemUobmV3V2lkdGgsIG1heEhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpbWFnZS5yZXNpemUobWF4V2lkdGgsIG5ld0hlaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuZnVuY3Rpb24gZGVlcEVxdWFsKG9iamVjdDEsIG9iamVjdDIpIHtcbiAgICBjb25zdCBrZXlzMSA9IE9iamVjdC5rZXlzKG9iamVjdDEpO1xuICAgIGNvbnN0IGtleXMyID0gT2JqZWN0LmtleXMob2JqZWN0Mik7XG4gICAgaWYgKGtleXMxLmxlbmd0aCAhPT0ga2V5czIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5czEpIHtcbiAgICAgICAgY29uc3QgdmFsMSA9IG9iamVjdDFba2V5XTtcbiAgICAgICAgY29uc3QgdmFsMiA9IG9iamVjdDJba2V5XTtcbiAgICAgICAgY29uc3QgYXJlT2JqZWN0cyA9IGlzT2JqZWN0KHZhbDEpICYmIGlzT2JqZWN0KHZhbDIpO1xuICAgICAgICBpZiAoYXJlT2JqZWN0cyAmJiAhZGVlcEVxdWFsKHZhbDEsIHZhbDIpIHx8XG4gICAgICAgICAgICAhYXJlT2JqZWN0cyAmJiB2YWwxICE9PSB2YWwyKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBpc09iamVjdChvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0ICE9IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCc7XG59XG4vLyAgRHVyc3RlbmZlbGQgU2h1ZmZsZSwgY29waWVkIGZyb20gU3RhY2sgT3ZlcmZsb3dcbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheSkge1xuICAgIGxldCBhcnJheUNvcHkgPSBjbG9uZShhcnJheSk7XG4gICAgZm9yIChsZXQgaSA9IGFycmF5Q29weS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG4gICAgICAgIGNvbnN0IGogPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAoaSArIDEpKTtcbiAgICAgICAgW2FycmF5Q29weVtpXSwgYXJyYXlDb3B5W2pdXSA9IFthcnJheUNvcHlbal0sIGFycmF5Q29weVtpXV07XG4gICAgfVxuICAgIHJldHVybiBhcnJheUNvcHk7XG59XG4iXSwic291cmNlUm9vdCI6IiJ9