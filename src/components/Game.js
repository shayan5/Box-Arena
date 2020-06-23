import React, { Component } from "react";
import './Game.css';

const wall = require('../icons/wall.png');
const blank = require('../icons/blank.gif');
const monster = require('../icons/monster.png');
const box = require('../icons/box.png');

let client;
const images = {
    "blank": blank,
    "wall": wall,
    "monster": monster,
    "box": box
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.renderTable = this.renderTable.bind(this);
        this.connectToGame = this.connectToGame.bind(this);
        this.disconnectFromGame = this.disconnectFromGame.bind(this);

        this.state = {
            connect: false,
            board: Array(15).fill().map(() => Array(15).fill(null)),
            message: ""
        }
    }


    componentWillUnmount() {
        if (this.state.connect){
            console.log("Disconnected")
            client.close();
        }
    }

    connectToGame() {
        client = new WebSocket("ws://www.test.com:4001"); //TODO fix url
        client.onopen = () => {
            console.log("Connected");
            this.setState({ connect: true });
        }

        client.onclose = (event) => {
            if (!event.wasClean) {
                alert("Connection closed unexpectedly:" + event.code);
            }
            this.setState({ connect: false });
        }

        client.onmessage = (message) => {
            if (message.data) {
                const msg = JSON.parse(message.data);
                let newBoard = this.state.board;
                Object.keys(msg).forEach((key) => {
                    const coordinates = key.split('-');
                    const x = parseInt(coordinates[1]) - 1;
                    const y = parseInt(coordinates[0]) - 1;
                    newBoard[y][x] = msg[key];
                });
                this.setState({ board: newBoard });
            }
        }
    }

    disconnectFromGame() {
        client.close();
        console.log('Disconnected');
        this.setState({ connect: false });
    }

    renderTable() {
        const board = this.state.board;
        return board.map((row, i) => {
            return (<tr key={i}>{row.map((item, j) => {
                return (<td key={j}>
                    <img src={images[item]} className="gameTile" alt=""></img>
                </td>);
            })}</tr>);
        })
    }

    render() {
        if (this.state.connect){
            return(
                <div>
                    <table className="gameTable">
                        <tbody>{this.renderTable()}</tbody>
                    </table>
                    <button onClick={this.disconnectFromGame}>Disconnect</button>
                    <br/>
                    All icons are courtesy of <a href="https://icons8.com/">icons8</a>
                </div>      
            );
        } else {
            return(
                <div>
                    <button onClick={this.connectToGame}>Connect</button>
                </div>
            );
        }       
    }
}

export default Game;
