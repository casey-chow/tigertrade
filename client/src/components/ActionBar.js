import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
  Link,
} from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import Paper from 'material-ui/Paper';

import { toggleLeftDrawer } from '../actions/ui';

import SearchBar from './SearchBar';
import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';

class ActionBar extends Component {
  static muiName = 'AppBar';

  static propTypes = {
    ...routerPropTypes,
    loading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
  };

  static pages = [
    { name: 'Listings', url: '/listings' },
    { name: 'Seeks', url: '/seeks' },
    { name: 'Saved Searches', url: '/savedsearches' },
    { name: 'Profile', url: '/profile' },
    { name: 'Compose', url: '/compose' },
  ];

  handleAppBarMenuTap = () => {
    this.props.dispatch(toggleLeftDrawer());
  }

  render() {
    const Title = () => (
      <Link
        to="/" style={{
          color: 'white',
          flexGrow: '1',
          textDecoration: 'none',
        }}
      >
        {document.title}
      </Link>
    );

    const RightElement = props => (
      this.props.user.loggedIn ?
        <LoggedInMenu {...props} user={this.props.user} /> :
        <LoginButton {...props} />
    );

    return (
      <Paper
        style={{
          position: 'fixed',
          top: '0px',
          width: '100%',
          zIndex: '1400',
        }}
      >
        <AppBar
          // showMenuIconButton={false}
          onLeftIconButtonTouchTap={this.handleAppBarMenuTap}
          title={<Title />}
          zDepth={0}
        >
          <SearchBar style={{ flex: '2 2 0%' }} />
          <RightElement style={{ flex: '1 1 0%' }} />
        </AppBar>
      </Paper>
    );
  }
}

export default withRouter(connect()(ActionBar));
