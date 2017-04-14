import React, { PureComponent } from 'react';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import FlatButton from 'material-ui/FlatButton';


export default class LoggedInMenu extends PureComponent {
  static muiName = 'FlatButton';

  reload = () => {
    location.reload();
  }

  logout = () => {
    const newLoc = `${process.env.REACT_APP_SERVER_ROOT}/api/users/logout`;
    window.location = newLoc;
  }

  render() {
    return(
      <IconMenu
        {...this.props}
        iconButtonElement={
          <FlatButton {...this.props}
            style={{marginTop: '0', color: 'white'}}
            labelPosition='before'
            label={this.props.user.netId}
            icon={<NavigationExpandMore />}
          />
        }
        targetOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'top'}}
      >
        <MenuItem primaryText="Profile" />
        <MenuItem onClick={this.reload} primaryText="Refresh" />
        <MenuItem onClick={this.logout} primaryText="Sign out" />
      </IconMenu>
    );
  }
}
