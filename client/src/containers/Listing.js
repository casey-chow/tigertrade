import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import { Container, Row, Col } from 'react-grid-system';
import LoadingSpinner from '../components/LoadingSpinner';

import ListingCard from '../components/ListingCard';

import { loadListing } from './../actions/listings';


const mapStateToProps = state => ({
  loading: state.listingLoading,
  listing: state.listing,
});

@withRouter
@connect(mapStateToProps)
export default class Listing extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    listings: PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadListing(this.props.match.params.id));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.props.dispatch(loadListing(nextProps.match.params.id));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.loading !== nextProps.loading) {
      return true;
    }

    if (this.props.listing.keyId !== nextProps.listing.keyId) {
      return true;
    }

    return false;
  }

  render() {
    const { listing, listingsLoading } = this.props;
    return (
      <Container className="ListingsList">
        <Row>
          <Col xs={1} />
          <Col xs={10} style={{ marginTop: '-1rem' }}>
            <ListingCard expanded listing={listing} />
            <LoadingSpinner loading={listingsLoading} />
          </Col>
        </Row>
      </Container>
    );
  }
}
