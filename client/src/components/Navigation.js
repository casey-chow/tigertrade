import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import load, { Status } from 'tectonic';
import AppBar from 'material-ui/AppBar';

import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';


import UserModel from '../models/users';

@load((props) => ({
  users: UserModel.getItem(),
})) 
export class Navigation extends PureComponent {
  static propTypes = {
    status: PropTypes.shape({
      users: PropTypes.instanceOf(Status),
    }),

    // data loaded w/ tectonic
    user: PropTypes.arrayOf(PropTypes.instanceOf(UserModel)),
  }

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
