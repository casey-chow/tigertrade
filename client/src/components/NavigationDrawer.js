import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import ViewList from 'material-ui/svg-icons/action/view-list';
import ShoppingCart from 'material-ui/svg-icons/action/shopping-cart';
import Search from 'material-ui/svg-icons/action/search';
import Restore from 'material-ui/svg-icons/action/restore';
import Person from 'material-ui/svg-icons/social/person';

const SelectableList = makeSelectable(List);

class NavigationDrawer extends Component {
  static propTypes = {
    ...routerPropTypes,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    visible: PropTypes.bool.isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    style: {},
  };

  static sidebarStyles = {
    root: {
      top: '4rem',
    },
    sidebar: {
      width: '20vw',
      backgroundColor: 'white',
    },
    content: {
      paddingTop: '2rem',
      paddingBottom: '2rem',
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
    this.props.history.push(value);
  }

  render() {
    const currentMajorPath = this.props.location.pathname;

    const SidebarItems = (
      <SelectableList value={currentMajorPath} onChange={this.handleMenuChange}>
        <ListItem
          key="listings"
          primaryText="Listings"
          // value="/listings"
          leftIcon={<ViewList />}
          initiallyOpen
          primaryTogglesNestedList
          nestedItems={[
            <ListItem
              key="recent"
              primaryText="Recent Listings"
              leftIcon={<Restore />}
              value="/listings"
            />,
            <ListItem
              key="mine"
              primaryText="My Listings"
              leftIcon={<Person />}
              value="/listings/mine"
            />,
          ]}
        />
        <ListItem
          key="seeks"
          primaryText="Seeks"
          // value="/seeks"
          leftIcon={<ShoppingCart />}
          primaryTogglesNestedList
          nestedItems={[
            <ListItem
              key="recent"
              primaryText="Recent Seeks"
              leftIcon={<Restore />}
              value="/seeks"
            />,
            <ListItem
              key="mine"
              primaryText="My Seeks"
              leftIcon={<Person />}
              value="/seeks/mine"
            />,
          ]}
        />
        <ListItem
          key="savedsearches"
          primaryText="Saved Searches"
          value="/savedsearches"
          leftIcon={<Search />}
        />
      </SelectableList>
    );

    return (
      <Sidebar
        docked={this.props.visible}
        sidebar={SidebarItems}
        styles={NavigationDrawer.sidebarStyles}
      >
        {this.props.children}
      </Sidebar>
    );
  }
}

const mapStateToProps = state => ({
  visible: state.leftDrawerVisible,
});

export default withRouter(connect(mapStateToProps)(NavigationDrawer));
