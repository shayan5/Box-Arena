import React, { Component } from "react";
import './Chatbox.css';

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

class Chatbox extends Component {
    constructor(props){
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.keyPress = this.keyPress.bind(this);

        this.state = { 
            message: ""
        };
    }
    
    renderChatMessage(data) {
        return data.map((message, index) => {
            if (message.user === this.props.username){
                return(
                    <div key={index} className="chatContainer darker">
                        <span>
                            <img 
                                src={images[message.armour]} 
                                alt={images["default"]}
                            />
                            <p className="time-right">{new Date(message.time).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="chatMessage"><b>{message.user}</b>: {message.message}</p>
                        </span>
                    </div>
                );
            } else {
                return (
                    <div key={index} className="chatContainer">
                        <span>
                            <img 
                                src={images[message.armour]} 
                                alt={images["default"]}
                            />
                            <p className="time-right">{new Date(message.time).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <p className="chatMessage"><b>{message.user}</b>: {message.message}</p>
                        </span>
                    </div>
                );
            }
        });
    }
    
    handleChange(e) {
        this.setState({ message: e.target.value });
    }

    keyPress(e) {
        if (e.keyCode === 13) { //user presses enter
            this.props.sendChatMessage(this.state.message);
            this.setState({ message: "" });
        }
    }

    handleClick(e) {
        this.props.sendChatMessage(this.state.message);
        this.setState({ message: "" });
    }

    render() {
        return(
            <div className="chatBox">
                {this.renderChatMessage(this.props.chatMessages)}
                <div className="sendBox">
                    <input className="send-text" value={this.state.message} 
                        onChange={this.handleChange} 
                        onKeyDown={this.keyPress}
                        placeholder="Type here..."
                        maxLength="150"
                    /> <button className="send-button" onClick={this.handleClick}>Send</button>
                </div>
            </div>
        );
    }
}

export default Chatbox;