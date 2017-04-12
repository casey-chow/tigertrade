import React, { PureComponent } from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import TopBar from '../components/TopBar';
import Home from './Home';

import './App.css';

class App extends PureComponent {
  static propTypes = {
    children: PropTypes.node, // injected by React Router
  };

  render() {
    return (
      <div className="App">
        <TopBar />

        <Route exact path="/" component={Home} />
      </div>
    );
  }
}

export default App;
