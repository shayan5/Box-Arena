import React, { Component } from "react";
import './Game.css';

import GameStats from "./GameStats";
import Chatbox from "./Chatbox";

const wall = require('../icons/wall.png');
const blank = require('../icons/blank.gif');
const monster = require('../icons/monster.png');
const box = require('../icons/box.png');

const defaultArmour = require('../icons/default.png');
const pirate = require('../icons/pirate.png');
const ninja = require('../icons/ninja.png');
const alien = require('../icons/alien.png');
const astronaut = require('../icons/astronaut.png');
const mummy = require('../icons/mummy.png');
const robot = require('../icons/robot.png');
const spy = require('../icons/spy.png');
const wrestler = require('../icons/wrestler.png');


const images = {
    "blank": blank,
    "wall": wall,
    "monster": monster,
    "box": box,
    "default": defaultArmour,
    "pirate": pirate,
    "ninja": ninja,
    "alien": alien,
    "astronaut": astronaut,
    "mummy": mummy,
    "robot": robot,
    "spy": spy,
    "wrestler": wrestler
}

const tileScale = 40;
const boardDimensions = 15;

class Game extends Component {
    constructor(props) {
        super(props);

        this.client = null;
        
        this.canvasRef = React.createRef();

        this.drawCanvas = this.drawCanvas.bind(this);
        this.updateCanvas = this.updateCanvas.bind(this);
        this.updateCanvasTile = this.updateCanvasTile.bind(this);
        this.sendChatMessage = this.sendChatMessage.bind(this);
        this.sendRequestWithMessage = this.sendRequestWithMessage.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.handleKeypress = this.handleKeypress.bind(this);
        this.renderTable = this.renderTable.bind(this);
        this.connectToGame = this.connectToGame.bind(this);
        this.disconnectFromGame = this.disconnectFromGame.bind(this);

        this.state = {
            connect: false,
            board: Array(boardDimensions).fill().map(() => Array(boardDimensions).fill(null)),
            message: "",
            timer: "",
            score: 0,
            numberMonsters: 0,
            chatMessages: []
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
        this.sendRequestWithMessage(request, null);
    }

    sendRequestWithMessage(request, userMessage) {
        this.client.send(JSON.stringify({
            request: request,
            message: userMessage,
            user: this.props.accessToken
        }));
    }

    drawCanvas(board) {
        for (let i = 0; i < boardDimensions; i++) {
            for (let j = 0; j < boardDimensions; j++) {
                const currentTile = board[i][j];
                let image = "blank";
                if (currentTile.type === "player") {
                    image = currentTile.armour;
                } else {
                    image = currentTile.type;
                }
                this.updateCanvasTile(j, i, image);
            }
        }
    }

    updateCanvasTile(x, y, image) {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");
        const newImage = new Image();
        newImage.src = images[image];
        newImage.onload = () => {
            ctx.drawImage(newImage, x * tileScale, y * tileScale, tileScale, tileScale);
        }
    }

    updateCanvas(changes) {
        for (let i = 0; i < changes.length; i++) {
            let image = "blank";
            if (changes[i].type === "player") {
                image = changes[i].armour
            } else {
                image = changes[i].type;
            }
            this.updateCanvasTile(changes[i].x, changes[i].y, image);
        }
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
                if (msg) {
                    if (msg.setup) {
                        this.setState({ 
                            board: msg.setup.world,
                            timer: msg.setup.time,
                            score: msg.setup.score,
                            numberMonsters: msg.setup.numberMonsters 
                        }, () => {
                            this.drawCanvas(msg.setup.world);
                        });
                    } else if (msg.changes) {
                        const newBoard = this.state.board;
                        for (let i = 0; i < msg.changes.length; i++) {
                            newBoard[msg.changes[i].y][msg.changes[i].x] = msg.changes[i];
                        }
                        this.setState({ board: newBoard }, () => {
                            this.updateCanvas(msg.changes);
                        });
                    } else if (msg.chat) {
                        let chats = this.state.chatMessages;
                        if (chats.length === 5) {  
                            chats.shift(); // remove the oldest chat message
                        }  
                        chats.push(msg.chat);
                        this.setState({ chatMessages: chats });
                    } else if (msg.restart) {
                        alert("The match has ended, your final score is : " + msg.restart);
                        this.setState({ chatMessages: [] });
                        
                    } else if (msg.error) {
                        alert(msg.error);
                    } else if (msg.killMonster) {
                        this.setState({
                            score: msg.killMonster.score,
                            numberMonsters: msg.killMonster.numberMonsters
                        });
                    } else if (msg.time) {
                        this.setState({ timer: msg.time });
                    }
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
        this.setState({ 
            connect: false,
            chatMessages: []
        });
        this.sendRequest("logout");
        this.client.close();
        console.log('Disconnected');
    }

    sendChatMessage(message) {
        this.sendRequestWithMessage("chat", message);
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
                    <canvas ref={this.canvasRef} height={640} width={640}/>

        

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
                    <Chatbox 
                        username={this.props.username}
                        chatMessages={this.state.chatMessages}
                        sendChatMessage={this.sendChatMessage}
                    />
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
