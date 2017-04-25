import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CircularProgress from 'material-ui/CircularProgress';

import SavedSearchesList from '../components/SavedSearchesList';

import { loadSavedSearches } from '../actions/savedSearches';

class SavedSearches extends Component {
  static propTypes = {
    savedSearchesLoading: PropTypes.bool.isRequired,
    savedSearches: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  state = {
    initialLoad: true,
  }

  componentWillMount() {
    this.props.dispatch(loadSavedSearches());
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.savedSearchesLoading) {
      this.setState({ initialLoad: false });
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
    if (this.props.savedSearchesLoading && this.state.initialLoad) {
      return (
        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <CircularProgress size={80} thickness={8} />
        </div>
      );
    }

    return (
      <SavedSearchesList savedSearches={this.props.savedSearches} />
    );
  }
}

const mapStateToProps = state => ({
  savedSearchesLoading: state.savedSearchesLoading,
  savedSearches: state.savedSearches,
});

export default withRouter(connect(mapStateToProps)(SavedSearches));
