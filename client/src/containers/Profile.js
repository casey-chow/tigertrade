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
    this.props.dispatch(loadListings(query));
    this.props.dispatch(loadSeeks(query));

    const path = this.props.location.pathname.split('/');
    let viewMode = path[path.length - 1];
    if (viewMode !== 'listings' && viewMode !== 'seeks') {
      viewMode = 'listings';
    }
    this.setState({ viewMode });
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

    if (this.state.viewMode !== nextState.viewMode) {
      return true;
    }

    if (this.state.seeks !== nextState.seeks) {
      return true;
    }

    return false;
  }

  handleChange = (viewMode) => {
    this.setState({ viewMode });
    this.props.history.push(`/profile/${viewMode}`);
  }

  render() {
    if ((this.props.listingsLoading || this.props.seeksLoading) && this.state.initialLoad) {
      return (
        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <CircularProgress size={80} thickness={8} />
        </div>
      );
    }

    console.log('rendering with state', this.state);

    return (
      <div>
        <Container>
          <Row>
            <Col xs={1} />
            <Col xs={10}>
              <Paper>
                <Tabs onChange={this.handleChange} value={this.state.viewMode}>
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
            <Redirect to="/profile/listings" />
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
  seeksLoading: state.seeksLoading,
  seeks: state.seeks,
});

export default withRouter(connect(mapStateToProps)(Profile));
