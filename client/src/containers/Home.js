import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import CircularProgress from 'material-ui/CircularProgress';

import ListingCard from './../components/ListingCard';
import { loadRecentListings } from '../actions/listings';

import './Home.css';

class Home extends Component {
  static propTypes = {
    listingsLoading: PropTypes.bool.isRequired,
    listings: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

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

    const listings = this.props.listings.map((listing) => <ListingCard listing={listing}/>);

    return (
      <Container className="Home">
        <Row>
          <Col xs={12}>
            <div className="cardsContainer">
              {listings}
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return ({
    listingsLoading: state.listingsLoading,
    listings: state.listings,
  });
};

export default connect(mapStateToProps)(Home);
