import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import ActionBar from '../components/ActionBar';
import Welcome from '../components/Welcome';
import NavigationDrawer from '../components/NavigationDrawer';

import Compose from './Compose';
import Listings from './Listings';
import Seeks from './Seeks';
import SavedSearches from './SavedSearches';
import Profile from './Profile';

import { loadCurrentUser } from '../actions/users';

class App extends Component {
  static propTypes = {
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
        <NavigationDrawer style={{ marginTop: '7rem', paddingTop: '2rem' }}>
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
        </NavigationDrawer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.currentUserLoading,
  user: state.currentUser,
});

export default withRouter(connect(mapStateToProps)(App));
