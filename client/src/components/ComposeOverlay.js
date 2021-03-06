import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Radium from 'radium';

import { Card, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import Clear from 'material-ui/svg-icons/content/clear';
import {
  propTypes as routerPropTypes,
  withRouter,
} from 'react-router-dom';

import {
  setDisplayMode,
  setComposeState,
} from '../actions/ui';
import { loadListings, loadListing, postListing, updateListing } from '../actions/listings';
import { loadSeeks, loadSeek, postSeek, updateSeek } from '../actions/seeks';
import ComposeForm from '../components/ComposeForm';
import SeekComposeForm from '../components/SeekComposeForm';
import RedirectToCas from '../components/RedirectToCas';

const mapStateToProps = state => ({
  user: state.currentUser,
  form: state.form,
  mode: state.composeState.mode,
  currentUserLoading: state.currentUserLoading,
  isEdit: state.composeState.isEdit,
  listing: state.composeState.listing,
  seek: state.composeState.seek,
});

@Radium
@withRouter
@connect(mapStateToProps)
export default class ComposeOverlay extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
    currentUserLoading: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool.isRequired,
    mode: PropTypes.string.isRequired,
  };

  static styles = {
    overlay: {
      position: 'fixed',
      bottom: '0',
      zIndex: '1495',
      right: '5%',
      width: '40vw',
      minWidth: '16rem',
    },
    overlayHidden: { display: 'none' },
  };

  state = {
    mode: this.props.mode,
    expanded: true,
  }

  handleRequestClose = event => this.props.dispatch(setComposeState(false))

  handleSubmitListing = (data) => {
    this.props.dispatch(postListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    },
    `Successfully created listing ${data.title}`,
    )).then(() => {
      this.props.dispatch(loadListings({ query: { isMine: true }, reset: true }));
      this.props.history.push('/listings/mine');
      this.handleRequestClose();
    });
  }

  handleSubmitSeek = (data) => {
    this.props.dispatch(postSeek({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    },
    `Successfully created seek ${data.title}`,
    )).then(() => {
      this.props.dispatch(loadSeeks({ query: { isMine: true }, reset: true }));
      this.props.history.push('/seeks/mine');
      this.handleRequestClose();
    });
  }

  handleEditListing = (data) => {
    this.props.dispatch(updateListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    },
    `Successfully updated listing ${data.title}`,
    )).then(() => {
      // Update both Listing and Listings containers (so that singleton views update)
      this.props.dispatch(loadListing(data.keyId));
      this.props.dispatch(loadListings({}));
      this.handleRequestClose();
    });
  }

  handleEditSeek = (data) => {
    this.props.dispatch(updateSeek({
      ...data,
      maxPrice: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    },
    `Successfully updated seek ${data.title}`,
    )).then(() => {
      // Update both Seek and Seeks containers (so that singleton views update)
      this.props.dispatch(loadSeek(data.keyId));
      this.props.dispatch(loadSeeks({}));
      this.handleRequestClose();
    });
  }

  handleToggle = (event, isInputChecked) => {
    this.props.dispatch(setDisplayMode(isInputChecked ? 'seeks' : 'listings'));
  }

  handleExpandChange = (expanded) => {
    this.setState({ expanded });
  }

  render() {
    const styles = ComposeOverlay.styles;

    if (!this.props.currentUserLoading && !this.props.user.loggedIn) {
      return <RedirectToCas />;
    }

    return (
      <div style={styles.overlay}>
        <Card
          expanded={this.state.expanded}
          onExpandChange={this.handleExpandChange}
          zDepth={2}
        >
          <CardHeader
            title={`${this.props.isEdit ? 'Edit' : 'Compose'} ${this.state.mode === 'listings' ? 'Listing' : 'Buy Request'}`}
            actAsExpander
          >
            <IconButton
              onTouchTap={this.handleRequestClose}
              style={{ float: 'right', marginTop: '-15px', marginRight: '-15px' }}
            >
              <Clear />
            </IconButton>
          </CardHeader>
          <CardText style={this.state.expanded ? {} : styles.overlayHidden}>
            { (this.state.mode === 'listings')
              ? <ComposeForm
                isEdit={this.props.isEdit}
                onSubmit={this.props.isEdit ? this.handleEditListing : this.handleSubmitListing}
                initialValues={
                  this.props.isEdit ?
                  { ...this.props.listing,
                    price: this.props.listing.price / 100,
                    expirationDate:
                      new Date(Date.parse(this.props.listing.expirationDate)),
                  } : { expirationDate: new Date(Date.now() + 3.154e10) } // 1 year in milliseconds
                }
              />
              : <SeekComposeForm
                isEdit={this.props.isEdit}
                onSubmit={this.props.isEdit ? this.handleEditSeek : this.handleSubmitSeek}
                initialValues={
                  this.props.isEdit ?
                  { ...this.props.seek, price: this.props.seek.maxPrice / 100 } : {}
                }
              />
            }
          </CardText>
        </Card>
      </div>
    );
  }
}
