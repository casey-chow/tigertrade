import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from 'react-grid-system';

import ListingCard from './ListingCard';

class ListingsList extends PureComponent {
  static propTypes = {
    listings: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
    expandAll: PropTypes.bool.isRequired,
  };

  state = {
    openCardId: -1,
  };

  // Reset the open card when new listings are inserted.
  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        openCardId: -1,
      });
    }
  }

  isExpanded = keyId => this.state.openCardId === keyId;

  handleExpandChange = (expanded, keyId) => {
    console.log('handleExpandChange', this);
    if (!expanded) {
      this.setState({ openCardId: -1 });
    } else {
      this.setState({ openCardId: keyId });
    }
  }

  render() {
    return (
      <div>
        <Container className="ListingsList">
          <Row>
            <Col xs={1} />
            <Col xs={10}>
              <div className="cardsContainer">
                {this.props.listings.map(listing =>
                  <ListingCard
                    key={listing.keyId}
                    expanded={this.props.expandAll || this.isExpanded(listing.keyId)}
                    listing={listing}
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

export default ListingsList;
