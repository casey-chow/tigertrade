import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import Sidebar from 'react-sidebar';
import {
  List,
  ListItem,
  makeSelectable,
} from 'material-ui/List';

const SelectableList = makeSelectable(List);

class NavigationDrawer extends Component {
  static propTypes = {
    ...routerPropTypes,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    style: {},
  };

  static sidebarStyles = {
    root: {
      top: '7rem',
    },
    sidebar: {
      backgroundColor: 'white',
      width: '17vw',
    },
    content: {
      paddingTop: '2rem',
    },
  };

  static pages = [
    { name: 'Listings', url: '/listings' },
    { name: 'Seeks', url: '/seeks' },
    { name: 'Saved Searches', url: '/savedsearches' },
    { name: 'Profile', url: '/profile' },
    { name: 'Compose', url: '/compose' },
  ];

  handleMenuChange = (event, value) => {
    this.props.history.push(`/${value}`);
  }

  render() {
    const currentMajorPath = this.props.location.pathname.split('/')[1];

    const SidebarItems = (
      <SelectableList value={currentMajorPath} onChange={this.handleMenuChange}>
        {NavigationDrawer.pages.map(page => (
          <ListItem
            key={page.name}
            primaryText={page.name}
            value={page.url.split('/')[1]}
          />
        ))}
      </SelectableList>
    );

    return (
      <div style={this.props.style}>
        <Sidebar docked sidebar={SidebarItems} styles={NavigationDrawer.sidebarStyles}>
          {this.props.children}
        </Sidebar>
      </div>
    );
  }
}

export default withRouter(NavigationDrawer);
