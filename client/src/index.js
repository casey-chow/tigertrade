import React from 'react';
import ReactDOM from 'react-dom';
import Raven from 'raven-js';
import injectTapEventPlugin from 'react-tap-event-plugin';

import './index.css';

import Root from './containers/Root';

if (process.env.REACT_APP_SENTRY_DSN) {
  Raven.config(process.env.REACT_APP_SENTRY_DSN).install();
}

injectTapEventPlugin();
ReactDOM.render(
	<Root />,
  document.getElementById('root')
);
