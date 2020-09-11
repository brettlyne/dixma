import * as React from 'react'

const Settings = ({ setSettingsOpen, pluginAction }) => {
    return (
        <div className="game-settings">
            <div className="ui-content">
                <p className="header">Reset</p>
                <p>The current game, all pieces, and cards will be reset.</p>
                <p><a onClick={() => pluginAction('reset-game-and-clear-players')} className="destructive">Reset game & clear player names</a></p>
                <p><a onClick={() => pluginAction('reset-game')} className="destructive">Reset game & keep player names</a></p>
                <div style={{ height: '80px' }}></div>
                <p className="header">Manage Players</p>
                <p>Remove a player at any time by deleting their player page.</p>
                <p>To add a new player, add them to the Players List, then click here:</p>
                <p><a>Create player page for new players</a></p>
                <img
                    onClick={() => { setSettingsOpen(false) }}
                    src="https://brettlyne.github.io/dixma/icon-x-button.svg"
                    alt="close settings"
                    className="settings-button"
                />
            </div>
        </div>
    );
};

export default Settings;

