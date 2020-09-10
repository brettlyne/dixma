import * as React from 'react'

const WelcomeScreen = () => {
    return (
        <div className="ui-content">
            <div style={{ height: "8px" }}></div>
            <div className="welcome-message">Welcome to Dixma!</div>
            <div style={{ height: "32px" }}></div>
            <p className="header">To get started... </p>
            <ol>
                <li>Duplicate the <a href="javascript:">Dixma Board</a> and invite 4 to 12 players.</li>
                <li>Enter players names where it says “Start Here” on the Dixma Board page + have each player move their bunny to scoring track.</li>
                <li>Click Start Game below!</li>
            </ol>
            <button>Start Game</button>
            <p><a href=":javascript" className="destructive">Reset game & clear player names</a></p>
            <p><a href=":javascript" className="destructive">Reset game & leave player names</a></p>
            <div style={{ height: "64px" }}></div>
            <p>You can find the full rules on <br /> the How to Play page of the <br /> <a href="">Dixma Board Community File</a>.</p>
        </div>
    );
};

export default WelcomeScreen;

