import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import CircularProgress from 'material-ui/CircularProgress';

import Listings from '../components/Listings';

import { loadRecentListings } from '../actions/listings';

class RecentListings extends Component {
  static propTypes = {
    listingsLoading: PropTypes.bool.isRequired,
    listings: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadRecentListings());
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
  listings: state.recentListings,
});

export default connect(mapStateToProps)(RecentListings);
