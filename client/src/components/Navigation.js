import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';

import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';

export class Navigation extends PureComponent {
  static propTypes = {
    user: PropTypes.object,
  }

  render() {
    const loggedIn = this.props.user.loggedIn;
    return (
      <AppBar
        title="TigerTrade"
        iconElementRight={loggedIn ? <LoggedInMenu /> : <LoginButton user={this.props.user}/>}
        style={{
          position: 'fixed',
          top: '0px',
        }}
      />
    );
  }
}

export default Navigation;
