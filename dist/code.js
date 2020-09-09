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
const phases = {
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
let players;
let currentStorytellerIndex = 0; // player index of current storyteller
let playerPages;
let gameState = phases.NO_GAME;
// here is where we should check for an existing game on load
// handle messages from plugin UI
figma.ui.onmessage = (msg) => {
    if (msg.type === "start-game") {
        if (gameState === phases.NO_GAME && piecesAreReady() && playersAreReady()) {
            // start the game
            gameState = phases.PICKING;
            updateDocumentStateFromPlugin();
            players.forEach(player => {
                createPlayerPage(player);
            });
        }
    }
    if (msg.type === "delete-pages") {
        deletePlayerPages();
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
    figma.root.setPluginData("gameState", gameState);
    figma.root.setPluginData("currentStorytellerIndex", `${currentStorytellerIndex}`);
};
const updatePluginStateFromDocument = () => {
    const newPlayers = JSON.parse(figma.root.getPluginData('players'));
    const newGameState = figma.root.getPluginData('gameState');
    const newCurrentStorytellerIndex = figma.root.getPluginData('currentStorytellerIndex');
    // console.log(newPlayers);
    // console.log(newGameState);
    // console.log(newCurrentStorytellerIndex);
    // if (players !== newPlayers) {
    //     players = newPlayers;
    // }
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
const deletePlayerPages = () => {
    figma.root.children.forEach(page => {
        if (page.getPluginData("isPlayerPage") === "true") {
            try {
                page.remove();
            }
            catch (error) {
                figma.notify(`Could not remove player page: ${page.name} –> Try again or remove manually.`);
                console.log(error);
            }
        }
    });
};
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


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRCx3QkFBd0I7QUFDbkY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixrREFBa0Q7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLE9BQU87QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhEQUE4RCxVQUFVO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiZmlnbWEuc2hvd1VJKF9faHRtbF9fKTtcbmZpZ21hLnVpLnJlc2l6ZSgzMjAsIDY2MCk7XG4vLyB2YXJpYWJsZXMgdG8gc3RvcmUgZ2FtZSBwaWVjZSBub2RlcyAocGFnZXMsZnJhbWVzLGV0YylcbmxldCBkaXhtYUJvYXJkUGFnZTtcbmxldCBkZWNrUGFnZTtcbmxldCBjb21wb25lbnRzUGFnZTtcbmxldCBwbGF5ZXJQYWdlVGVtcGxhdGU7XG5sZXQgY2FyZFBsYXlGcmFtZTtcbmxldCBwbGF5ZXJzRnJhbWU7XG5sZXQgc3Rvcnl0ZWxsZXJCYWRnZU5vZGU7XG4vLyBjb25zdGFudHNcbmNvbnN0IHBoYXNlcyA9IHtcbiAgICBOT19HQU1FOiBcIm5vIGFjdGl2ZSBnYW1lXCIsXG4gICAgUElDS0lORzogXCJwbGF5ZXJzIGFyZSBwaWNraW5nIGNhcmRzXCIsXG4gICAgVk9USU5HOiBcInBsYXllcnMgYXJlIHZvdGluZ1wiLFxuICAgIFNDT1JJTkc6IFwicGxheWVycyBhcmUgbW92aW5nIHRoZWlyIHRva2VucyBvbiB0aGUgc2NvcmUgdHJhY2tpbmcgYm9hcmRcIlxufTtcbmNvbnN0IEVNUFRZX1BMQVlFUl9TVFJJTkcgPSBcIn4gfiB+IH4gfiB+IH4gflwiO1xuY29uc3QgUExBWUVSX09SREVSID0gW1wicmVkXCIsIFwib3JhbmdlXCIsIFwiZ29sZFwiLCBcImxpbWVcIiwgXCJncmVlblwiLCBcInR1cnF1b2lzZVwiLCBcImJsdWVcIiwgXCJ2aW9sZXRcIiwgXCJwdXJwbGVcIiwgXCJibGFja1wiLCBcInNpbHZlclwiLCBcIndoaXRlXCJdO1xuY29uc3QgQ09MT1JTX0FTX0hFWCA9IHtcbiAgICByZWQ6IFwiRkYwMDAwXCIsIG9yYW5nZTogXCJGRjgwMEFcIiwgZ29sZDogXCJGRkQ3MDBcIiwgbGltZTogXCJCREZGMDBcIixcbiAgICBncmVlbjogXCIwMDgwMDBcIiwgdHVycXVvaXNlOiBcIjQwRTBEMFwiLCBibHVlOiBcIjAwMDBDRFwiLCB2aW9sZXQ6IFwiRUU4MkVFXCIsXG4gICAgcHVycGxlOiBcIjgwMDA4MFwiLCBibGFjazogXCIwMDAwMDBcIiwgc2lsdmVyOiBcIkMwQzBDMFwiLCB3aGl0ZTogXCJGRkZGRkZcIlxufTtcbmNvbnN0IFZPVElOR19UT0tFTlNfTkFNRSA9IFwiVm90aW5nIFRva2Vuc1wiO1xuY29uc3QgQ0FSRF9OQU1FID0gXCJDYXJkXCI7XG5jb25zdCBDQVJEX1NMT1RfUEFERElORyA9IDU7XG5jb25zdCBDQVJEX1NJWkUgPSAxNTA7XG4vLyBnYW1lIHN0YXRlIHZhcmlhYmxlc1xubGV0IHBsYXllcnM7XG5sZXQgY3VycmVudFN0b3J5dGVsbGVySW5kZXggPSAwOyAvLyBwbGF5ZXIgaW5kZXggb2YgY3VycmVudCBzdG9yeXRlbGxlclxubGV0IHBsYXllclBhZ2VzO1xubGV0IGdhbWVTdGF0ZSA9IHBoYXNlcy5OT19HQU1FO1xuLy8gaGVyZSBpcyB3aGVyZSB3ZSBzaG91bGQgY2hlY2sgZm9yIGFuIGV4aXN0aW5nIGdhbWUgb24gbG9hZFxuLy8gaGFuZGxlIG1lc3NhZ2VzIGZyb20gcGx1Z2luIFVJXG5maWdtYS51aS5vbm1lc3NhZ2UgPSAobXNnKSA9PiB7XG4gICAgaWYgKG1zZy50eXBlID09PSBcInN0YXJ0LWdhbWVcIikge1xuICAgICAgICBpZiAoZ2FtZVN0YXRlID09PSBwaGFzZXMuTk9fR0FNRSAmJiBwaWVjZXNBcmVSZWFkeSgpICYmIHBsYXllcnNBcmVSZWFkeSgpKSB7XG4gICAgICAgICAgICAvLyBzdGFydCB0aGUgZ2FtZVxuICAgICAgICAgICAgZ2FtZVN0YXRlID0gcGhhc2VzLlBJQ0tJTkc7XG4gICAgICAgICAgICB1cGRhdGVEb2N1bWVudFN0YXRlRnJvbVBsdWdpbigpO1xuICAgICAgICAgICAgcGxheWVycy5mb3JFYWNoKHBsYXllciA9PiB7XG4gICAgICAgICAgICAgICAgY3JlYXRlUGxheWVyUGFnZShwbGF5ZXIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1zZy50eXBlID09PSBcImRlbGV0ZS1wYWdlc1wiKSB7XG4gICAgICAgIGRlbGV0ZVBsYXllclBhZ2VzKCk7XG4gICAgfVxufTtcbmNvbnN0IHBpZWNlc0FyZVJlYWR5ID0gKCkgPT4ge1xuICAgIGRpeG1hQm9hcmRQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRpeG1hIEJvYXJkXCIpO1xuICAgIGRlY2tQYWdlID0gZmlnbWEucm9vdC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkRlY2tcIik7XG4gICAgY29tcG9uZW50c1BhZ2UgPSBmaWdtYS5yb290LmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiQ29tcG9uZW50c1wiKTtcbiAgICBwbGF5ZXJQYWdlVGVtcGxhdGUgPSBjb21wb25lbnRzUGFnZSAmJiBjb21wb25lbnRzUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlBsYXllciBQYWdlIFRlbXBsYXRlXCIpO1xuICAgIGNhcmRQbGF5RnJhbWUgPSBkaXhtYUJvYXJkUGFnZSAmJiBkaXhtYUJvYXJkUGFnZS5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgUGxheSBBcmVhXCIpO1xuICAgIHBsYXllcnNGcmFtZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyc1wiKTtcbiAgICBzdG9yeXRlbGxlckJhZGdlTm9kZSA9IGRpeG1hQm9hcmRQYWdlICYmIGRpeG1hQm9hcmRQYWdlLmZpbmRPbmUoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlN0b3J5dGVsbGVyIEJhZGdlXCIpO1xuICAgIGlmICghKGRpeG1hQm9hcmRQYWdlICYmIGRlY2tQYWdlICYmIGNvbXBvbmVudHNQYWdlICYmIHBsYXllclBhZ2VUZW1wbGF0ZSAmJiBjYXJkUGxheUZyYW1lICYmIHBsYXllcnNGcmFtZSAmJiBzdG9yeXRlbGxlckJhZGdlTm9kZSkpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiR2FtZSBwaWVjZSBub3QgZm91bmQuIFVzZSBEaXhtYSB0ZW1wbGF0ZSBmaWxlIC8gY2hlY2sgdGhhdCBub3RoaW5nIHdhcyBhY2NpZGVudGFsbHkgZGVsZXRlZCBvciByZW5hbWVkLiBTZWUgY29uc29sZS4uLlwiKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJFYWNoIG9mIHRoZSBmb2xsb3dpbmcgc2hvdWxkIGJlIGRlZmluZWQuXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICBkaXhtYUJvYXJkUGFnZSwgZGVja1BhZ2UsIGNvbXBvbmVudHNQYWdlLCBwbGF5ZXJQYWdlVGVtcGxhdGUsXG4gICAgICAgICAgICBjYXJkUGxheUZyYW1lLCBwbGF5ZXJzRnJhbWUsIHN0b3J5dGVsbGVyQmFkZ2VOb2RlXG4gICAgICAgIH0pLnNwbGl0KCcsJykuam9pbignXFxuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHBsYXllcnNBcmVSZWFkeSA9ICgpID0+IHtcbiAgICBsZXQgbmV3UGxheWVycyA9IFtdO1xuICAgIHBsYXllcnNGcmFtZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAvLyBJZ25vcmUgaW5zdHJ1Y3Rpb24gdGV4dCBub2Rlcywgd2Ugb25seSBuZWVkIHRvIGxvb2sgYXQgdGhlIHBsYXllcnNcbiAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09IFwiSU5TVEFOQ0VcIikge1xuICAgICAgICAgICAgY29uc3QgcGxheWVyTmFtZU5vZGUgPSBjaGlsZC5maW5kQ2hpbGQoKGdyYW5kY2hpbGQpID0+IGdyYW5kY2hpbGQubmFtZSA9PT0gXCJwbGF5ZXIgbmFtZVwiKTtcbiAgICAgICAgICAgIGNvbnN0IHBsYXllck5hbWUgPSBwbGF5ZXJOYW1lTm9kZS5jaGFyYWN0ZXJzO1xuICAgICAgICAgICAgaWYgKHBsYXllck5hbWUgJiYgcGxheWVyTmFtZSAhPT0gRU1QVFlfUExBWUVSX1NUUklORykge1xuICAgICAgICAgICAgICAgIG5ld1BsYXllcnMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IHBsYXllck5hbWUsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBjaGlsZC5uYW1lXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAobmV3UGxheWVycy5sZW5ndGggPCA0KSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeSgnTmVlZCBhdCBsZWFzdCA0IHBsYXllcnMgdG8gc3RhcnQgYSBnYW1lLicpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHBsYXllcnMgPSBuZXdQbGF5ZXJzO1xuICAgIHJldHVybiB0cnVlO1xufTtcbmNvbnN0IHVwZGF0ZURvY3VtZW50U3RhdGVGcm9tUGx1Z2luID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcInBsYXllcnNcIiwgSlNPTi5zdHJpbmdpZnkocGxheWVycykpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImdhbWVTdGF0ZVwiLCBnYW1lU3RhdGUpO1xuICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImN1cnJlbnRTdG9yeXRlbGxlckluZGV4XCIsIGAke2N1cnJlbnRTdG9yeXRlbGxlckluZGV4fWApO1xufTtcbmNvbnN0IHVwZGF0ZVBsdWdpblN0YXRlRnJvbURvY3VtZW50ID0gKCkgPT4ge1xuICAgIGNvbnN0IG5ld1BsYXllcnMgPSBKU09OLnBhcnNlKGZpZ21hLnJvb3QuZ2V0UGx1Z2luRGF0YSgncGxheWVycycpKTtcbiAgICBjb25zdCBuZXdHYW1lU3RhdGUgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoJ2dhbWVTdGF0ZScpO1xuICAgIGNvbnN0IG5ld0N1cnJlbnRTdG9yeXRlbGxlckluZGV4ID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKCdjdXJyZW50U3Rvcnl0ZWxsZXJJbmRleCcpO1xuICAgIC8vIGNvbnNvbGUubG9nKG5ld1BsYXllcnMpO1xuICAgIC8vIGNvbnNvbGUubG9nKG5ld0dhbWVTdGF0ZSk7XG4gICAgLy8gY29uc29sZS5sb2cobmV3Q3VycmVudFN0b3J5dGVsbGVySW5kZXgpO1xuICAgIC8vIGlmIChwbGF5ZXJzICE9PSBuZXdQbGF5ZXJzKSB7XG4gICAgLy8gICAgIHBsYXllcnMgPSBuZXdQbGF5ZXJzO1xuICAgIC8vIH1cbn07XG5jb25zdCBjcmVhdGVQbGF5ZXJQYWdlID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IHBsYXllclBhZ2UgPSBmaWdtYS5jcmVhdGVQYWdlKCk7XG4gICAgcGxheWVyUGFnZS5zZXRQbHVnaW5EYXRhKCdpc1BsYXllclBhZ2UnLCAndHJ1ZScpO1xuICAgIHBsYXllclBhZ2UubmFtZSA9IHBsYXllci5uYW1lO1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gY3JlYXRlUGxheWVyQm9hcmQocGxheWVyKTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGN1c3RvbVBsYXllckJvYXJkKTtcbiAgICBjdXN0b21QbGF5ZXJCb2FyZC5sb2NrZWQgPSB0cnVlO1xuICAgIG1vdmVWb3RpbmdUb2tlbnMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIGRlYWxGaXJzdEhhbmQocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpO1xuICAgIHJldHVybiBwbGF5ZXJQYWdlO1xufTtcbmNvbnN0IGNyZWF0ZVBsYXllckJvYXJkID0gKHBsYXllcikgPT4ge1xuICAgIGNvbnN0IGN1c3RvbVBsYXllckJvYXJkID0gcGxheWVyUGFnZVRlbXBsYXRlLmNsb25lKCk7XG4gICAgLy8gQ3VzdG9taXplIHBhZ2Ugd2l0aCBwbGF5ZXIgbmFtZVxuICAgIGNvbnN0IHBsYXllck5hbWVFbGVtZW50ID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZE9uZSgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIE5hbWUgVGV4dFwiKTtcbiAgICBmaWdtYVxuICAgICAgICAubG9hZEZvbnRBc3luYyh7IGZhbWlseTogXCJBbWVyaWNhbiBUeXBld3JpdGVyXCIsIHN0eWxlOiBcIlJlZ3VsYXJcIiB9KVxuICAgICAgICAudGhlbigoKSA9PiAocGxheWVyTmFtZUVsZW1lbnQuY2hhcmFjdGVycyA9IHBsYXllci5uYW1lKSk7XG4gICAgLy8gQ29weSBpbiBwbGF5ZXIgdG9rZW4gZnJvbSBDb21wb25lbnRzIFBhZ2VcbiAgICBjb25zdCBwbGF5ZXJUb2tlbnNGcmFtZSA9IGNvbXBvbmVudHNQYWdlLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFwiUGxheWVyIFRva2Vuc1wiKTtcbiAgICBjb25zdCBwbGF5ZXJUb2tlbiA9IHBsYXllclRva2Vuc0ZyYW1lLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IHBsYXllci5jb2xvcikuY2xvbmUoKTtcbiAgICBwbGF5ZXJUb2tlbi5yZXNpemUoNDAsIDQwKTtcbiAgICBwbGF5ZXJUb2tlbi54ID0gNzg7XG4gICAgcGxheWVyVG9rZW4ueSA9IDc4O1xuICAgIGN1c3RvbVBsYXllckJvYXJkLmFwcGVuZENoaWxkKHBsYXllclRva2VuKTtcbiAgICAvLyBDaGFuZ2UgY29sb3Igb2Ygdm90aW5nIHRva2Vuc1xuICAgIGNvbnN0IHZvdGluZ1Rva2VucyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRDaGlsZCgoY2hpbGQpID0+IGNoaWxkLm5hbWUgPT09IFZPVElOR19UT0tFTlNfTkFNRSk7XG4gICAgdm90aW5nVG9rZW5zLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuID0gY2hpbGQ7XG4gICAgICAgIGNvbnN0IHZvdGluZ1Rva2VuRmlsbHMgPSBjbG9uZSh2b3RpbmdUb2tlbi5maWxscyk7XG4gICAgICAgIHZvdGluZ1Rva2VuRmlsbHNbMF0uY29sb3IgPSBoZXhUb1JHQihDT0xPUlNfQVNfSEVYW3BsYXllci5jb2xvcl0pO1xuICAgICAgICB2b3RpbmdUb2tlbi5maWxscyA9IHZvdGluZ1Rva2VuRmlsbHM7XG4gICAgfSk7XG4gICAgcmV0dXJuIGN1c3RvbVBsYXllckJvYXJkO1xufTtcbi8vIE1vdmUgdGhlIHZvdGluZyB0b2tlbnMgb3V0IG9mIHRoZSBjb21wb25lbnQgc28gdGhleSBjYW4gYmUgZWFzaWx5IGRyYWdnZWRcbmNvbnN0IG1vdmVWb3RpbmdUb2tlbnMgPSAocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpID0+IHtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnMgPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kT25lKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gVk9USU5HX1RPS0VOU19OQU1FKTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNQb3NpdGlvbiA9IHZvdGluZ1Rva2Vucy5hYnNvbHV0ZVRyYW5zZm9ybTtcbiAgICBjb25zdCB2b3RpbmdUb2tlbnNDbG9uZSA9IHZvdGluZ1Rva2Vucy5jbG9uZSgpO1xuICAgIHZvdGluZ1Rva2Vucy52aXNpYmxlID0gZmFsc2U7XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh2b3RpbmdUb2tlbnNDbG9uZSk7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUudmlzaWJsZSA9IHRydWU7XG4gICAgdm90aW5nVG9rZW5zQ2xvbmUueCA9IHZvdGluZ1Rva2Vuc1Bvc2l0aW9uWzBdWzJdO1xuICAgIHZvdGluZ1Rva2Vuc0Nsb25lLnkgPSB2b3RpbmdUb2tlbnNQb3NpdGlvblsxXVsyXTtcbn07XG4vLyBTZXQgdXAgYXJlYXMgb24gcGxheWVyIGJvYXJkIHRvIHNlbGVjdCBjYXJkcyAmIHRva2VucyBieSBkcm9wcGluZyB0aGVtIGluIGEgZnJhbWVcbmZ1bmN0aW9uIHNldFVwU2VsZWN0aW9uQXJlYXMocGxheWVyUGFnZSwgY3VzdG9tUGxheWVyQm9hcmQpIHtcbiAgICBjb25zdCBjYXJkU2VsZWN0aW9uQXJlYSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgY29uc3Qgc2VsZWN0ZWRDYXJkID0gY3VzdG9tUGxheWVyQm9hcmQuZmluZENoaWxkKChjaGlsZCkgPT4gY2hpbGQubmFtZSA9PT0gXCJTZWxlY3RlZCBjYXJkXCIpO1xuICAgIGNvbnN0IGNhcmRGaWxscyA9IGNsb25lKGNhcmRTZWxlY3Rpb25BcmVhLmZpbGxzKTtcbiAgICBjYXJkRmlsbHNbMF0ub3BhY2l0eSA9IDA7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEubmFtZSA9IFwiQ2FyZCBTZWxlY3Rpb24gQXJlYVwiO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnJlc2l6ZShzZWxlY3RlZENhcmQud2lkdGgsIHNlbGVjdGVkQ2FyZC5oZWlnaHQpO1xuICAgIGNhcmRTZWxlY3Rpb25BcmVhLnggPSBzZWxlY3RlZENhcmQuYWJzb2x1dGVUcmFuc2Zvcm1bMF1bMl07XG4gICAgY2FyZFNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkQ2FyZC5hYnNvbHV0ZVRyYW5zZm9ybVsxXVsyXTtcbiAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKGNhcmRTZWxlY3Rpb25BcmVhKTtcbiAgICBjb25zdCB0b2tlblNlbGVjdGlvbkFyZWEgPSBmaWdtYS5jcmVhdGVGcmFtZSgpO1xuICAgIGNvbnN0IHNlbGVjdGVkVG9rZW4gPSBjdXN0b21QbGF5ZXJCb2FyZC5maW5kQ2hpbGQoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIlNlbGVjdGVkIHZvdGluZyB0b2tlblwiKTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEuZmlsbHMgPSBjYXJkRmlsbHM7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLm5hbWUgPSBcIlRva2VuIFNlbGVjdGlvbiBBcmVhXCI7XG4gICAgdG9rZW5TZWxlY3Rpb25BcmVhLmNvcm5lclJhZGl1cyA9IDEwO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS5yZXNpemUoc2VsZWN0ZWRUb2tlbi53aWR0aCwgc2VsZWN0ZWRUb2tlbi5oZWlnaHQpO1xuICAgIHRva2VuU2VsZWN0aW9uQXJlYS54ID0gc2VsZWN0ZWRUb2tlbi5hYnNvbHV0ZVRyYW5zZm9ybVswXVsyXTtcbiAgICB0b2tlblNlbGVjdGlvbkFyZWEueSA9IHNlbGVjdGVkVG9rZW4uYWJzb2x1dGVUcmFuc2Zvcm1bMV1bMl07XG4gICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh0b2tlblNlbGVjdGlvbkFyZWEpO1xufVxuY29uc3QgZGVhbEZpcnN0SGFuZCA9IChwbGF5ZXJQYWdlLCBjdXN0b21QbGF5ZXJCb2FyZCkgPT4ge1xuICAgIGNvbnN0IGNhcmRTbG90cyA9IGN1c3RvbVBsYXllckJvYXJkLmZpbmRBbGwoKGNoaWxkKSA9PiBjaGlsZC5uYW1lID09PSBcIkNhcmQgSW5uZXIgUGxhY2Vob2xkZXJcIik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgbGV0IHJhbmRvbUltYWdlID0gZ2V0UmFuZG9tSW1hZ2VGcm9tRGVjaygpO1xuICAgICAgICBjb25zdCBjYXJkU2xvdCA9IGNhcmRTbG90c1tpXTtcbiAgICAgICAgY29uc3QgY2FyZFNsb3RQb3NpdGlvbiA9IGNhcmRTbG90LmFic29sdXRlVHJhbnNmb3JtO1xuICAgICAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHJhbmRvbUltYWdlKTtcbiAgICAgICAgLy8gU2NhbGUgaW1hZ2UgdG8gZml0IGNhcmQgc2xvdHNcbiAgICAgICAgcmFuZG9tSW1hZ2UgPSBzY2FsZUltYWdlKHJhbmRvbUltYWdlLCBDQVJEX1NJWkUsIENBUkRfU0laRSk7XG4gICAgICAgIHJhbmRvbUltYWdlLnggPSBjYXJkU2xvdFBvc2l0aW9uWzBdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIHJhbmRvbUltYWdlLnkgPSBjYXJkU2xvdFBvc2l0aW9uWzFdWzJdICsgQ0FSRF9TTE9UX1BBRERJTkc7XG4gICAgICAgIHJhbmRvbUltYWdlLm5hbWUgPSBDQVJEX05BTUU7XG4gICAgfVxufTtcbmNvbnN0IGdldFJhbmRvbUltYWdlRnJvbURlY2sgPSAoKSA9PiB7XG4gICAgY29uc3QgZGVja0ltYWdlcyA9IGRlY2tQYWdlLmNoaWxkcmVuO1xuICAgIGxldCByYW5kb21JbWFnZSA9IGRlY2tJbWFnZXNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZGVja0ltYWdlcy5sZW5ndGgpXTtcbiAgICBpZiAocmFuZG9tSW1hZ2UuZ2V0UGx1Z2luRGF0YShcImRlYWx0XCIpID09PSBcInRydWVcIikge1xuICAgICAgICByYW5kb21JbWFnZSA9IGdldFJhbmRvbUltYWdlRnJvbURlY2soKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJhbmRvbUltYWdlLnNldFBsdWdpbkRhdGEoXCJkZWFsdFwiLCBcInRydWVcIik7XG4gICAgfVxuICAgIHJldHVybiByYW5kb21JbWFnZS5jbG9uZSgpO1xufTtcbmNvbnN0IGRlbGV0ZVBsYXllclBhZ2VzID0gKCkgPT4ge1xuICAgIGZpZ21hLnJvb3QuY2hpbGRyZW4uZm9yRWFjaChwYWdlID0+IHtcbiAgICAgICAgaWYgKHBhZ2UuZ2V0UGx1Z2luRGF0YShcImlzUGxheWVyUGFnZVwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcGFnZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShgQ291bGQgbm90IHJlbW92ZSBwbGF5ZXIgcGFnZTogJHtwYWdlLm5hbWV9IOKAkz4gVHJ5IGFnYWluIG9yIHJlbW92ZSBtYW51YWxseS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG4vLyBIRUxQRVIgRlVOQ1RJT05TXG5jb25zdCBoZXhUb1JHQiA9IChoZXgpID0+IHtcbiAgICBjb25zdCBoID0gKGhleC5jaGFyQXQoMCkgPT0gXCIjXCIpID8gaGV4LnN1YnN0cmluZygxLCA3KSA6IGhleDtcbiAgICByZXR1cm4ge1xuICAgICAgICByOiBwYXJzZUludChoLnN1YnN0cmluZygwLCAyKSwgMTYpIC8gMjU1LFxuICAgICAgICBnOiBwYXJzZUludChoLnN1YnN0cmluZygyLCA0KSwgMTYpIC8gMjU1LFxuICAgICAgICBiOiBwYXJzZUludChoLnN1YnN0cmluZyg0LCA2KSwgMTYpIC8gMjU1XG4gICAgfTtcbn07XG5jb25zdCBjbG9uZSA9ICh2YWx1ZSkgPT4ge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG59O1xuY29uc3Qgc2NhbGVJbWFnZSA9IChpbWFnZSwgbWF4V2lkdGgsIG1heEhlaWdodCkgPT4ge1xuICAgIGlmIChpbWFnZS53aWR0aCA+IG1heFdpZHRoKSB7XG4gICAgICAgIGNvbnN0IG5ld0hlaWdodCA9IGltYWdlLmhlaWdodCAvIChpbWFnZS53aWR0aCAvIG1heFdpZHRoKTtcbiAgICAgICAgaWYgKG5ld0hlaWdodCA+IG1heEhlaWdodCkge1xuICAgICAgICAgICAgY29uc3QgbmV3V2lkdGggPSBtYXhXaWR0aCAvIChuZXdIZWlnaHQgLyBtYXhIZWlnaHQpO1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG5ld1dpZHRoLCBtYXhIZWlnaHQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaW1hZ2UucmVzaXplKG1heFdpZHRoLCBuZXdIZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbWFnZTtcbn07XG4iXSwic291cmNlUm9vdCI6IiJ9