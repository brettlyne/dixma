import * as React from 'react'
import { useState } from 'react'
import * as ReactDOM from 'react-dom'

import WelcomeScreen from './ui/WelcomeScreen'
import './ui.scss';

const IMG_PATH = "https://brettlyne.github.io/dixma/";
const PHASES = {
    NO_GAME: "no active game",
    PICKING: "players are picking cards",
    VOTING: "players are voting",
    SCORING: "players are moving their tokens on the score tracking board"
}

const App = () => {
    const [gamePhase, setGamePhase] = useState(PHASES.NO_GAME);
    return (
        <div>
            <img src={`${IMG_PATH}dixma-plugin-header-logo.png`} alt="dixma logo" />
            {gamePhase === PHASES.NO_GAME && <WelcomeScreen />}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'))
