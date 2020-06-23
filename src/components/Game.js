import React, { Component } from "react";

let client;

class Game extends Component {
    constructor(props) {
        super(props);

        this.connectToGame = this.connectToGame.bind(this);
        this.disconnectFromGame = this.disconnectFromGame.bind(this);

        this.state = {
            connect: false,
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
        client = new WebSocket("ws://www.test.com:4001");
        client.onopen = () => {
            console.log("Connected");
        }

        client.onmessage = (message) => {
            console.log(message);
        }
        this.setState({ connect: true });
    }

    disconnectFromGame() {
        client.close();
        console.log('Disconnected');
        this.setState({ connect: false });
    }

    render() {
        if (this.state.connect){
            return(
                <div>
                    <button onClick={this.disconnectFromGame}>Disconnect</button>
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
