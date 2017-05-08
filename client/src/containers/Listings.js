import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';
import { parse } from 'query-string';

import Waypoint from 'react-waypoint';

import ListingsList from '../components/ListingsList';
import LoadingSpinner from '../components/LoadingSpinner';

import { loadListings } from './../actions/listings';

const mapStateToProps = state => ({
  listingsLoading: state.listingsLoading,
  listings: state.listings,
  expandAll: state.expandAll,
});

@withRouter
@connect(mapStateToProps)
export default class Listings extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    expandAll: PropTypes.bool.isRequired,
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
    if (this.props.expandAll !== nextProps.expandAll) {
      return true;
    }
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
    const limit = 2 * this.props.listings.length;
    this.props.dispatch(loadListings({ query: { limit } }));
  }

  render() {
    const { listings, listingsLoading, expandAll } = this.props;
    return (
      <div>
        <ListingsList
          listings={listings}
          expandAll={expandAll}
        />
        <Waypoint topOffset="70%" bottomOffset="-25%" onEnter={this.loadMoreListings} />
        <LoadingSpinner loading={listingsLoading} />
      </div>
    );
  }
}
