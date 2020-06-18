import React, { Component } from "react";
import axios from 'axios';
import './Leaderboards.css';

class Leaderboards extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            message: ''
        }
    }

    componentDidMount() {
        axios.get('http://localhost:4000/players/highscores') //TODO change to relative path
        .then((res) => {
            if (res.data) {
                this.setState({ data: res.data });
            }
            this.makeTable();
        }).catch((err) => {
            if (err.response && err.response.data.message) {
                this.setState({ message: err.response.data.message });
            }
        });
    }

    renderTableRows(data) {
        return data.map((item, index) => (
            <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.username}</td>
                <td>{item.points}</td>
            </tr>
        ));
    }

    render(){
        return(
            <div id="highScores">
                <h1>{this.state.message}</h1>
                <h3>Top 5 Highscores</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>User</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>{this.renderTableRows(this.state.data)}</tbody>
                </table>
            </div>
        );
    }
}

export default Leaderboards;