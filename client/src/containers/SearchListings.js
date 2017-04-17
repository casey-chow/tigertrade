import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CircularProgress from 'material-ui/CircularProgress';

import Listings from '../components/Listings';

import { setCurrentListingsQuery, searchListings } from './../actions/listings';

class SearchListings extends Component {
  static propTypes = {
    listingsLoading: PropTypes.bool.isRequired,
    listings: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.shape({
      params: PropTypes.shape({
        query: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  };

  componentWillMount() {
    const query = this.props.match.params.query;
    this.props.dispatch(searchListings(query));
    this.props.dispatch(setCurrentListingsQuery(query));
  }

  render() {
    if (this.props.listingsLoading) {
      return (
        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <CircularProgress size={80} thickness={8} />
        </div>
      );
    }

    return (
      <Listings listings={this.props.listings} />
    );
  }
}

const mapStateToProps = state => ({
  listingsLoading: state.listingsLoading,
  listings: state.searchListings,
});

export default withRouter(connect(mapStateToProps)(SearchListings));
