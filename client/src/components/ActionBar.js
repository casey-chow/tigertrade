import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import CircularProgress from 'material-ui/CircularProgress';

import SearchBar from './SearchBar';
import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';

export default class ActionBar extends PureComponent {
    static muiName = 'AppBar';

    static propTypes = {
      loading: PropTypes.bool,
      user: PropTypes.object,
    }

    render() {
      const rightElement =  this.props.user.loggedIn ?
        <LoggedInMenu user={this.props.user}/> :
        <LoginButton />;

      return (
        <AppBar
          title={<div>{document.title}<SearchBar/></div>}
          iconElementRight={rightElement}
          style={{
            position: 'fixed',
            top: '0px',
          }}
        />
      );
    }
}
