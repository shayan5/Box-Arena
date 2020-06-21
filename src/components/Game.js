import React, { Component } from "react";

const client = new WebSocket("ws://www.test.com:4001");

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: ""
        }
    }

    componentDidMount() {
        client.onopen = () => {
            console.log("Connected");
        }

        client.onmessage = (message) => {
            console.log(message);
        }
    }

    componentWillUnmount() {
        client.close();
    }

    render() {
        return(
            <div>
                <h1>Hello world</h1>
                <p>{this.state.message}</p>
            </div>
        );
        
    }
}

export default Game;
