import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';

export class Navigation extends Component {
  render() {
    return (
      <AppBar
        title={document.title}
        iconElementRight={this.props.loggedIn ? <LoggedInMenu /> : <LoginButton />}
        style={{
          position: 'fixed',
          top: '0px',
        }}
      />
    );
  }
}

export default Navigation;
