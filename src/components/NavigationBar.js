import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Navbar, Nav, Button } from "react-bootstrap";
import './NavigationBar.css';

class NavigationBar extends Component {
    render() {
        return (
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Brand href="/">Box Arena</Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="mr-auto">
                        <NavLink activeClassName="active" className="btn btn-link" to="/game">Game</NavLink>
                        <NavLink className="btn btn-link" to="/shop">Shop</NavLink>
                        <NavLink className="btn btn-link" to="/leaderboards">Leaderboards</NavLink>
                    </Nav>
                    <Nav>
                        <NavLink className="btn btn-link" to="/logout">Logout</NavLink>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        );
    }
}

export default NavigationBar;