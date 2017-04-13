import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import ActionBar from '../components/ActionBar';
import Navigation from '../components/Navigation';
import Home from './Home';

import { loadCurrentUser } from '../actions/users';

class App extends Component {
  static propTypes = {
    user: PropTypes.object
  }

  componentWillMount() {
    this.props.dispatch(loadCurrentUser());
  }

  render() {
    return (
      <div className="App">
        <ActionBar user={this.props.user} />
        <div style={{marginTop: '64px'}}>
          <Route exact path="/" component={Home} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return ({
    user: state.currentUser,
  });
};

export default connect(mapStateToProps)(App);
