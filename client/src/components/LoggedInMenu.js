import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import FlatButton from 'material-ui/FlatButton';


export default class LoggedInMenu extends PureComponent {
  static muiName = 'FlatButton';

  static propTypes = {
    style: PropTypes.object.isRequired,
    user: PropTypes.shape({
      netId: PropTypes.string.isRequired,
    }).isRequired,
  }

  style = {
    ...this.props.style,
    color: 'white',
    marginTop: '8px',
    marginBottom: '8px',
  }

  reload = () => {
    location.reload();
  }

  logout = () => {
    const newLoc = `${process.env.REACT_APP_SERVER_ROOT}/api/users/logout`;
    window.location = newLoc;
  }

  render() {
    return (
      <IconMenu
        {...this.props}
        style={this.style}
        iconButtonElement={
          <FlatButton
            {...this.props}
            style={{
              color: 'white',
              float: 'right',
              marginTop: '0',
              padding: '8px',
            }}
            labelPosition="before"
            label={this.props.user.netId}
            icon={<NavigationExpandMore />}
          />
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem primaryText="Profile" />
        <MenuItem onClick={this.reload} primaryText="Refresh" />
        <MenuItem onClick={this.logout} primaryText="Sign out" />
      </IconMenu>
    );
  }
}
