import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { parse } from 'query-string';

import CircularProgress from 'material-ui/CircularProgress';
import Paper from 'material-ui/Paper';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Container, Row, Col } from 'react-grid-system';

import ListingsList from '../components/ListingsList';
import SeeksList from '../components/SeeksList';

import { setDisplayMode } from '../actions/ui';
import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';

class Profile extends Component {
  static propTypes = {
    ...routerPropTypes,
    listingsLoading: PropTypes.bool.isRequired,
    seeksLoading: PropTypes.bool.isRequired,
    listings: PropTypes.arrayOf(PropTypes.object).isRequired,
    seeks: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
    displayMode: PropTypes.string.isRequired,
  };

  state = {
    initialLoad: true,
    initialSeekLoad: true,
  }

  componentWillMount() {
    const query = {
      query: parse(this.props.location.search).query || '',
      isMine: true,
    };
    this.props.dispatch(loadListings({ query, reset: true }));
    this.props.dispatch(loadSeeks({ query, reset: true }));

    const mode = this.getDisplayMode();
    this.props.dispatch(setDisplayMode(mode));
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.listingsLoading) {
      this.setState({ initialLoad: false });
    }
    if (!nextProps.seeksLoading) {
      this.setState({ initialSeekLoad: false });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.listingsLoading !== nextProps.listingsLoading) {
      return true;
    }

    if (this.props.listings.length !== nextProps.listings.length) {
      return true;
    }

    for (let i = 0; i < this.props.listings.length; i += 1) {
      if (this.props.listings[i].keyId !== nextProps.listings[i].keyId) {
        return true;
      }
    }

    if (this.props.seeksLoading !== nextProps.seeksLoading) {
      return true;
    }

    if (this.props.seeks.length !== nextProps.seeks.length) {
      return true;
    }

    for (let i = 0; i < this.props.seeks.length; i += 1) {
      if (this.props.seeks[i].keyId !== nextProps.seeks[i].keyId) {
        return true;
      }
    }

    if (this.state.seeks !== nextState.seeks) {
      return true;
    }

    if (this.props.displayMode !== nextProps.displayMode) {
      return true;
    }

    return false;
  }

  getDisplayMode = () => {
    const path = this.props.location.pathname.split('/');
    const mode = path[path.length - 1];
    if (mode !== 'listings' && mode !== 'seeks') {
      return this.props.displayMode;
    }
    return mode;
  }

  handleChange = (mode) => {
    this.props.dispatch(setDisplayMode(mode));
    this.props.history.push(`/profile/${mode}`);
  }

  render() {
    if ((this.props.listingsLoading || this.props.seeksLoading) && this.state.initialLoad) {
      return (
        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <CircularProgress size={80} thickness={8} />
        </div>
      );
    }

    return (
      <div>
        <Container>
          <Row>
            <Col xs={1} />
            <Col xs={10}>
              <Paper>
                <Tabs onChange={this.handleChange} value={this.props.displayMode}>
                  <Tab
                    label="Listings"
                    value="listings"
                  />
                  <Tab
                    label="Seeks"
                    value="seeks"
                  />
                </Tabs>
              </Paper>
            </Col>
          </Row>
        </Container>

        <Switch style={{ marginTop: '10px' }}>
          <Route exact path="/profile">
            <Redirect to={`/profile/${this.props.displayMode}`} />
          </Route>
          <Route path="/profile/listings">
            <ListingsList listings={this.props.listings} />
          </Route>
          <Route path="/profile/seeks">
            <SeeksList seeks={this.props.seeks} />
          </Route>
        </Switch>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  listingsLoading: state.listingsLoading,
  listings: state.listings,
  displayMode: state.displayMode,
  seeksLoading: state.seeksLoading,
  seeks: state.seeks,
});

export default withRouter(connect(mapStateToProps)(Profile));
