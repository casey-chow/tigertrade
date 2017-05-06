import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from 'react-grid-system';

import SeekCard from './SeekCard';

export default class SeeksList extends PureComponent {
  static propTypes = {
    seeks: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
    expandAll: PropTypes.bool.isRequired,
  };

  state = {
    openCardId: -1,
  };

  // Reset the open card when new seeks are inserted.
  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        openCardId: -1,
      });
    }
  }

  isExpanded = keyId => this.state.openCardId === keyId;

  handleExpandChange = (expanded, keyId) => {
    if (!expanded) {
      this.setState({ openCardId: -1 });
    } else {
      this.setState({ openCardId: keyId });
    }
  }

  render() {
    return (
      <div>
        <Container className="SeeksList">
          <Row>
            <Col xs={1} />
            <Col xs={10}>
              <div className="cardsContainer">
                {this.props.seeks.map(seek =>
                  <SeekCard
                    key={seek.keyId}
                    expanded={this.props.expandAll || this.isExpanded(seek.keyId)}
                    seek={seek}
                    onExpandChange={this.handleExpandChange}
                  />)}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
