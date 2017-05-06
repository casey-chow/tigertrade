import React, { PureComponent } from 'react';

import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import store from '../store';
import muiTheme from '../helpers/theme';
import App from './App';

export default class Root extends PureComponent {
  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(muiTheme)}>
        <Provider store={store}>
          <Router>
            <App />
          </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}
