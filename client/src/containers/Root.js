import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { Loader } from 'tectonic';

import { BrowserRouter as Router } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import store from '../store';
import manager from '../manager';

import App from './App';

class Root extends PureComponent {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  getChildContext() {
    return { muiTheme: getMuiTheme() };
  }

  render() {
    return (
      <MuiThemeProvider>
        <Provider store={ store }>
          <Loader manager={ manager }>
            <Router>
              <App />
            </Router>
          </Loader>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default Root;
