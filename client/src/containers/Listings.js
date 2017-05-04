import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import Waypoint from 'react-waypoint';

import CircularProgress from 'material-ui/CircularProgress';
import { parse } from 'query-string';

import ListingsList from '../components/ListingsList';

import { loadListings } from './../actions/listings';

class Listings extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    listingsLoading: PropTypes.bool.isRequired,
    listings: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  componentWillMount() {
    const query = this.getQuery(this.props);
    this.props.dispatch(loadListings({ query, reset: true }));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      const query = this.getQuery(nextProps);
      this.props.dispatch(loadListings({ query, reset: true }));
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

  getQuery = (props) => {
    const query = {
      query: parse(props.location.search).query || '',
    };

    if (props.match.params.type === 'mine') {
      query.isMine = true;
    }

    return query;
  }

  loadMoreListings = () => {
    const offset = this.props.listings.length;
    this.props.dispatch(loadListings({ query: { offset }, concat: true }));
  }

  render() {
    return (
      <div>
        <ListingsList listings={this.props.listings} />
        <Waypoint onEnter={this.loadMoreListings} />
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
