import * as React from 'react'

const WelcomeScreen = ({ pluginAction }) => {

    return (
        <div className="ui-content">
            <div style={{ height: "8px" }}></div>
            <div className="welcome-message">Welcome to Dixma!</div>
            <div style={{ height: "32px" }}></div>
            <p className="header">To get started... </p>
            <ol>
                <li>Duplicate the <a rel="noopener noreferrer" target="_blank" href="https://www.figma.com/community/file/889925301071649823">Dixma Template</a> and invite 4 to 12 players.</li>
                <li>Enter players names where it says “Start Here” on the Dixma Board page.</li>
                <li>Click Start Game below!</li>
            </ol>
            <button onClick={() => pluginAction('start-game')}>Start Game</button>
            <p><a onClick={() => pluginAction('reset-game-and-clear-players')} className="destructive">Reset game & clear player names</a></p>
            <p><a onClick={() => pluginAction('reset-game')} className="destructive">Reset game & keep player names</a></p>
            <div style={{ height: "60px" }}></div>
            <p>You can find the full rules on <br /> the <strong>How to Play page</strong>.</p>
            <p>Share feedback on <a rel="noopener noreferrer" target="_blank" href="https://github.com/brettlyne/dixma/issues">GitHub</a>.</p>
        </div >
    );
};

export default WelcomeScreen;
