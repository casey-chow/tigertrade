import React, { PureComponent } from 'react';
import { Provider } from 'react-redux';
import { Loader } from 'tectonic';
import AppBar from 'material-ui/AppBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import store from './store';
import manager from './manager';

import logo from './logo.svg';
//import './App.css';
import Home from './pages/Home'
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'

class App extends PureComponent {
  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired,
  };

  getChildContext() {
    return {muiTheme: getMuiTheme()};
  }

  render() {
    return (
      <Provider store={ store }>
        <Loader manager={ manager }>
          <div className="App">
            <AppBar
              title={document.title}
              iconClassNameRight="muidocs-icon-navigation-expand-more"
              style={{
                position: 'fixed',
                top: '0px',
              }}
            />
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
