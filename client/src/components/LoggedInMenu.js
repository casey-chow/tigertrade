import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import FlatButton from 'material-ui/FlatButton';


export default class LoggedInMenu extends PureComponent {
  static muiName = 'FlatButton';

  static propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
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

  feedback = () => {
    const win = window.open('https://goo.gl/forms/hsEbS3X2HVs4zzdE3', '_blank');
    win.focus();
  }

  reload = () => {
    location.reload();
  }

  logout = () => {
    const newLoc = `${process.env.REACT_APP_SERVER_ROOT}/api/users/logout`;
    window.location = newLoc;
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { user, ...rest } = this.props;
    return (
      <IconMenu
        {...rest}
        style={this.style}
        iconButtonElement={
          <FlatButton
            {...rest}
            style={{
              color: 'white',
              float: 'right',
              height: '48px',
              marginTop: '0',
            }}
            labelPosition="before"
            label={this.props.user.netId}
            icon={<NavigationExpandMore />}
          />
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem onClick={this.feedback} primaryText="Feedback" />
        <MenuItem onClick={this.reload} primaryText="Refresh" />
        <MenuItem onClick={this.logout} primaryText="Sign out" />
      </IconMenu>
    );
  }
}
