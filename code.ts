figma.showUI(__html__);
figma.ui.resize(300, 600);

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
            // console.log(players);
            updatePluginStateFromDocument();
            // actual game setup (creating boards, etc.)
        }
    }
    if (msg.type === "delete-pages") {
        deletePlayerPages();
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
    players = newPlayers;
    return true;
}

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
    if (players !== newPlayers) {
        players = newPlayers;
        // TODO populate playerPages
        players.forEach(player => {
            createPlayerPage(player);
        });

    }
}

const createPlayerPage = (player) {
    const playerPage = figma.createPage();
    playerPage.setPluginData('isPlayerPage', 'true');
    playerPage.name = player.name;

    const customPlayerBoard = createPlayerBoard(player);
    playerPage.appendChild(customPlayerBoard);
    customPlayerBoard.locked = true;

    // TODO
    moveVotingTokens(playerPage, customPlayerBoard);
    setUpSelectionAreas(playerPage, customPlayerBoard);
    dealFirstHand(playerPage, customPlayerBoard);

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

const dealFirstHand = (playerPage, customPlayerBoard) => {
    const cardSlots = customPlayerBoard.findAll(
        (child) => child.name === "Card Inner Placeholder"
    );

    for (let i = 0; i < 6; i++) {
        let randomImage = getRandomImage();
        const cardSlot = cardSlots[i] as InstanceNode;
        const cardSlotPosition = cardSlot.absoluteTransform;
        playerPage.appendChild(randomImage);

        // Scale image to fit card slots
        randomImage = scaleImage(randomImage, CARD_SIZE, CARD_SIZE);
        randomImage.x = cardSlotPosition[0][2] + CARD_SLOT_PADDING;
        randomImage.y = cardSlotPosition[1][2] + CARD_SLOT_PADDING;
        randomImage.name = CARD_NAME;
    }
}

const getRandomImage = () => {
    const deckImages = deckPage.children;
    let randomImage = deckImages[
        Math.floor(Math.random() * deckImages.length)
    ] as RectangleNode;
    if (randomImage.getPluginData("dealt") === "true") {
        randomImage = getRandomImage();
    } else {
        randomImage.setPluginData("dealt", "true");
    }
    return randomImage.clone();
}

const deletePlayerPages = () => {
    figma.root.children.forEach(page => {
        if (page.getPluginData("isPlayerPage") === "true") {
            try {
                page.remove()
            } catch (error) {
                figma.notify(`Could not remove player page: ${page.name} –> Try again or remove manually.`);
                console.log(error);
            }
        }
    })
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
    return image;
}