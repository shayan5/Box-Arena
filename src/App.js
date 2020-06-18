import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route} from "react-router-dom";
import './App.css';

import Login from "./components/Login"
import Register from "./components/Register"
import NavigationBar from "./components/NavigationBar";
import Leaderboards from "./components/Leaderboards";

function App() {
  return (
    <Router>
      <NavigationBar />
      <Route path="/login" component={Login}/>
      <Route path="/leaderboards" component={Leaderboards}/>
      <Route path="/register" component={Register}/>
    </Router>
  );
}

export default App;
