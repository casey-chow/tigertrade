import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import LoadingSpinner from '../components/LoadingSpinner';

import ListContainer from '../components/ListContainer';
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
    listing: PropTypes.shape({
      keyId: PropTypes.number,
    }).isRequired,
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
    const { listing, loading } = this.props;
    return (
      <ListContainer style={{ marginTop: '-1rem' }}>
        <ListingCard expanded singleton listing={listing} />
        <LoadingSpinner loading={loading} />
      </ListContainer>
    );
  }
}
