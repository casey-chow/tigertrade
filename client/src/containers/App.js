import React, { PureComponent } from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import Navigation from '../components/Navigation';
import Home from './Home';

import './App.css';

class App extends PureComponent {
  static propTypes = {
    children: PropTypes.node, // injected by React Router
  };

  render() {
    return (
      <div className="App">
        <Navigation />

        <div style={{marginTop: '64px'}}>
          <Route exact path="/" component={Home} />
        </div>
      </div>
    );
  }
}

export default App;
