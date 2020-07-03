import React, { Component } from "react";
import './Game.css';

import GameStats from "./GameStats";

const wall = require('../icons/wall.png');
const blank = require('../icons/blank.gif');
const monster = require('../icons/monster.png');
const box = require('../icons/box.png');
const defaultArmour = require('../icons/default.png');
const pirate = require('../icons/pirate.png');

const images = {
    "blank": blank,
    "wall": wall,
    "monster": monster,
    "box": box,
    "default": defaultArmour,
    "pirate": pirate
}

class Game extends Component {
    constructor(props) {
        super(props);

        this.client = null;

        this.sendRequest = this.sendRequest.bind(this);
        this.handleKeypress = this.handleKeypress.bind(this);
        this.renderTable = this.renderTable.bind(this);
        this.connectToGame = this.connectToGame.bind(this);
        this.disconnectFromGame = this.disconnectFromGame.bind(this);

        this.state = {
            connect: false,
            board: Array(15).fill().map(() => Array(15).fill(null)),
            message: "",
            timer: "",
            score: 0,
            numberMonsters: 0
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeypress);
    }

    componentWillUnmount() {
        if (this.client && this.client.readyState === this.client.OPEN) {
            this.client.close();
            console.log("Disconnected")
        }
        document.removeEventListener('keydown', this.handleKeypress);
    }

    sendRequest(request) {
        this.client.send(JSON.stringify({
            request: request,
            user: this.props.accessToken
        }));
    }

    connectToGame() {
        this.client = new WebSocket("ws://www.test.com:4001"); //TODO fix url
        this.client.onopen = () => {
            console.log("Connected");
            this.setState({ connect: true });
            this.sendRequest("new");
        }

        this.client.onclose = (event) => {
            this.setState({ connect: false });
            if (!event.wasClean) {
                alert("Connection closed unexpectedly: " + event.code);
            }
        }

        this.client.onmessage = (message) => {
            if (message.data) {
                const msg = JSON.parse(message.data);
                if (msg.world){
                    this.setState({ board: msg.world });
                } 
                if (msg.time) {
                    this.setState({ timer: msg.time });
                }
                if (msg.changes) {
                    const newBoard = this.state.board;
                    for (let i = 0; i < msg.changes.length; i++) {
                        newBoard[msg.changes[i].y][msg.changes[i].x] = msg.changes[i];
                    }
                    this.setState({ board: newBoard });
                } 
                if (msg.error) {
                    alert(msg.error);
                }  
                if (msg.score != null) {
                    this.setState({ score: msg.score });
                }
                if (msg.numberMonsters != null) {
                    this.setState({ numberMonsters: msg.numberMonsters });
                }
                if (msg.restart != null) {
                    alert("The match has ended, your final score is : " + msg.restart);
                }
            }
        }
    }

    handleKeypress = function(event) {
        if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
            event.preventDefault();
        }
        if (this.state.connect) {
            switch(event.keyCode) {
                case 37:
                    this.sendRequest("left");
                    break;
                case 38:
                    this.sendRequest("up");
                    break;
                case 39:
                    this.sendRequest("right");
                    break;
                case 40:
                    this.sendRequest("down");
                    break;
                default:
                    break;
            }
        }
    }

    disconnectFromGame() {
        this.setState({ connect: false });
        this.sendRequest("logout");
        this.client.close();
        console.log('Disconnected');
    }

    renderTable() {
        const board = this.state.board;
        return board.map((row, i) => {
            return (<tr key={i}>{row.map((item, j) => {
                if (item == null){
                    return <td key={j}></td>;
                }
                if (item.type === "player") {
                    return (<td key={j}>
                    <img src={images[item.armour]} className="gameTile" alt=""></img>
                     </td>); 
                } else {
                    return (<td key={j}>
                    <img src={images[item.type]} className="gameTile" alt=""></img>
                    </td>);
                } 
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
                    <GameStats 
                        timer={this.state.timer}
                        score={this.state.score}
                        numberMonsters={this.state.numberMonsters}
                    />
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
