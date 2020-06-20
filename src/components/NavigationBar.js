import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import { Navbar, Nav } from "react-bootstrap";

class NavigationBar extends Component {
    render() {
        return (
            <Navbar className="navbar navbar-dark bg-dark">
                <Navbar.Brand to="/leaderboards">Box Arena</Navbar.Brand>
                <Nav className="mr-auto">
                    <NavLink className="btn btn-link" to="/game">Game</NavLink>
                    <NavLink className="btn btn-link" to="/shop">Shop</NavLink>
                    <NavLink className="btn btn-link" to="/leaderboards">Leaderboards</NavLink>
                </Nav>
                <Nav>
                    <NavLink to="/logout">Logout</NavLink>
                </Nav>
            </Navbar>
        );
    }
}

export default NavigationBar;