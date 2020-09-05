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

// game state setup
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
    console.log(newPlayers);
    console.log(newGameState);
    console.log(newCurrentStorytellerIndex);
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
    playerPage.name = player.name;

    const customPlayerBoard = createPlayerBoard(player);
    playerPage.appendChild(customPlayerBoard);
    customPlayerBoard.locked = true;

    // TODO
    // moveVotingTokens(playerPage, customPlayerBoard);
    // setUpSelectionAreas(playerPage, customPlayerBoard);
    // dealFirstHand(playerPage, customPlayerBoard);

    return playerPage;
}

function createPlayerBoard(player) {
    const customPlayerBoard = playerPageTemplate.clone();

    // Customize page with player name
    const playerNameElement = customPlayerBoard.findOne((child) => child.name === "Player Name Text") as TextNode;
    figma
        .loadFontAsync({ family: "American Typewriter", style: "Regular" })
        .then(() => (playerNameElement.characters = player.name));

    // TODO
    // Change color of player token 
    // MAYBE INSTEAD OF THIS GRAB DUPLICATE WITH CORRECT ANIMAL FROM COMPONENTS PAGE
    // const playerTokenElement = customPlayerBoard.findOne((child) => child.name === "circle") as RectangleNode;
    // const playerTokenFills = clone(playerTokenElement.fills);
    // playerTokenFills[0].color = COLORS_AS_HEX[player.color];
    // playerTokenElement.fills = playerTokenFills;

    // Change color of voting tokens
    const votingTokens = customPlayerBoard.findChild(
        (child) => child.name === VOTING_TOKENS_NAME
    ) as FrameNode;
    votingTokens.children.forEach((child) => {
        const votingToken = child as InstanceNode;
        const votingTokenFills = clone(votingToken.fills);
        votingTokenFills[0].color = hexToRGB(COLORS_AS_HEX[player.color]);
        votingToken.fills = votingTokenFills;
    });

    return customPlayerBoard;
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

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}