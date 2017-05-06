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
import Feedback from 'material-ui/svg-icons/action/feedback';

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

  static styles = {
    menuChild: {
      paddingLeft: '16px',
    },
    sidebar: {
      root: {
        top: '4rem',
      },
      sidebar: {
        width: '20vw',
        backgroundColor: 'white',
        zIndex: '500',
      },
      content: {
        paddingBottom: '2rem',
      },
    },
  }

  handleMenuChange = (event, value) => {
    this.props.history.push(value);
  }

  openFeedback = () => {
    const win = window.open('https://goo.gl/forms/hsEbS3X2HVs4zzdE3', '_blank');
    win.focus();
  }

  render() {
    const styles = NavigationDrawer.styles;
    const currentMajorPath = this.props.location.pathname;

    const SidebarItems = (
      <SelectableList value={currentMajorPath} onChange={this.handleMenuChange}>
        <ListItem
          key="listings"
          primaryText="Listings"
          leftIcon={<ViewList />}
          initiallyOpen
          primaryTogglesNestedList
          nestedItems={[
            <ListItem
              key="recent"
              primaryText="Recent Listings"
              value="/listings"
              style={styles.menuChild}
            />,
            <ListItem
              key="mine"
              primaryText="My Listings"
              value="/listings/mine"
              style={styles.menuChild}
            />,
          ]}
        />
        <ListItem
          key="seeks"
          primaryText="Seeks"
          leftIcon={<ShoppingCart />}
          initiallyOpen
          primaryTogglesNestedList
          nestedItems={[
            <ListItem
              key="recent"
              primaryText="Recent Seeks"
              value="/seeks"
              style={styles.menuChild}
            />,
            <ListItem
              key="mine"
              primaryText="My Seeks"
              value="/seeks/mine"
              style={styles.menuChild}
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
          key="feedback"
          primaryText="Feedback"
          leftIcon={<Feedback />}
          onClick={this.openFeedback}
        />
      </SelectableList>
    );

    return (
      <Sidebar
        docked={this.props.visible}
        sidebar={SidebarItems}
        styles={styles.sidebar}
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
