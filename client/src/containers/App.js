import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import ActionBar from '../components/ActionBar';
import Home from './Home';
import Compose from './Compose';

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
          <Route path="/compose" component={Compose}/>
          <Route exact path="/" component={Home}/>
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
