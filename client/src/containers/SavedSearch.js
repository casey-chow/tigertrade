import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import CircularProgress from 'material-ui/CircularProgress';

import SavedSearchesList from '../components/SavedSearchesList';

import { loadSavedSearch } from '../actions/savedSearches';

class SavedSearch extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    savedSearchesLoading: PropTypes.bool.isRequired,
    savedSearches: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadSavedSearch(this.props.match.params.id));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      this.props.dispatch(loadSavedSearch(this.props.match.params.id));
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

  render() {
    return (
      <div>
        <SavedSearchesList seeks={this.props.seeks} />
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

export default withRouter(connect(mapStateToProps)(SavedSearch));
