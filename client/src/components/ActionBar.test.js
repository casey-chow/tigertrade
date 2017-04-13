/* eslint-disable no-unused-vars */
import React from 'react';

import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import AppBar from 'material-ui/AppBar';

import ActionBar from './ActionBar';
import LoggedInMenu from './LoggedInMenu';
import LoginButton from './LoginButton';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
import getMuiTheme from 'material-ui/styles/getMuiTheme';

describe('<ActionBar />', () => {
  it('presents a login button when not logged in', () => {
    const actionBar = shallow(<ActionBar user={{loggedIn: false}} />);

    expect(actionBar.find(AppBar).prop('iconElementRight').type).toBe(LoginButton);
  });

  it('presents a login menu when logged in', () => {
    const actionBar = shallow(<ActionBar user={{loggedIn: true}} />);

    expect(actionBar.find(AppBar).prop('iconElementRight').type).toBe(LoggedInMenu);
  })
});
