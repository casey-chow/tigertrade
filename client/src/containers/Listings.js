import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CircularProgress from 'material-ui/CircularProgress';
import { parse } from 'query-string';

import ListingsList from '../components/ListingsList';

import { loadListings } from './../actions/listings';

class Listings extends Component {
  static propTypes = {
    listingsLoading: PropTypes.bool.isRequired,
    listings: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
  };

  componentWillMount() {
    const query = {
      query: parse(this.props.location.search).query || '',
    };
    this.props.dispatch(loadListings(query));
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
    return (
      <div>
        <ListingsList listings={this.props.listings} />
        { this.props.listingsLoading &&
          <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <CircularProgress size={80} thickness={8} />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  listingsLoading: state.listingsLoading,
  listings: state.listings,
});

export default withRouter(connect(mapStateToProps)(Listings));
