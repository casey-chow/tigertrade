import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import { postListing, updateListing } from '../actions/listings';
import { postSeek } from '../actions/seeks';
import ComposeForm from '../components/ComposeForm';
import SeekComposeForm from '../components/SeekComposeForm';
import RedirectToCas from '../components/RedirectToCas';

const overlayStyle = {
  position: 'fixed',
  bottom: '0',
  zIndex: '99',
  right: '5%',
  width: '40vw',
  minWidth: '16rem',
};

const showStyle = {};
const hideStyle = { display: 'none' };

class ComposeOverlay extends Component {
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

  state = {
    mode: this.props.mode,
    expanded: true,
  }

  handleRequestClose = event => this.props.dispatch(setComposeState(false))

  handleSubmitListing = (data) => {
    this.props.dispatch(postListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.props.history.push('/listings/mine');
    this.handleRequestClose();
  }

  handleSubmitSeek = (data) => {
    this.props.dispatch(postSeek({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.props.history.push('/seeks/mine');
    this.handleRequestClose();
  }

  handleEditListing = (data) => {
    this.props.dispatch(updateListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.handleRequestClose();
  }

  handleToggle = (event, isInputChecked) => {
    this.props.dispatch(setDisplayMode(isInputChecked ? 'seeks' : 'listings'));
  }

  handleExpandChange = (expanded) => {
    this.setState({ expanded });
  }

  render() {
    if (!this.props.currentUserLoading && !this.props.user.loggedIn) {
      return <RedirectToCas />;
    }

    return (
      <div style={overlayStyle}>
        <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
          <CardHeader title={this.props.isEdit ? 'Edit' : 'Compose'} actAsExpander>
            <IconButton
              onTouchTap={this.handleRequestClose}
              style={{ float: 'right', marginTop: '-15px', marginRight: '-15px' }}
            >
              <Clear />
            </IconButton>
          </CardHeader>
          <CardText style={this.state.expanded ? showStyle : hideStyle}>
            { (this.state.mode === 'listings') ?
              <ComposeForm
                onSubmit={this.props.isEdit ? this.handleEditListing : this.handleSubmitListing}
                initialValues={
                  this.props.isEdit ?
                  { ...this.props.listing, price: this.props.listing.price / 100 } : {}
                }
              />
              : <SeekComposeForm onSubmit={this.handleSubmitSeek} />
            }
          </CardText>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.currentUser,
  form: state.form,
  mode: state.composeState.mode,
  currentUserLoading: state.currentUserLoading,
  isEdit: state.composeState.isEdit,
  listing: state.composeState.listing,
  seek: state.composeState.seek,
});

export default withRouter(connect(mapStateToProps)(ComposeOverlay));
