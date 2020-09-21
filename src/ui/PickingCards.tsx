import * as React from 'react'
import { useState } from 'react'

import PlayerRow from './PlayerRow'
import Settings from './Settings'

const PickingCards = ({ pluginAction, players }) => {

    const [settingsOpen, setSettingsOpen] = useState(false);

    let allPlayersReady = true;
    for (let i = 0; i < players.length; i++) {
        if (players[i].status.indexOf('picking-card') >= 0) {
            allPlayersReady = false;
            break;
        }
    }

    return (
        <>
            {settingsOpen &&
                <Settings
                    pluginAction={pluginAction}
                    players={players}
                    setSettingsOpen={setSettingsOpen}
                />
            }
            <div className="ui-content">
                <p className="phase-instructions">
                    <strong>Storyteller:</strong> give a clue <br />
                    <strong>Everyone:</strong> pick a card
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
                {allPlayersReady ?
                    <button onClick={() => pluginAction('reveal-cards')} className='centered'>Reveal Cards</button> :
                    <p className="action-status">You can reveal cards when <br /> all players are ready.</p>
                }

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

export default PickingCards;

