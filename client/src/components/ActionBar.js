import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, propTypes, Link } from 'react-router-dom';

import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import SearchBar from './SearchBar';
import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';

class ActionBar extends Component {
  static muiName = 'AppBar';

  static propTypes = {
    ...propTypes,
    loading: PropTypes.bool.isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
  };

  static pages = [
    { name: 'Listings', url: '/' },
    { name: 'Seeks', url: '/seeks' },
    { name: 'Compose', url: '/compose' },
  ];

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
      <div
        style={{
          position: 'fixed',
          top: '0px',
          width: '100%',
          zIndex: '100',
        }}
      >
        <AppBar
          showMenuIconButton={false}
          title={<Title />}
          zDepth={0}
        >
          <SearchBar style={{ flex: '2 2 0%' }} />
          <RightElement style={{ flex: '1 1 0%' }} />
        </AppBar>
        <Tabs onChange={this.changeTab} value={this.props.location.pathname}>
          {ActionBar.pages.map(page => (
            <Tab
              key={page.name}
              label={page.name}
              value={page.url}
              containerElement={<Link to={page.url} />}
            />
          ))}
        </Tabs>
      </div>
    );
  }
}

export default withRouter(ActionBar);
