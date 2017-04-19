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

  state = {
    initialLoad: true,
  }

  componentWillMount() {
    const query = this.props.match.params.query;
    this.props.dispatch(searchListings(query));
    this.props.dispatch(setCurrentListingsQuery(query));
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.listingsLoading) {
      this.setState({ initialLoad: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.listingsLoading !== nextProps.listingsLoading) {
      return true;
    }

    if (this.props.listings.length !== nextProps.listings.length) {
      return true;
    }

    for (let i = 0; i < this.props.listings.length; i += 1) {
      if (this.props.listings[i].keyId !== nextProps.listings[i].keyId) {
        return true;
      }
    }

    return false;
  }

  render() {
    if (this.props.listingsLoading && this.state.initialLoad) {
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
