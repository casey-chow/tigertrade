import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-grid-system';

export default class MaxRowContainer extends PureComponent {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
  }

  render() {
    return (
      <Container>
        <Row>
          <Col xs={12}>
            {this.props.children}
          </Col>
        </Row>
      </Container>
    );
  }
}
