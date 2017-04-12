import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';

class TopBar extends Component {
  render() {
    return (
      <AppBar
        title={document.title}
        iconClassNameRight="muidocs-icon-navigation-expand-more"
        style={{
          position: 'fixed',
          top: '0px',
        }}
      />
    );
  }
}

export default TopBar;
