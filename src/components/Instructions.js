import React from 'react';
import './Instructions.css';

const trappedMonster = require('../icons/trapmonster.gif');

function Instructions() {
    return (
        <div className="instructionsDiv">
            <h6>Objective</h6>
            <p>Work together with other players to <b>eliminate the 
            monsters</b>.</p>
            <p> Use the boxes available throughout the arena to <b>trap the monsters</b> (as shown in the image below).
            Trapped monsters will be eliminated.</p>
            <img className="surroundImg responsive" src={trappedMonster} alt=""></img>
            <h6>Controls</h6>
            <p>Use the <b>arrow keys</b> to move your character around.</p>
            <h6>Tips</h6>
            <p>Use the chatbox to coordinate with other players.</p>
            <p>Take advantage of being able to push multiple boxes at once.</p>
            <p>Eliminate all of the monsters for bonus points (keep an eye on the timer).</p>
        </div>
    );
}

export default Instructions;