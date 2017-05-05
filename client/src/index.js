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
  document.getElementById('root'),
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NewRoot = require('./containers/Root').default;
    ReactDOM.render(
      <NewRoot />,
      document.getElementById('root'),
    );
  });
}

if (process.env.REACT_APP_PRODUCTION === 'true') {
  /* eslint-disable */
  window.smartlook||(function(d) {
  var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
  var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
  c.charset='utf-8';c.src='https://rec.smartlook.com/recorder.js';h.appendChild(c);
  })(document);
  smartlook('init', '69729c4d5810a4db29921f4cd0efc57bed957478');
  /* eslint-enable */
}
