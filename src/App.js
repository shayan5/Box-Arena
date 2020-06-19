import React, { Component } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import './App.css';

import Login from "./components/Login"
import Register from "./components/Register"
import NavigationBar from "./components/NavigationBar";
import Leaderboards from "./components/Leaderboards";

class App extends Component { //TODO move to components folder
  constructor(props) {
    super(props);

    this.silentRefresh = this.silentRefresh.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);

    this.state = {
      authenticated: false,
      username: "",
      accessToken: "",
      accessTokenExpiry: ""
    }
  }

  handleLogin(username, accessToken, accessTokenExpiry) {
    this.setState({
      authenticated: true,
      username: username,
      accessToken: accessToken,
      accessTokenExpiry: accessTokenExpiry
    });
  }

  handleLogout() {
    //axios.defaults.withCredentials = true;
    const token = "Bearer " + this.state.accessToken;
    axios.post('http://www.test.com:4000/authentication/logout', {}, {
      headers: { 'Authorization': token }
    }) //TODO change to relative path
    .then(() => {
      this.setState({ 
        authenticated: false,
        username: "",
        accessToken: "",
        accessTokenExpiry: "" 
      });
      window.location.href = '/';
    }).catch((err) => {
      console.log(err);
    });
  }

  componentDidMount(){
    console.log('mounting');
    setInterval(() => {
      axios.defaults.withCredentials = true;
      axios.post('http://www.test.com:4000/authentication/refresh-token', {}, { withCredentials: true }) //TODO change to relative path
      .then((res) => {
        if (res.status === 200) {
          this.setState({ 
            authenticated: true,
            accessToken: res.data.accessToken,
            username: res.data.username,
            accessTokenExpiry: res.data.accessTokenExpiry
          });
        } else {
          this.setState({ authenticated: false });
        }
      }).catch((err) => {
        console.log(err);
        this.setState({ authenticated: false });
        window.location.href = '/login';
      });
    }, 60*1000);
    
    
    //this.silentRefresh();
  }

  silentRefresh = () => {
    //console.log('refresh is called');
    axios.defaults.withCredentials = true;
    axios.post('http://www.test.com:4000/authentication/refresh-token', {}, { withCredentials: true }) //TODO change to relative path
    .then((res) => {
      if (res.status === 200) {
        this.setState({ 
          authenticated: true,
          accessToken: res.data.accessToken,
          username: res.data.username,
          accessTokenExpiry: res.data.accessTokenExpiry
        });
      } else {
        this.setState({ authenticated: false });
      }
    }).catch((err) => {
      console.log(err);
      this.setState({ authenticated: false });
      //window.location.href = '/login';
    });
  }

  render() {
    if (this.state.authenticated){
      return (
        <Router>
          <NavigationBar />
          <Route path="/leaderboards" component={Leaderboards}/>
          <Route path="/logout" render={() => {this.handleLogout();}}/>
        </Router>
      );
    } else {
      return (
        <Router>
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          <Route path="/login" render={() => (<Login handleLogin={this.handleLogin}/>)} />
          <Route path="/register" component={Register}/>
        </Router>
      );
    }
  }
}

export default App;
