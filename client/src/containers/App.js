import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import ActionBar from '../components/ActionBar';
import Welcome from '../components/Welcome';

import Compose from './Compose';
import Listings from './Listings';
import Seeks from './Seeks';
import SavedSearches from './SavedSearches';
import Profile from './Profile';
import ComposeOverlay from '../components/ComposeOverlay';

import { loadCurrentUser } from '../actions/users';
import { showCompose } from '../actions/common';

const fabStyle = {
  position: 'fixed',
  bottom: '35px',
  right: '35px',
};

class App extends Component {
  static propTypes = {
    showFAB: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
  }

  componentWillMount() {
    this.props.dispatch(loadCurrentUser());
  }

  render() {
    return (
      <div className="App">
        <ActionBar user={this.props.user} loading={this.props.loading} />
        <div style={{ marginTop: '9em' }}>
          { (!this.props.loading && !this.props.user.loggedIn) &&
            <Welcome />
          }

          <Switch>
            <Route exact path="/">
              <Redirect push to="/listings" />
            </Route>
            <Route path="/listings" component={Listings} />
            <Route path="/seeks" component={Seeks} />
            <Route path="/savedsearches" component={SavedSearches} />
            <Route path="/compose" component={Compose} />
            <Route path="/profile" component={Profile} />
          </Switch>
        </div>
        <ComposeOverlay />
        { this.props.showFAB && <FloatingActionButton
          style={fabStyle}
          onTouchTap={() => this.props.dispatch(showCompose())}
        >
          <ContentAdd />
        </FloatingActionButton> }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.currentUserLoading,
  user: state.currentUser,
  showFAB: !state.showCompose,
});

export default withRouter(connect(mapStateToProps)(App));
