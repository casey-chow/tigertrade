import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Snackbar from 'material-ui/Snackbar';

import ActionBar from '../components/ActionBar';
import FilterBar from './FilterBar';
import Welcome from '../components/Welcome';
import NavigationDrawer from '../components/NavigationDrawer';

import Listings from './Listings';
import Listing from './Listing';
import Seeks from './Seeks';
import Seek from './Seek';
import SavedSearches from './SavedSearches';
import Profile from './Profile';
import ComposeOverlay from '../components/ComposeOverlay';

import { loadCurrentUser } from '../actions/users';
import {
  setComposeState,
  hideSnackbar,
} from '../actions/ui';

const fabStyle = {
  position: 'fixed',
  bottom: '35px',
  right: '35px',
};

class App extends Component {
  static propTypes = {
    displayMode: PropTypes.string.isRequired,
    showFAB: PropTypes.bool.isRequired,
    snackbar: PropTypes.shape({
      open: PropTypes.bool.isRequired,
      message: PropTypes.string.isRequired,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
  }

  componentWillMount() {
    this.props.dispatch(loadCurrentUser());
  }

  handleSnackbarRequestClose = () => {
    this.props.dispatch(hideSnackbar());
  }

  render() {
    return (
      <div className="App">
        <ActionBar user={this.props.user} loading={this.props.loading} />
        <NavigationDrawer>
          <FilterBar style={{ position: 'fixed' }} />

          <div style={{ marginBottom: '4rem' }} />

          { (!this.props.loading && !this.props.user.loggedIn) &&
            <Welcome />
          }

          <Switch>
            <Route exact path="/">
              <Redirect push to="/listings" />
            </Route>
            <Route path="/listings/:type?" component={Listings} />
            <Route path="/listing/:id" component={Listing} />
            <Route path="/seeks/:type?" component={Seeks} />
            <Route path="/seek/:id" component={Seek} />
            <Route path="/savedsearches" component={SavedSearches} />
            <Route path="/profile" component={Profile} />
          </Switch>
        </NavigationDrawer>

        { this.props.showFAB ?
          <FloatingActionButton
            style={fabStyle}
            onTouchTap={
              () => this.props.dispatch(setComposeState(true, false, this.props.displayMode))
            }
          >
            <ContentAdd />
          </FloatingActionButton> :
          <ComposeOverlay />
        }

        <Snackbar
          open={this.props.snackbar.open}
          message={this.props.snackbar.message}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarRequestClose}
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.currentUserLoading,
  user: state.currentUser,
  snackbar: state.snackbar,
  showFAB: !state.composeState.show,
  displayMode: state.displayMode,
});

export default withRouter(connect(mapStateToProps)(App));
