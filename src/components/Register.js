import React, { Component } from "react";
import { Form, Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import axios from 'axios';
import "./Register.css";

class Register extends Component {
    constructor(props) {
        super(props);


        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);
        this.onChangeConfirmPassword = this.onChangeConfirmPassword.bind(this);
        this.checkPasswordSame = this.checkPasswordSame.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            username:'',
            password:'',
            confirmPassword:'',
            message:''
        }
    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({ message: "" });
        axios.post('http://localhost:4000/authentication/register', { //TODO change to relative path
            username: this.state.username,
            password: this.state.password,
            confirmPassword: this.state.confirmPassword
        }).then((res) => {
            console.log(res);
            if (res.data.message) {
                this.setState({ message: res.data.message });
            }
        }).catch((err) => {
            this.setState({
                message: "Something went wrong. Please try again later."
            });
        });
    }

    onChangeConfirmPassword(e) {
        this.setState({
            confirmPassword: e.target.value
        });
        this.checkPasswordSame(e.target.value, this.state.password);
    }

    onChangePassword(e) {
        this.setState({
            password: e.target.value
        });
        this.checkPasswordSame(e.target.value, this.state.confirmPassword);
    }

    checkPasswordSame(p1, p2) {
        if (p1.length > 0 && 
            p2.length > 0 &&
            p1 !== p2){
            this.setState({
                message: "Passwords do not match"
            });
        } else {
            this.setState({
                message: ""
            });
        }
    }

    onChangeUsername(e) {
        const newUsername = e.target.value;
        if (newUsername.length < 3) {
            this.setState({
                username: newUsername,
                message: "Username must be at least 3 characters"
            });
        } else {
            this.setState({
                username: newUsername,
                message: ""
            });
        }
    }

    validateForm() {
        return this.state.username.length >= 3 && 
            this.state.password.length > 0 &&
            this.state.password === this.state.confirmPassword
    }

    render() {
        return (
            <div className="Register">
                <h5>Sign up</h5>
                <Form onSubmit={this.onSubmit}>
                    <FormGroup>
                        <FormLabel>Username</FormLabel>
                        <FormControl
                            type="username"
                            placeholder="Pick a username"
                            autoFocus
                            autoComplete="off"
                            onChange={this.onChangeUsername}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Password</FormLabel>
                        <FormControl 
                            type="password"
                            placeholder="Password"
                            autoComplete="on"
                            onChange={this.onChangePassword}
                        />
                    </FormGroup>
                    <FormGroup>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl
                            type="password"
                            placeholder="Re-enter your password"
                            autoComplete="on"
                            onChange={this.onChangeConfirmPassword}
                        />
                    </FormGroup>
                    <p>{this.state.message}</p>
                    <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={!this.validateForm()}>
                        Submit
                    </Button>
                    <br/>
                    Already have an account? <a href="/login">Sign in</a>
                </Form>
            </div>
        );
    }
}

export default Register