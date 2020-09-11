import * as React from 'react'

const WelcomeScreen = ({ pluginAction }) => {

    return (
        <div className="ui-content">
            <div style={{ height: "8px" }}></div>
            <div className="welcome-message">Welcome to Dixma!</div>
            <div style={{ height: "32px" }}></div>
            <p className="header">To get started... </p>
            <ol>
                <li>Duplicate the <a href="">Dixma Board</a> and invite 4 to 12 players.</li>
                <li>Enter players names where it says “Start Here” on the Dixma Board page + have each player move their bunny to scoring track.</li>
                <li>Click Start Game below!</li>
            </ol>
            <button onClick={() => pluginAction('start-game')}>Start Game</button>
            <p><a onClick={() => pluginAction('reset-game-and-clear-players')} className="destructive">Reset game & clear player names</a></p>
            <p><a onClick={() => pluginAction('reset-game')} className="destructive">Reset game & keep player names</a></p>
            <div style={{ height: "40px" }}></div>
            <p>You can find the full rules on <br /> the <strong>How to Play page</strong>
                {/* of the <br /> <a>Dixma Board Community File</a>. */}
            .</p>
        </div>
    );
};

export default WelcomeScreen;
