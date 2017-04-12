import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './index.css';

import Root from './containers/Root';

injectTapEventPlugin();
ReactDOM.render(
	<Root />,
  document.getElementById('root')
);
