import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import ActionBar from '../components/ActionBar';
import Welcome from '../components/Welcome';
import NavigationDrawer from '../components/NavigationDrawer';

import Listings from './Listings';
import Seeks from './Seeks';
import SavedSearches from './SavedSearches';
import Profile from './Profile';
import ComposeOverlay from '../components/ComposeOverlay';

import { loadCurrentUser } from '../actions/users';
import { setComposeState } from '../actions/ui';

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
        <NavigationDrawer>
          { (!this.props.loading && !this.props.user.loggedIn) &&
            <Welcome />
          }

          <Switch>
            <Route exact path="/">
              <Redirect push to="/listings" />
            </Route>
            <Route path="/listings/:type?" component={Listings} />
            <Route path="/seeks/:type?" component={Seeks} />
            <Route path="/savedsearches" component={SavedSearches} />
            <Route path="/profile" component={Profile} />
          </Switch>
        </NavigationDrawer>
        { this.props.showFAB ?
          <FloatingActionButton
            style={fabStyle}
            onTouchTap={() => this.props.dispatch(setComposeState(true))}
          >
            <ContentAdd />
          </FloatingActionButton> :
          <ComposeOverlay />
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.currentUserLoading,
  user: state.currentUser,
  showFAB: !state.composeState.show,
});

export default withRouter(connect(mapStateToProps)(App));
