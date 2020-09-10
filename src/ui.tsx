import * as React from 'react'
import { useState } from 'react'
import * as ReactDOM from 'react-dom'

import WelcomeScreen from './ui/WelcomeScreen'
import PickingCards from './ui/PickingCards'
import './styles.scss';

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
            <img
                style={{ width: '100%' }}
                src={`https://brettlyne.github.io/dixma/dixma-plugin-header-logo.png`} alt="dixma logo"
            />
            {gamePhase === PHASES.NO_GAME && <WelcomeScreen />}
            {gamePhase === PHASES.PICKING && <PickingCards />}
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('react-page'))
