import React, { useState } from "react";
import { Form, Button, FormGroup, FormControl, FormLabel } from "react-bootstrap";
import "./Login.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function validateForm() {
    return username.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault();
    alert(username + password);
  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
        <FormGroup controlId="formBasicLogin">
          <FormLabel>Username</FormLabel>
          <FormControl 
            type="username"
            value={username} 
            placeholder="Enter username"
            autoFocus
            onChange={ e => setUsername(e.target.value) }
            autoComplete="off"
          />
        </FormGroup>

        <FormGroup controlId="formBasicPassword">
          <FormLabel>Password</FormLabel>
          <FormControl 
            type="password" 
            value={password}
            placeholder="Password"
            onChange={ e => setPassword(e.target.value) }
          />
        </FormGroup>

        <Button variant="primary" type="submit" disabled={!validateForm()}>
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default Login;