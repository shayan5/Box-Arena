import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route} from "react-router-dom";
import './App.css';

import Login from "./components/Login"

function App() {
  return (
    <Router>
      <Route path="/" component={Login}/>
    </Router>
  );
}

export default App;
