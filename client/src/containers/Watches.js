import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  routerPropTypes,
} from 'react-router-dom';

import Waypoint from 'react-waypoint';

import WatchesList from '../components/WatchesList';
import LoadingSpinner from '../components/LoadingSpinner';

import { loadWatches } from '../actions/watches';

const mapStateToProps = state => ({
  loading: state.watchesLoading,
  watches: state.watches,
});

@withRouter
@connect(mapStateToProps)
export default class Watches extends Component {
  static propTypes = {
    ...routerPropTypes,
    loading: PropTypes.bool.isRequired,
    watches: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadWatches());
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      this.props.dispatch(loadWatches());
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.loading !== nextProps.loading) {
      return true;
    }

    if (this.props.watches.length !== nextProps.watches.length) {
      return true;
    }

    for (let i = 0; i < this.props.watches.length; i += 1) {
      if (this.props.watches[i].keyId !== nextProps.watches[i].keyId) {
        return true;
      }
    }

    return false;
  }

  loadMoreWatches = () => {
    const limit = 2 * this.props.watches.length;
    this.props.dispatch(loadWatches({ query: { limit } }));
  }

  render() {
    const { watches, loading } = this.props;
    return (
      <div>
        <WatchesList
          watches={watches}
        />
        <Waypoint topOffset="70%" onEnter={this.loadMoreWatches} />
        <LoadingSpinner loading={loading} />
      </div>
    );
  }
}
