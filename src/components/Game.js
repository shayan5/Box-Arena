import React, { Component } from "react";
import { Button } from "react-bootstrap";
import './Game.css';

import GameStats from "./GameStats";
import Chatbox from "./Chatbox";
import Footer from "./Footer";

const wall = require('../icons/wall.png');
const blank = require('../icons/blank.png');
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

const boardDimensions = 15; 
const maxChatMessagesDisplayed = 5;
let resizeTimer;

class Game extends Component {
    constructor(props) {
        super(props);

        this.client = null;
        
        this.gameBoardRef = React.createRef();
        this.canvasRef = React.createRef();

        this.drawCanvas = this.drawCanvas.bind(this);
        this.updateCanvas = this.updateCanvas.bind(this);
        this.updateCanvasTile = this.updateCanvasTile.bind(this);
        this.sendChatMessage = this.sendChatMessage.bind(this);
        this.sendRequestWithMessage = this.sendRequestWithMessage.bind(this);
        this.sendRequest = this.sendRequest.bind(this);
        this.handleKeypress = this.handleKeypress.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.connectToGame = this.connectToGame.bind(this);
        this.disconnectFromGame = this.disconnectFromGame.bind(this);

        this.state = {
            connect: false,
            board: Array(boardDimensions).fill().map(() => Array(boardDimensions).fill(null)),
            message: "",
            timer: "",
            score: 0,
            numberMonsters: 0,
            chatMessages: [],
            height: "",
            width: ""
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeypress);
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        if (this.client && this.client.readyState === this.client.OPEN) {
            this.client.close();
            console.log("Disconnected")
        }
        document.removeEventListener('keydown', this.handleKeypress);
        window.removeEventListener('resize', this.handleResize);
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
        const gameBoard = this.gameBoardRef.current;
        if (gameBoard != null) {
            this.setState({
                height: gameBoard.clientHeight,
                width: gameBoard.clientWidth
            }, () => {
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
            })
        }
    }

    updateCanvasTile(x, y, image) {
        const canvas = this.canvasRef.current;
        const ctx = canvas.getContext("2d");
        const newImage = new Image();
        const tileScaleX = this.state.width / boardDimensions;
        const tileScaleY = this.state.height / boardDimensions;
        newImage.src = images[image];
        newImage.onload = () => {
            ctx.clearRect(x * tileScaleX, y * tileScaleY, tileScaleX, tileScaleY);
            ctx.drawImage(newImage, x * tileScaleX, y * tileScaleY, tileScaleX, tileScaleY);
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
                        if (chats.length === maxChatMessagesDisplayed) {  
                            chats.shift(); // remove the oldest chat message
                        }  
                        chats.push(msg.chat);
                        this.setState({ chatMessages: chats });
                    } else if (msg.restart != null) {
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

    handleResize = function(){
        //waits for resize event to finish before updating the board
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            this.drawCanvas(this.state.board);
        }, 150);

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
        if (message !== "") {
            this.sendRequestWithMessage("chat", message);
        }
    }

    render() {
        if (this.state.connect){
            return(
                <div>
                    <div className="gameScreen">
                        <div className="gameBoard" ref={this.gameBoardRef}>
                            <canvas 
                                ref={this.canvasRef}
                                height={this.state.height}
                                width={this.state.width}
                            />
                        </div>
                        <div className="gamePanel">
                            <div className="infoContainer">
                                <div className="disconnectBtn">
                                    <Button variant="danger" onClick={this.disconnectFromGame}>Disconnect</Button>
                                </div>
                                <div className="gameInfo">
                                    <GameStats 
                                        timer={this.state.timer}
                                        score={this.state.score}
                                        numberMonsters={this.state.numberMonsters}
                                    />
                                </div>
                            </div>
                            <div className="chatboxContainer">
                                <Chatbox 
                                    username={this.props.username}
                                    chatMessages={this.state.chatMessages}
                                    sendChatMessage={this.sendChatMessage}
                                />
                            </div>
                        </div>
                    </div>
                    <br/>
                    <Footer/>
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
