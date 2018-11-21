import React, { Component } from "react"
import { Grid, Row, Col } from 'react-bootstrap'
import "./App.css"
import "./datetime.css"

import Router from './Router'
import Header from './navigation/Header'
import Sidebar from "./navigation/Sidebar";

class App extends Component {
  render() {
    return (

      <Grid>
        <Row>
          <Header />
        </Row>
        <Row>
          <Col xs={3}>
            <Sidebar />
          </Col>
          <Col>
            <Router />
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default App