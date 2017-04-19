import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-grid-system';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import ListingCard from './ListingCard';

const fabStyle = {
  position: 'fixed',
  bottom: '35px',
  right: '35px',
};

class Listings extends PureComponent {
  static propTypes = {
    listings: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      userId: PropTypes.number,
      price: PropTypes.number,
      status: PropTypes.string,
      expirationDate: PropTypes.number,
      thumbnail: PropTypes.string,
    })).isRequired,
  };

  render() {
    const listings = this.props.listings.map(listing => <ListingCard listing={listing} />);

    return (
      <div>
        <Container className="Listings">
          <Row>
            <Col xs={12}>
              <div className="cardsContainer">
                {listings}
              </div>
            </Col>
          </Row>
        </Container>
        <Link to="/compose">
          <FloatingActionButton style={fabStyle}>
            <ContentAdd />
          </FloatingActionButton>
        </Link>
      </div>
    );
  }
}

export default Listings;
