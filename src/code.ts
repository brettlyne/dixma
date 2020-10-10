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
}
const EMPTY_PLAYER_STRING = "~ ~ ~ ~ ~ ~ ~ ~";
const PLAYER_ORDER = ["red", "orange", "gold", "lime", "green", "turquoise", "blue", "violet", "purple", "black", "silver", "white"];
const COLORS_AS_HEX = {
    red: "FF0000", orange: "FF800A", gold: "FFD700", lime: "BDFF00",
    green: "008000", turquoise: "40E0D0", blue: "0000CD", violet: "EE82EE",
    purple: "800080", black: "000000", silver: "C0C0C0", white: "FFFFFF"
}
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
                    figma.notify(`${player.name} will get cards at the beginning of the next round.`)
                    createPlayerPage(player);
                    addPlayerPiece(player.color)
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

}

const piecesAreReady = () => {
    dixmaBoardPage = figma.root.findChild((child) => child.name === "Dixma Board");
    deckPage = figma.root.findChild((child) => child.name === "Deck");
    componentsPage = figma.root.findChild((child) => child.name === "Components");
    playerPageTemplate = componentsPage && componentsPage.findChild((child) => child.name === "Player Page Template") as ComponentNode;
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
}

const playersAreReady = () => {
    let newPlayers = [];
    playersFrame.children.forEach((child) => {
        // Ignore instruction text nodes, we only need to look at the players
        if (child.type === "INSTANCE") {
            const playerNameNode = child.findChild((grandchild) => grandchild.name === "player name");
            const playerName = playerNameNode.characters
            if (playerName && playerName !== EMPTY_PLAYER_STRING) {
                newPlayers.push({
                    name: playerName,
                    color: child.name
                })
            }
        }
    });
    if (newPlayers.length < 4) {
        figma.notify('Need at least 4 players to start a game.')
        return false;
    }
    const playerNames = newPlayers.map(player => player.name);
    if (playerNames.length !== new Set(playerNames).size) {
        figma.notify('Duplicate names not allowed.')
        return false;
    }
    players = newPlayers;
    return true;
}

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
    const playerData = figma.root.getPluginData('players')
    const newGamePhase = figma.root.getPluginData('gamePhase');
    if (!playerData || !newGamePhase) {
        resetDocumentState();
        return;
    }
    const newPlayers = JSON.parse(playerData);
    const newCurrentStorytellerIndex = parseInt(figma.root.getPluginData('currentStorytellerIndex'));
    if (
        gamePhase !== newGamePhase ||
        currentStorytellerIndex !== newCurrentStorytellerIndex
    ) {
        gamePhase = newGamePhase
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
}

const populatePlayerNodes = () => {
    playerNodes = [];
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const page = figma.root.findChild((child) => child.name === player.name);
        if (!page) {
            removePlayerByIndex(i);
            break;
        }
        const selectedCardArea = page.findOne((child) => child.name === "Card Selection Area") as FrameNode;
        const selectedTokenArea = page.findOne((child) => child.name === "Token Selection Area") as FrameNode;
        playerNodes.push({ page, selectedCardArea, selectedTokenArea });
    }
}

const getPlayersWithStatus = () => {
    const playersWithStatus = [];

    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        const isStoryteller = (i === currentStorytellerIndex);
        const playerNode = playerNodes[i];

        if (!playerNode.page || playerNode.page.removed) {  // page has been deleted -> remove player
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
                status = 'storyteller'
            } else {
                const selectedToken = playerNode.selectedTokenArea.findChild((child) => child.name === "Voting Token");
                status = (selectedToken ? "done-with-action" : "voting");
            }
        }
        if (gamePhase === PHASES.SCORING) {
            status = (isStoryteller ? 'storyteller-scoring' : 'scoring')
        }
        playersWithStatus.push({ ...player, status });
    };
    return playersWithStatus;
}

// called to remove a player from the game state (probably because they no longer have a player page)
const removePlayerByIndex = (i) => {
    players.splice(i, 1);
    if (i < currentStorytellerIndex) {
        nextStoryteller(currentStorytellerIndex - 1);
    }
    updateDocumentStateFromPlugin()
    populatePlayerNodes();
}

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
}

const createPlayerBoard = (player) => {
    const customPlayerBoard = playerPageTemplate.clone();

    // Customize page with player name
    const playerNameElement = customPlayerBoard.findOne((child) => child.name === "Player Name Text") as TextNode;
    figma
        .loadFontAsync({ family: "American Typewriter", style: "Regular" })
        .then(() => (playerNameElement.characters = player.name));

    // Copy in player token from Components Page
    const playerTokensFrame = componentsPage.findChild((child) => child.name === "Player Tokens") as FrameNode;
    const playerToken = playerTokensFrame.findChild((child) => child.name === player.color).clone();
    playerToken.resize(40, 40);
    playerToken.x = 78;
    playerToken.y = 78;
    customPlayerBoard.appendChild(playerToken);

    // Change color of voting tokens
    const votingTokens = customPlayerBoard.findChild((child) => child.name === VOTING_TOKENS_NAME) as FrameNode;
    votingTokens.children.forEach((child) => {
        const votingToken = child as InstanceNode;
        const votingTokenFills = clone(votingToken.fills);
        votingTokenFills[0].color = hexToRGB(COLORS_AS_HEX[player.color]);
        votingToken.fills = votingTokenFills;
    });

    return customPlayerBoard;
}

