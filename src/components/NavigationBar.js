import React, { Component } from "react";
import { Navbar, Nav } from "react-bootstrap";

class NavigationBar extends Component {
    render() {
        return (
            <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Navbar.Brand href="#home">Box Arena</Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="/game">Game</Nav.Link>
                    <Nav.Link href="/shop">Shop</Nav.Link>
                    <Nav.Link href="/leaderboards">Leaderboards</Nav.Link>
                </Nav>
                <Nav>
                    <Nav.Link href="/logout">Logout</Nav.Link>
                </Nav>
            </Navbar>
        );
    }
}

export default NavigationBar;