import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Form, Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import axios from 'axios';
import "./Login.css";

class Login extends Component {
  constructor(props) {
    super(props);

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
    this.setState({ message: "" });
    axios.post('/authentication/login', {
      username: this.state.username,
      password: this.state.password
    }).then((res) => {
      if (res.data){
        this.props.handleLogin(this.state.username, 
          res.data.accessToken, res.data.accessTokenExpiry);
      }
    }).catch((err) => {
      console.log(err);
      if (err.response.data.message) {
        this.setState({ message: err.response.data.message });
      }
    });
  }

  render(){
    return (
      <div className="Login">
        <h5>Sign in</h5>
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
              placeholder="Enter password"
              autoComplete="on"
              onChange={this.onChangePassword}
            />
          </FormGroup>
          <p>{this.state.message}</p>
          <Button variant="primary" type="submit" disabled={!this.validateForm()}>
            Submit
          </Button>
          <br/>
          Need an account? <NavLink to='/register'>Sign up</NavLink>
        </Form>
      </div>
    );
  }
}

export default Login;