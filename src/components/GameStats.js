import React, { Component } from "react";
import './GameStats.css';

class GameStats extends Component {
    render() {
        return (
            <div id="gameTimer" className="container">
                Time remaining: {Math.floor(this.props.timer / 60)} minutes {this.props.timer % 60} seconds
                <br/>
                Monsters remaining: {this.props.numberMonsters}
                <br/>
                Score: {this.props.score}
            </div>
        );
    }
}

export default GameStats;