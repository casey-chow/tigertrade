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
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';

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

  static menuChildStyle = {
    paddingLeft: '16px',
  };

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
          leftIcon={<ViewList />}
          initiallyOpen
          primaryTogglesNestedList
          nestedListStyle={{

          }}
          nestedItems={[
            <ListItem
              key="recent"
              primaryText="Recent Listings"
              value="/listings"
              style={NavigationDrawer.menuChildStyle}
            />,
            <ListItem
              key="mine"
              primaryText="My Listings"
              value="/listings/mine"
              style={NavigationDrawer.menuChildStyle}
            />,
          ]}
        />
        <ListItem
          key="seeks"
          primaryText="Seeks"
          leftIcon={<ShoppingCart />}
          primaryTogglesNestedList
          nestedItems={[
            <ListItem
              key="recent"
              primaryText="Recent Seeks"
              value="/seeks"
              style={NavigationDrawer.menuChildStyle}
            />,
            <ListItem
              key="mine"
              primaryText="My Seeks"
              value="/seeks/mine"
              style={NavigationDrawer.menuChildStyle}
            />,
          ]}
        />
        <ListItem
          key="savedsearches"
          primaryText="Saved Searches"
          value="/savedsearches"
          leftIcon={<Search />}
        />
        <ListItem
          key="compose"
          primaryText="Compose"
          leftIcon={<ModeEdit />}
          initiallyOpen
          primaryTogglesNestedList
          nestedItems={[
            <ListItem
              key="listings"
              primaryText="Listing"
              value="/compose/listings"
              style={NavigationDrawer.menuChildStyle}
            />,
            <ListItem
              key="seeks"
              primaryText="Seek"
              value="/compose/seeks"
              style={NavigationDrawer.menuChildStyle}
            />,
          ]}
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
