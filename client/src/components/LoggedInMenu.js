import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';
import FlatButton from 'material-ui/FlatButton';


export default class LoggedInMenu extends PureComponent {
  static muiName = 'FlatButton';

  static propTypes = {
    style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    user: PropTypes.shape({
      netId: PropTypes.string.isRequired,
    }).isRequired,
  }

  static styles = {
    menu: {
      color: 'white',
      marginTop: '8px',
      marginBottom: '8px',
    },
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
    const rest = omit(this.props, 'user');
    const styles = LoggedInMenu.styles;

    return (
      <IconMenu
        {...rest}
        style={{ ...styles.menu, ...this.props.style }}
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
