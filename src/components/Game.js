import React, { Component } from "react";
import './Game.css';

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

        this.handleKeypress = this.handleKeypress.bind(this);
        this.renderTable = this.renderTable.bind(this);
        this.connectToGame = this.connectToGame.bind(this);
        this.disconnectFromGame = this.disconnectFromGame.bind(this);

        this.state = {
            connect: false,
            board: Array(15).fill().map(() => Array(15).fill(null)),
            message: ""
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

    connectToGame() {
        this.client = new WebSocket("ws://www.test.com:4001"); //TODO fix url
        this.client.onopen = () => {
            console.log("Connected");
            this.setState({ connect: true });
            this.client.send(JSON.stringify({
                request: "new",
                user: this.props.accessToken
            }));
        }

        this.client.onclose = (event) => {
            this.setState({ connect: false });
            if (!event.wasClean) {
                alert("Connection closed unexpectedly:" + event.code);
            }
        }

        this.client.onmessage = (message) => {
            if (message.data) {
                const msg = JSON.parse(message.data);
                if (msg.world){
                    this.setState({ board: msg.world });
                } else if (msg.changes) {
                    const newBoard = this.state.board;
                    for (let i = 0; i < msg.changes.length; i++) {
                        newBoard[msg.changes[i].y][msg.changes[i].x] = msg.changes[i].type;
                    }
                    this.setState({ board: newBoard });
                } else if (msg.error) {
                    alert(msg.error);
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
                    alert("left");
                    break;
                case 38:
                    alert("up");
                    break;
                case 39:
                    alert("right");
                    break;
                case 40:
                    alert("down");
                    break;
                default:
                    break;
            }
        }
    }

    disconnectFromGame() {
        this.setState({ connect: false });
        this.client.send(JSON.stringify({
            request: "logout",
            user: this.props.accessToken
        }));
        this.client.close();
        console.log('Disconnected');
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
