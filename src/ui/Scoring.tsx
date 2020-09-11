import * as React from 'react'
import { useState } from 'react'

import PlayerRow from './PlayerRow'
import Settings from './Settings'

const Scoring = ({ pluginAction, players }) => {

    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            {settingsOpen &&
                <Settings
                    pluginAction={pluginAction}
                    setSettingsOpen={setSettingsOpen}
                />
            }
            <div className="ui-content">
                <p className="phase-instructions">
                    <strong>Everyone:</strong> move your player piece on the score track
            </p>
                <div style={{ height: "8px" }}></div>

                <div className="table-headers">
                    <p className="header">Players</p>
                    <p className="header">Status</p>
                </div>

                <div className="player-table">
                    {players.map(player => (
                        <PlayerRow
                            key={player.name}
                            color={player.color}
                            name={player.name}
                            status={player.status} />
                    ))}
                </div>

                <div style={{ height: "16px" }}></div>
                <button onClick={() => pluginAction('new-round')} className='centered'>Reset & Begin Next Round</button>
                <img
                    onClick={() => { setSettingsOpen(true) }}
                    src="https://brettlyne.github.io/dixma/icon-settings-button.svg"
                    alt="open settings"
                    className="settings-button"
                />

            </div>
        </>

    );
};

export default Scoring;

