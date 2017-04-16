import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import ActionBar from '../components/ActionBar';
import Home from './Home';
import Compose from './Compose';

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
            <Route exact path="/" component={Home} />
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
