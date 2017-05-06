import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  routerPropTypes,
} from 'react-router-dom';

import Waypoint from 'react-waypoint';

import SavedSearchesList from '../components/SavedSearchesList';
import LoadingSpinner from '../components/LoadingSpinner';

import { loadSavedSearches } from '../actions/savedSearches';

class SavedSearches extends Component {
  static propTypes = {
    ...routerPropTypes,
    loading: PropTypes.bool.isRequired,
    savedSearches: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadSavedSearches());
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      this.props.dispatch(loadSavedSearches());
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.expandAll !== nextProps.expandAll) {
      return true;
    }

    if (this.props.loading !== nextProps.loading) {
      return true;
    }

    if (this.props.savedSearches.length !== nextProps.savedSearches.length) {
      return true;
    }

    for (let i = 0; i < this.props.savedSearches.length; i += 1) {
      if (this.props.savedSearches[i].keyId !== nextProps.savedSearches[i].keyId) {
        return true;
      }
    }

    return false;
  }

  loadMoreSavedSearchs = () => {
    const limit = 2 * this.props.savedSearches.length;
    this.props.dispatch(loadSavedSearches({ query: { limit } }));
  }

  render() {
    const { savedSearches, expandAll, loading } = this.props;
    return (
      <div>
        <SavedSearchesList
          savedSearches={savedSearches}
          expandAll={expandAll}
        />
        <Waypoint topOffset="70%" onEnter={this.loadMoreSavedSearches} />
        <LoadingSpinner loading={loading} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.savedSearchesLoading,
  savedSearches: state.savedSearches,
  expandAll: state.expandAll,
});

export default withRouter(connect(mapStateToProps)(SavedSearches));
