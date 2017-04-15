/* eslint-disable no-unused-vars */
import React from 'react';

import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';

import AppBar from 'material-ui/AppBar';

import ActionBar from './ActionBar';
import LoggedInMenu from './LoggedInMenu';
import LoginButton from './LoginButton';

import '../test-helpers';

describe('<ActionBar />', () => {
  it('presents a login button when not logged in');

  it('presents a login menu when logged in');
});
