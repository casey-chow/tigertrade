import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Loader } from 'tectonic';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import store from './store';
import manager from './manager';

import logo from './logo.svg';
//import './App.css';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

class App extends PureComponent {
  static childContextTypes = {
    muiTheme: PropTypes.object.isRequired,
  };

  getChildContext() {
    return {muiTheme: getMuiTheme()};
  }

  render() {
    return (
      <Provider store={ store }>
        <Loader manager={ manager }>
          <div className="App">
            <Navigation />
            <Router>
              <div style={{
                marginTop: '5em',
              }}>
                <Route exact path="/" component={Home}/>
              </div>
            </Router>
          </div>
        </Loader>
      </Provider>
    );
  }
}

export default App;
