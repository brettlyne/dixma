import * as React from 'react'
import { useState, useEffect } from 'react'
import * as ReactDOM from 'react-dom'

import WelcomeScreen from './ui/WelcomeScreen'
import PickingCards from './ui/PickingCards'
import Voting from './ui/Voting'
import Scoring from './ui/Scoring'
import './styles.scss';

const PHASES = {
    WAITING: "waiting for updated state after user action",
    NO_GAME: "no active game",
    PICKING: "players are picking cards",
    VOTING: "players are voting",
    SCORING: "players are moving their tokens on the score tracking board"
}

const App = () => {
    const [players, setPlayers] = useState([]);
    const [gamePhase, setGamePhase] = useState(PHASES.WAITING);
    const [currentStorytellerIndex, setCurrentStorytellerIndex] = useState(0);

    useEffect(() => {
        onmessage = (event) => {
            const message = event.data.pluginMessage;
            if (message.type === 'GAME_STATE') {
                updateGameState(message);
            }
        }
    }, [players, gamePhase, currentStorytellerIndex]);

    const updateGameState = (message) => {
        if (gamePhase !== message.gamePhase) {
            setGamePhase(message.gamePhase);
        }
        if (!deepEqual(players, message.players)) {
            setPlayers(message.players);
        }
        if (currentStorytellerIndex !== message.currentStorytellerIndex) {
            setCurrentStorytellerIndex(message.currentStorytellerIndex);
        }
    }

    // perform action that will update state, then wait for new state
    const pluginAction = (action) => {
        parent.postMessage({ pluginMessage: { type: action } }, "*");
        setGamePhase(PHASES.WAITING)
    }

    return (
        <div>
            <img
                style={{ width: '100%' }}
                src={`https://brettlyne.github.io/dixma/dixma-plugin-header-logo.png`} alt="dixma logo"
            />
            {/* <a onClick={() => pluginAction('testing')}>testing</a> */}
            {(gamePhase === PHASES.NO_GAME) &&
                <WelcomeScreen pluginAction={pluginAction} />
            }
            {gamePhase === PHASES.PICKING &&
                <PickingCards players={players} pluginAction={pluginAction} />
            }
            {gamePhase === PHASES.VOTING &&
                <Voting players={players} pluginAction={pluginAction} />
            }
            {gamePhase === PHASES.SCORING &&
                <Scoring players={players} pluginAction={pluginAction} />
            }
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'))


// HELPER FUNCTIONS

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