import React, { PureComponent } from 'react';
import FlatButton from 'material-ui/FlatButton';

// Button for logged in state
export default class LoginButton extends PureComponent {
  static muiName = 'FlatButton';

  redirectToCas = (evt) => {
    evt.preventDefault();
    const curr = window.location.href;
    const newLoc = `${process.env.REACT_APP_SERVER_ROOT}/api/user/redirect?return=${encodeURIComponent(curr)}`;
    console.log(`login: redirecting to ${newLoc}`);
    window.location = newLoc;
  }

  render() {
    return (
      <FlatButton {...this.props} onClick={this.redirectToCas} label="Login" />
    );
  }
}
