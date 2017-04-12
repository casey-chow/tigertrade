import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';

import ListingCard from './../components/ListingCard';
import { loadRecentListings } from './../actions';

import './Home.css';

class Home extends Component {
  static propTypes = {
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
    console.log(this.props.listings);
    if (this.props.isFetching) {
      return <p>Loading...</p>
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
    listings: state.listings,
  });
}

export default connect(mapStateToProps)(Home);
