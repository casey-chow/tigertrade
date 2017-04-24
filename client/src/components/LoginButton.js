import React, { PureComponent } from 'react';
import FlatButton from 'material-ui/FlatButton';

import { redirectToCas } from '../helpers/cas';

// Button for logged in state
export default class LoginButton extends PureComponent {
  static muiName = 'FlatButton';

  style = {
    color: 'white',
    float: 'right',
    height: '48px',
    marginTop: '8px',
    marginBottom: '8px',
  }

  render() {
    return (
      <div {...this.props}>
        <FlatButton
          style={this.style}
          onClick={redirectToCas}
          label="Login"
        />
      </div>
    );
  }
}
