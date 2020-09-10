import * as React from 'react'

const COLORS_TO_HEX = {
    red: "#FF0000", orange: "#FF800A", gold: "#FFD700", lime: "#BDFF00",
    green: "#008000", turquoise: "#40E0D0", blue: "#0000CD", violet: "#EE82EE",
    purple: "#800080", black: "#000000", silver: "#C0C0C0", white: "#FFFFFF"
};

const COLORS_TO_ANIMALS = {
    red: 'fox', orange: 'llama', gold: 'squirrel', lime: 'rabbit',
    green: 'duck', turquoise: 'raccoon', blue: 'bat', violet: 'flamingo',
    purple: 'hippo', black: 'cat', silver: 'dolphin', white: 'penguin'
}

const STATUS_TO_ICON = {
    'picking-card': 'icon-picking-card@2x.png'
}

const PlayerRow = ({ color, name, status }) => {
    return (
        <div className="player-row">
            <div className="color" style={{ background: COLORS_TO_HEX[color] }}>
                <img src={`https://brettlyne.github.io/dixma/${COLORS_TO_ANIMALS[color]}.svg`} alt="" />
            </div>
            <div className="name">{name}</div>
            <div className="status">
                <img src={`https://brettlyne.github.io/dixma/${STATUS_TO_ICON[status]}`} alt="" />
            </div>
        </div>
    );
};

export default PlayerRow;

