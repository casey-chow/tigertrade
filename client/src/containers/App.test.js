import React from 'react';
import ReactDOM from 'react-dom';
import Root from './Root';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Root />, div);
});
