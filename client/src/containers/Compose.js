import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  propTypes as routerPropTypes,
  withRouter,
  Switch,
  Redirect,
  Route,
} from 'react-router-dom';

import Paper from 'material-ui/Paper';
import { Tabs, Tab } from 'material-ui/Tabs';

import { setDisplayMode } from '../actions/ui';
import { postListing, loadListings } from '../actions/listings';
import { postSeek, loadSeeks } from '../actions/seeks';

import MaxRowContainer from '../components/MaxRowContainer';
import ComposeForm from '../components/ComposeForm';
import SeekComposeForm from '../components/SeekComposeForm';
import RedirectToCas from '../components/RedirectToCas';

class Compose extends Component {

  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
    currentUserLoading: PropTypes.bool.isRequired,
    displayMode: PropTypes.string.isRequired,
  };

  componentWillMount() {
    const mode = this.getDisplayMode();
    this.props.dispatch(setDisplayMode(mode));
  }

  getDisplayMode = () => {
    const path = this.props.location.pathname.split('/');
    const mode = path[path.length - 1];
    if (mode !== 'listings' && mode !== 'seeks') {
      return this.props.displayMode;
    }
    return mode;
  }

  handleSubmit = (data) => {
    this.props.dispatch(postListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.props.dispatch(loadListings());
    this.props.history.push('/listings');
  }

  handleSubmitSeek = (data) => {
    this.props.dispatch(postSeek({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.props.dispatch(loadSeeks());
    this.props.history.push('/seeks');
  }

  handleChange = (displayMode) => {
    this.props.history.push(`/compose/${displayMode}`);
    this.props.dispatch(setDisplayMode(displayMode));
  }

  render() {
    if (!this.props.currentUserLoading && !this.props.user.loggedIn) {
      return <RedirectToCas />;
    }

    return (
      <MaxRowContainer>
        <Paper style={{ padding: '0' }}>
          <Tabs onChange={this.handleChange} value={this.props.displayMode}>
            <Tab label="Listing" value="listings" />
            <Tab label="Seek" value="seeks" />
          </Tabs>

          <Switch>
            <Route exact path="/compose/">
              <Redirect to={`/compose/${this.props.displayMode}`} />
            </Route>
            <Route path="/compose/listings">
              <ComposeForm
                onSubmit={this.handleSubmit}
                style={{ padding: '2em', paddingTop: '0.5em', paddingBottom: '1em' }}
              />
            </Route>
            <Route path="/compose/seeks">
              <SeekComposeForm
                onSubmit={this.handleSubmitSeek}
                style={{ padding: '2em', paddingTop: '0.5em', paddingBottom: '1em' }}
              />
            </Route>
          </Switch>
        </Paper>
      </MaxRowContainer>
    );
  }
}

const mapStateToProps = state => ({
  user: state.currentUser,
  form: state.form,
  displayMode: state.displayMode,
  currentUserLoading: state.currentUserLoading,
});

export default withRouter(connect(mapStateToProps)(Compose));
