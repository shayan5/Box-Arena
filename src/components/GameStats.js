import React, { Component } from "react";
import './GameStats.css';

class GameStats extends Component {
    render() {
        return (
            <div className="gameStats">
                <h5>Stats</h5>
                <table>
                    <tbody>
                        <tr>
                            <td>Time left</td><td>{Math.floor(this.props.timer / 60)} min {this.props.timer % 60} sec</td>
                        </tr>
                        <tr>
                            <td>Monsters left</td><td>{this.props.numberMonsters}</td>
                        </tr>
                        <tr>
                            <td>Score</td><td>{this.props.score}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default GameStats;