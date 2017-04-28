import React, { PureComponent } from 'react';
import Paper from 'material-ui/Paper';
import RaisedButton from 'material-ui/RaisedButton';
import { Container, Row, Col } from 'react-grid-system';

import './Welcome.css';

import { redirectToCas } from '../helpers/cas';

export default class Welcome extends PureComponent {
  render() {
    return (
      <Container>
        <Row>
          <Col xs={1} />
          <Col xs={10}>
            <Paper className="container">
              <h1>Welcome to Tigertrade!</h1>
              <p>
                TigerTrade is a place for the Princeton community to buy and share items.
                Please log in to get started!
              </p>
              <RaisedButton label="Log In" primary fullWidth onClick={redirectToCas} />
            </Paper>
          </Col>
        </Row>
      </Container>
    );
  }
}