// Move the voting tokens out of the component so they can be easily dragged
const moveVotingTokens = (playerPage, customPlayerBoard) => {
    const votingTokens = customPlayerBoard.findOne((child) => child.name === VOTING_TOKENS_NAME) as FrameNode;
    const votingTokensPosition = votingTokens.absoluteTransform;
    const votingTokensClone = votingTokens.clone();
    votingTokens.visible = false;

    playerPage.appendChild(votingTokensClone);
    votingTokensClone.visible = true;
    votingTokensClone.x = votingTokensPosition[0][2];
    votingTokensClone.y = votingTokensPosition[1][2];
}

// Set up areas on player board to select cards & tokens by dropping them in a frame
function setUpSelectionAreas(playerPage, customPlayerBoard) {
    const cardSelectionArea = figma.createFrame();
    const selectedCard = customPlayerBoard.findChild((child) => child.name === "Selected card") as RectangleNode;
    const cardFills = clone(cardSelectionArea.fills);
    cardFills[0].opacity = 0;
    cardSelectionArea.fills = cardFills;
    cardSelectionArea.name = "Card Selection Area";
    cardSelectionArea.resize(selectedCard.width, selectedCard.height);
    cardSelectionArea.x = selectedCard.absoluteTransform[0][2];
    cardSelectionArea.y = selectedCard.absoluteTransform[1][2];
    playerPage.appendChild(cardSelectionArea);

    const tokenSelectionArea = figma.createFrame();
    const selectedToken = customPlayerBoard.findChild((child) => child.name === "Selected voting token") as RectangleNode;
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
            const randomIndex = Math.floor(Math.random() * availableCards.length)
            const randomImage = availableCards.splice(randomIndex, 1)[0] as RectangleNode;
            randomImage.setPluginData("dealt", "true");
            const newCard = componentsPage.findChild((child) => child.name === "CARD_TEMPLATE").clone();
            const imageFill = { ...newCard.fills[1] };
            imageFill.imageHash = randomImage.fills[0].imageHash;
            const newFills = [newCard.fills[0], imageFill]
            newCard.fills = newFills;
            newCard.name = CARD_NAME;
            playerPage.appendChild(newCard);
            cards.push(newCard);
        }
        cards.sort((a, b) => (a.x - b.x));
        cards.forEach((card, i) => {
            card.x = HAND_X + i * HAND_SPACING;
            card.y = HAND_Y;
        })
    });

}

const moveCardsToGameBoard = () => {
    let cardsToMove = playerNodes.map(node => (
        node.selectedCardArea.findChild((child) => child.name === CARD_NAME) as RectangleNode
    ))

    let allPlayersAreReady = true;
    let shuffledIndices = []
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
    } else {
        figma.notify("Not all players have selected a card.");
    }
}

const moveTokensToGameBoard = () => {
    const tokensToMove = [];
    let allReady = true;
    for (let i = 0; i < playerNodes.length; i++) {
        if (currentStorytellerIndex === i) continue; // storyteller does not vote
        const selectedTokenArea = playerNodes[i].selectedTokenArea;
        const token = selectedTokenArea.findChild((child) => child.name === "Voting Token");
        token.setPluginData("color", players[i].color);
        if (token) {
            tokensToMove.push(token);
        } else {
            allReady = false;
            break;
        }
    }
    if (allReady) {
        tokensToMove.forEach((token, i) => { placeTokenInGameBoard(token, i); });
        gamePhase = PHASES.SCORING;
        updateDocumentStateFromPlugin();
    } else {
        figma.notify("Not all players have voted.");
    }
}

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
}

const placeTokenInGameBoard = (token, i) => {
    const voteIdx = parseInt(token.children[0].characters) - 1;
    token.x = CARDS_X_OFFSET + (voteIdx % 4) * CARDS_COL_WIDTH + (20 * (i % 7));
    token.y = (CARDS_Y_OFFSET + Math.floor(voteIdx / 4) * CARDS_ROW_HEIGHT + (20 * i)) - (80 * Math.floor(i / 7));

    const color = token.getPluginData("color");
    if (color) {
        // Copy in player token from Components Page
        const playerTokensFrame = componentsPage.findChild((child) => child.name === "Player Tokens") as FrameNode;
        const playerToken = playerTokensFrame.findChild((child) => child.name === color).clone();
        playerToken.resize(36, 36);
        playerToken.x = 2;
        playerToken.y = 2;
        token.appendChild(playerToken);
    }

    cardPlayFrame.appendChild(token);
}

