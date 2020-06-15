import React, { Component } from "react";
import { Form, Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import axios from 'axios';
import "./Login.css";

class Login extends Component {
  constructor(props) {
    super(props)

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username:'',
      password:'',
      message:''
    }
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangePassword(e) {
    this.setState({
      password: e.target.value
    });
  }

  validateForm() {
    if (this.state.username == null || this.state.password == null) {
      return false;
    }
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  onSubmit(event) {
    event.preventDefault();
    axios.post('http://localhost:4000/players/login', { //TODO change to relative path for prod
      username: this.state.username,
      password: this.state.password
    }).then((res) => {
      alert(res);
    }).catch((err) => {
      if (err.response && err.response.status === 401) {
        this.setState({
          message: "Incorrect username or password."
        });
      } else {
        this.setState({
          message: "Something went wrong. Please try again later."
        });
      } 
    });
  }

  render(){
    return (
      <div className="Login">
        <Form onSubmit={this.onSubmit}>
          <FormGroup controlId="formBasicLogin">
            <FormLabel>Username</FormLabel>
            <FormControl 
              type="username"
              value={this.state.username} 
              placeholder="Enter username"
              autoFocus
              onChange={this.onChangeUsername}
              autoComplete="off"
            />
          </FormGroup>
          <FormGroup controlId="formBasicPassword">
            <FormLabel>Password</FormLabel>
            <FormControl 
              type="password" 
              value={this.state.password}
              placeholder="Password"
              onChange={this.onChangePassword}
            />
          </FormGroup>
          <p>{this.state.message}</p>
          <Button variant="primary" type="submit" disabled={!this.validateForm()}>
            Submit
          </Button>
        </Form>
      </div>
    );
  }
}

export default Login;