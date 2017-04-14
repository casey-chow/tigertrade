import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import {Tabs, Tab} from 'material-ui/Tabs';

import SearchBar from './SearchBar';
import LoginButton from './LoginButton';
import LoggedInMenu from './LoggedInMenu';

import { Link } from 'react-router-dom';

export default class ActionBar extends PureComponent {
  static muiName = 'AppBar';

  static propTypes = {
    loading: PropTypes.bool,
    user: PropTypes.object,
  }

  render() {
    const Title = () => (
      <Link to="/" style={{
        color: 'white',
        flexGrow: '1',
        textDecoration: 'none',
      }}>
          {document.title}
      </Link>
    );

    const RightElement = (props) => (
      this.props.user.loggedIn ?
      <LoggedInMenu {...props} user={this.props.user} /> :
      <LoginButton {...props} />
    );

    return (
      <div style={{
        position: 'fixed',
        top: '0px',
        width: '100%',
        zIndex: '100',
      }}>
        <AppBar
          showMenuIconButton={false}
          title={<Title />}
          zDepth={0}
        >
          <SearchBar style={{ flex: '2 2 0%' }} />
          <RightElement style={{ flex: '1 1 0%' }} />
        </AppBar>
        <Tabs>
          <Tab label="Item One" >
          </Tab>
          <Tab label="Item Two" >
          </Tab>
          <Tab
            label="onActive"
            data-route="/home"
          >
          </Tab>
        </Tabs>
      </div>
    );
  }
}
