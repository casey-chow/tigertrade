import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Loader } from 'tectonic';
import AppBar from 'material-ui/AppBar';

import store from './store';
import manager from './manager';

import logo from './logo.svg';
//import './App.css';
import Home from './containers/Home'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

class App extends Component {
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
