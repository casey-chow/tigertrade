import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-grid-system';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import CircularProgress from 'material-ui/CircularProgress';

import ListingCard from './../components/ListingCard';
import { loadRecentListings } from '../actions/listings';


import './Home.css';

const fabStyle = {
  position: 'fixed',
  bottom: '35px',
  right: '35px',
};

class Home extends Component {
  static propTypes = {
    listingsLoading: PropTypes.bool.isRequired,
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
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadRecentListings());
  }

  // componentWillReceiveProps(nextProps) {
  //   this.props.dispatch(loadRecentListings());
  // }

  render() {
    if (this.props.listingsLoading) {
      return <CircularProgress size={80} thickness={8} />;
    }

    const listings = this.props.listings.map(listing => <ListingCard listing={listing} />);

    return (
      <div>
        <Container className="Home">
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

const mapStateToProps = state => ({
  listingsLoading: state.listingsLoading,
  listings: state.listings,
});

export default connect(mapStateToProps)(Home);
