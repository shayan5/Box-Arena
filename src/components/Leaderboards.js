import React, { Component } from "react";
import axios from 'axios';
import './Leaderboards.css';

class Leaderboards extends Component {
    constructor(props) {
        super(props);

        this.renderTableRows = this.renderTableRows.bind(this);
        this.fetchScores = this.fetchScores.bind(this);

        this.state = {
            data: [],
            message: null
        }
    }

    componentDidMount() {
        this.fetchScores();
    }

    fetchScores() {
        axios.get('/players/highscores')
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
                {this.state.message}
                <h5>Top 5 Highscores</h5>
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