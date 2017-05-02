import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import Clear from 'material-ui/svg-icons/content/clear';

import { setSearchMode, hideCompose } from '../actions/common';
import { postListing, loadListings } from '../actions/listings';
import { postSeek, loadSeeks } from '../actions/seeks';
import ComposeForm from '../components/ComposeForm';
import SeekComposeForm from '../components/SeekComposeForm';
import RedirectToCas from '../components/RedirectToCas';

const overlayStyle = {
  position: 'fixed',
  bottom: '0',
  zIndex: '99',
  right: '5%',
  width: '30%',
  minWidth: '300px',
};

class ComposeOverlay extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
    currentUserLoading: PropTypes.bool.isRequired,
    mode: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
  };

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

  handleToggle = (event, isInputChecked) => {
    this.props.dispatch(setSearchMode(isInputChecked ? 'seeks' : 'listings'));
  }

  render() {
    if (!this.props.currentUserLoading && !this.props.user.loggedIn) {
      return <RedirectToCas />;
    }

    return (
      <div style={overlayStyle}>
        { this.props.show &&
          <Card expandable initiallyExpanded>
            <CardHeader title="Compose" actAsExpander>
              <IconButton
                onTouchTap={event => this.props.dispatch(hideCompose())}
                style={{ float: 'right', marginTop: '-15px', marginRight: '-15px' }}
              >
                <Clear />
              </IconButton>
            </CardHeader>
            <CardText expandable>
              { (this.props.mode === 'listings') ?
                <ComposeForm onSubmit={this.handleSubmit} /> :
                <SeekComposeForm onSubmit={this.handleSubmitSeek} />
              }
            </CardText>
          </Card>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.currentUser,
  form: state.form,
  mode: state.searchMode,
  currentUserLoading: state.currentUserLoading,
  show: state.showCompose,
});

export default connect(mapStateToProps)(ComposeOverlay);
