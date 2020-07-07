import React, { Component } from "react";
import './GameStats.css';

class GameStats extends Component {
    render() {
        return (
            <div className="gameTimer">
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