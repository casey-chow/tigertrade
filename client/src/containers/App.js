import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import ActionBar from '../components/ActionBar';

import RecentListings from './RecentListings';
import Compose from './Compose';
import SearchListings from './SearchListings';

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
        <div style={{ marginTop: '9em' }}>
          <Switch>
            <Route exact path="/">
              <Redirect push to="/listings/" />
            </Route>
            <Route exact path="/listings" component={RecentListings} />
            <Route path="/listings/search/:query" component={SearchListings} />
            <Route path="/compose" component={Compose} />
          </Switch>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.currentUserLoading,
  user: state.currentUser,
});

export default withRouter(connect(mapStateToProps)(App));
