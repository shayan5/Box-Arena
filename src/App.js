import React, { Component } from 'react';
import axios from 'axios';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";
import './App.css';

import Login from "./components/Login";
import Register from "./components/Register";
import NavigationBar from "./components/NavigationBar";
import Leaderboards from "./components/Leaderboards";
import Game from "./components/Game";
import Shop from "./components/Shop";
import GenericNotFound from "./components/GenericNotFound";
import Footer from "./components/Footer";

class App extends Component { //TODO move to components folder
  constructor(props) {
    super(props);

    this.getRouterPaths = this.getRouterPaths.bind(this);
    this.getTimeToRenewToken = this.getTimeToRenewToken.bind(this);
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
    const renewTokenTime = this.getTimeToRenewToken(accessTokenExpiry); 
    setTimeout(() => {this.silentRefresh();}, renewTokenTime);
  }

  /***
   * This function calculates the amount of time left (in milliseconds) until
   * the access token expires. It then subtracts 5 minutes from the total time 
   * left so that there is a 5 minute buffer during which we can renew the
   * the access token without a disruption in.
  ***/
  getTimeToRenewToken(expiry) {
    return (new Date(expiry) - new Date().getTime() - (5 * 60)) * 1000; // includes 5min buffer
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
    this.silentRefresh();
  }

  silentRefresh() {
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
        const renewTokenTime = this.getTimeToRenewToken(res.data.accessTokenExpiry);
        setTimeout(() => {this.silentRefresh();}, renewTokenTime);
      } else {
        this.setState({        
          authenticated: false,
          username: "",
          accessToken: "",
          accessTokenExpiry: "" 
        });
      }
    }).catch((err) => {
      this.setState({        
        authenticated: false,
        username: "",
        accessToken: "",
        accessTokenExpiry: "" 
      });
    });
  }

  getRouterPaths () {
    if (this.state.authenticated) {
      return (
        <Switch>
          <Route path="/login" render={() => (
            <Redirect to="/game" />
          )}/>
          <Route path="/register" render={() => (
            <Redirect to="/game" />
          )}/>
          <Route path="/leaderboards" component={Leaderboards}/>
          <Route path="/logout" render={() => {this.handleLogout();}}/>
          <Route path="/game" render={() => (
              <Game 
                accessToken={this.state.accessToken}
                username={this.state.username}
              />
            )}
          />
          <Route path="/shop" render={() => (
              <Shop 
                accessToken={this.state.accessToken}
                username={this.state.username}
              />
            )}
          />
          <Route component={GenericNotFound} />
        </Switch>
      );
    } else {
      return (
        <Switch>
          <Route exact path="/" render={() => (
            <Redirect to="/login" />
          )}/>
          <Route path="/login" render={() => (<Login handleLogin={this.handleLogin}/>)} />
          <Route path="/register" component={Register}/>
          <Route component={GenericNotFound} />
        </Switch>
      );
    }
  }

  render() {
    return (
      <Router>
        <NavigationBar authenticated={this.state.authenticated}/>
        {this.getRouterPaths()}
        <Footer/>
      </Router>
    );
  }
}

export default App;
