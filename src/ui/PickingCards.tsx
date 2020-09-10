import * as React from 'react'

import PlayerRow from './PlayerRow'

const PickingCards = () => {
    return (
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
                <PlayerRow color='red' name='Brett' status='picking-card' />
                <PlayerRow color='gold' name='Brad' status='picking-card' />
                <PlayerRow color='green' name='Bill' status='picking-card' />
                <PlayerRow color='violet' name='Brenda' status='picking-card' />
            </div>

            <div style={{ height: "16px" }}></div>
            <p className="action-status">You can reveal cards when <br /> all players are ready.</p>

            <img src="https://brettlyne.github.io/dixma/icon-settings-button.svg" alt="" className="settings-button" />

        </div>
    );
};

export default PickingCards;

