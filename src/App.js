import React from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";
import './App.css';

import Login from "./components/Login"

function App() {
  return (
    <Router>
      <Route path="localhost:4000/users/login" component={Login}/>
    </Router>
  );
}

export default App;
