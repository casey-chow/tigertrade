import React, { PureComponent } from 'react';
import FlatButton from 'material-ui/FlatButton';

// Button for logged in state
export default class LoginButton extends PureComponent {
  static muiName = 'FlatButton';

  style = {
    ...this.props.style,
    color: 'white',
    float: 'right',
    marginTop: '8px',
    marginBottom: '8px'
  }

  redirectToCas = (evt) => {
    evt.preventDefault();
    const curr = window.location.href;
    const newLoc = `${process.env.REACT_APP_SERVER_ROOT}/api/users/redirect?return=${encodeURIComponent(curr)}`;
    console.log(`login: redirecting to ${newLoc}`);
    window.location = newLoc;
  }

  render() {
    return (
      <FlatButton
        {...this.props}
        style={this.style}
        onClick={this.redirectToCas}
        label="Login"
      />
    );
  }
}
