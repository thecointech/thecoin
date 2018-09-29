import React, { Component } from 'react';
import { Navbar, Nav, NavItem, Button, Form, FormControl } from 'react-bootstrap';
import { IndexLinkContainer } from 'react-router-bootstrap'

class Header extends Component {

    render() {
        return (
            <Navbar expand="lg" variant="light" bg="light">
                <Nav variant="pills">
                    <IndexLinkContainer to="/purchases">
                        <NavItem>Purchases</NavItem>
                    </IndexLinkContainer>
                    <IndexLinkContainer to="/sales">
                        <NavItem>Sales</NavItem>
                    </IndexLinkContainer>
                </Nav>
                <Form inline>
                    <FormControl type="text" placeholder="password" className="mr-sm-2" />
                    <Button variant="outline-light">Login</Button>
                </Form>
            </Navbar>);
    }
}
export default Header