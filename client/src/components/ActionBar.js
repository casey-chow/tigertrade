import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import AppBar from 'material-ui/AppBar';
import CircularProgress from 'material-ui/CircularProgress';

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

      const rightElement =  this.props.user.loggedIn ?
        <LoggedInMenu user={this.props.user}/> :
        <LoginButton />;

      const middleElement = <div><Link to="/" style={{textDecoration: 'none', color: 'white'}}>
                                    {document.title}
                                  </Link>
                                  <SearchBar/>
                            </div>;

      return (
        <AppBar
          title={middleElement}
          iconElementRight={rightElement}
          style={{
            position: 'fixed',
            top: '0px',
          }}
        />
      );
    }
}