const deletePlayerPages = () => {
    figma.root.children.forEach(page => {
        if (page.getPluginData("isPlayerPage") === "true") {
            try {
                page.remove()
            } catch (error) {
                figma.notify(`Could not remove player page: ${page.name} –> Try again or remove manually.`);
                console.log(`Could not remove player page: ${page.name} –> Try again or remove manually.`);
                console.log(error);
            }
        }
    })
}

const clearCardsFromPlayArea = () => {
    cardPlayFrame.children.forEach((child) => {
        if (child.name === CARD_NAME) {
            child.remove();
        }
    });
}

const setupPlayerPiecesOnGameBoard = () => {
    players.forEach(player => {
        addPlayerPiece(player.color)
    });
}

const addPlayerPiece = (color) => {
    const playerPiecesFrame = dixmaBoardPage.findChild((child) => child.name === "Player Pieces") as FrameNode;
    const playerPiece = playerPiecesFrame.findChild((child) => child.name === color).clone();
    dixmaBoardPage.appendChild(playerPiece);
    playerPiece.x += playerPiecesFrame.x;
    playerPiece.y += playerPiecesFrame.y;
}

const resetTokens = () => {
    const tokensOnBoard = cardPlayFrame.findAll((child) => child.name === "Voting Token");
    tokensOnBoard.forEach(token => { token.remove() });

    playerNodes.forEach(node => {
        const page = node.page;
        const VotingTokensFrames = page.findChildren(child => child.name === "Voting Tokens")
        VotingTokensFrames.forEach(frame => { frame.remove() });

        const tokensInUse = page.findAll((child) => child.name === "Voting Token");
        tokensInUse.forEach(token => {
            if (token.parent.type === 'PAGE' || token.parent.visible) {
                token.remove()
            }
        });

        const customPlayerBoard = page.findChild((child) => child.name === "Player Page Template");
        moveVotingTokens(page, customPlayerBoard);
    })
}

const nextStoryteller = (newStoryteller?: number) => {
    if (typeof newStoryteller == 'number') {
        currentStorytellerIndex = newStoryteller;
    } else {
        currentStorytellerIndex = (currentStorytellerIndex + 1) % players.length
    }
    const currColor = players[currentStorytellerIndex].color;
    const storytellerToken = dixmaBoardPage.findOne((child) => child.name === "Storyteller Badge") as TextNode;
    const storytellerIdx = PLAYER_ORDER.indexOf(currColor);
    storytellerToken.y = 102 + 44 * storytellerIdx;
}

const resetDealtCards = () => {
    deckPage.children.forEach((image) => image.setPluginData("dealt", "false"));
}
const clearPlayerPiecesFromBoard = () => {
    const playerPieces = dixmaBoardPage.findChildren(c => (PLAYER_ORDER.indexOf(c.name) > -1))
    playerPieces.forEach(piece => { piece.remove(); })
}
const clearPlayerNames = () => {
    playersFrame.children.forEach((child) => {
        // Ignore instruction text nodes, we only need to look at the players
        if (child.type === "INSTANCE") {
            const playerName = child.findChild(
                (child) => child.name === "player name"
            ) as TextNode;
            figma
                .loadFontAsync({ family: "Roboto Slab", style: "Regular" })
                .then(() => (playerName.characters = EMPTY_PLAYER_STRING));
        }
    });
}

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
}


// RUNS ON LAUNCH - check for game state every second
if (piecesAreReady()) {
    const interval = setInterval(() => {
        updatePluginStateFromDocument()
    }, 1000);
}


// HELPER FUNCTIONS

const hexToRGB = (hex) => {
    const h = (hex.charAt(0) == "#") ? hex.substring(1, 7) : hex;
    return {
        r: parseInt(h.substring(0, 2), 16) / 255,
        g: parseInt(h.substring(2, 4), 16) / 255,
        b: parseInt(h.substring(4, 6), 16) / 255
    }
}

const clone = (value) => {
    return JSON.parse(JSON.stringify(value));
}

const scaleImage = (image, maxWidth, maxHeight) => {
    if (image.width > maxWidth) {
        const newHeight = image.height / (image.width / maxWidth);
        if (newHeight > maxHeight) {
            const newWidth = maxWidth / (newHeight / maxHeight);
            image.resize(newWidth, maxHeight);
        } else {
            image.resize(maxWidth, newHeight);
        }
    }
}

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
        if (
            areObjects && !deepEqual(val1, val2) ||
            !areObjects && val1 !== val2
        ) {
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