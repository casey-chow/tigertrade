import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  routerPropTypes,
} from 'react-router-dom';

import Waypoint from 'react-waypoint';

import CircularProgress from 'material-ui/CircularProgress';

import SavedSearchesList from '../components/SavedSearchesList';

import { loadSavedSearches } from '../actions/savedSearches';

class SavedSearches extends Component {
  static propTypes = {
    ...routerPropTypes,
    savedSearchesLoading: PropTypes.bool.isRequired,
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
    if (this.props.savedSearchesLoading !== nextProps.savedSearchesLoading) {
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
    return (
      <div>
        <SavedSearchesList savedSearches={this.props.savedSearches} />
        <Waypoint topOffset="70%" onEnter={this.loadMoreSavedSearches} />
        { this.props.savedSearchesLoading &&
          <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <CircularProgress size={80} thickness={8} />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  savedSearchesLoading: state.savedSearchesLoading,
  savedSearches: state.savedSearches,
});

export default withRouter(connect(mapStateToProps)(SavedSearches));
