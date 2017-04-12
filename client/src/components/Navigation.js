import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';

import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';

export class Navigation extends PureComponent {

  render() {
    return (
      <AppBar
        title="TigerTrade"
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
