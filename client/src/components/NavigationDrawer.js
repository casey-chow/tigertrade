import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { cloneDeep } from 'lodash';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';
import {
  spacing,
  typography,
} from 'material-ui/styles';

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

import theme from '../helpers/theme';
import { setLeftDrawer } from '../actions/ui';
import { breakpoints } from '../helpers/breakpoints';

const SelectableList = makeSelectable(List);

const mapStateToProps = state => ({
  loggedIn: state.currentUserLoading || state.currentUser.loggedIn,
  visible: state.leftDrawerVisible,
});

@withRouter
@connect(mapStateToProps)
export default class NavigationDrawer extends Component {
  static propTypes = {
    ...routerPropTypes,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]).isRequired,
    loggedIn: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  };

  static defaultProps = {
    style: {},
  };

  static styles = {
    // adapted from https://github.com/callemall/material-ui/blob/master/docs/src/app/components/AppNavDrawer.js
    logo: {
      fontSize: 24,
      fontFamily: '"Roboto 300", sans-serif',
      backgroundColor: theme.palette.primary1Color,
      boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px',
      color: typography.textFullWhite,
      lineHeight: `${spacing.desktopKeylineIncrement}px`,
      fontWeight: typography.fontWeightNormal,
      paddingLeft: spacing.desktopGutter,
    },
    menuChild: {
      paddingLeft: '16px',
    },
    sidebar: {
      sidebar: {
        backgroundColor: 'white',
        minWidth: '10rem',
        zIndex: '2000',
      },
      content: {
        paddingTop: '4rem',
        paddingBottom: '2rem',
      },
      overlay: {
        zIndex: '1500',
      },
    },
  }

  static mediaQuery = window.matchMedia(`(min-width: ${breakpoints.tabletUp}px)`);

  componentWillMount() {
    NavigationDrawer.mediaQuery.addListener(this.handleMediaQueryChanged);

    const docked = NavigationDrawer.mediaQuery.matches;
    this.setState({ docked });
  }

  componentWillUnmount() {
    NavigationDrawer.mediaQuery.removeListener(this.handleMediaQueryChanged);
  }

  handleMediaQueryChanged = () => {
    const prevDocked = this.state && this.state.docked;
    const docked = NavigationDrawer.mediaQuery.matches;

    // show the drawer if growing, hide if shrinking
    if (!prevDocked && docked) {
      this.props.dispatch(setLeftDrawer(true));
    } else if (prevDocked && !docked) {
      this.props.dispatch(setLeftDrawer(false));
    }

    this.setState({ docked });
  }

  handleMenuChange = (event, value) => {
    if (!this.state.docked) {
      this.props.dispatch(setLeftDrawer(false));
    }

    this.props.history.push(value);
  }

  handleSidebarSetOpen = (open) => {
    this.props.dispatch(setLeftDrawer(open));
  }

  openFeedback = () => {
    const win = window.open('https://goo.gl/forms/hsEbS3X2HVs4zzdE3', '_blank');
    win.focus();
  }

  renderSidebarItems() {
    const styles = NavigationDrawer.styles;
    const currentMajorPath = this.props.location.pathname;

    return (
      <div>
        { this.state.docked ||
          <div style={styles.logo}>
            TigerTrade
          </div>
        }
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
              (this.props.loggedIn &&
                <ListItem
                  key="mine"
                  primaryText="My Listings"
                  value="/listings/mine"
                  style={styles.menuChild}
                />
              ),
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
              (this.props.loggedIn &&
                <ListItem
                  key="mine"
                  primaryText="My Seeks"
                  value="/seeks/mine"
                  style={styles.menuChild}
                />
              ),
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
      </div>
    );
  }

  render() {
    const styles = cloneDeep(NavigationDrawer.styles);

    if (this.state.docked) {
      styles.sidebar.sidebar.marginTop = '4rem';
      styles.sidebar.sidebar.width = '20vw';
      styles.sidebar.sidebar.zIndex = '500';
    }

    return (
      <Sidebar
        docked={this.state.docked && this.props.visible}
        open={this.props.visible}
        onSetOpen={this.handleSidebarSetOpen}
        sidebar={this.renderSidebarItems()}
        styles={styles.sidebar}
      >
        {this.props.children}
      </Sidebar>
    );
  }
}

