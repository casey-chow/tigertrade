import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import Paper from 'material-ui/Paper';
import Toggle from 'material-ui/Toggle';

import { postListing, loadListings } from '../actions/listings';
import { postSeek, loadSeeks } from '../actions/seeks';
import ComposeForm from '../components/ComposeForm';
import SeekComposeForm from '../components/SeekComposeForm';
import RedirectToCas from '../components/RedirectToCas';

class Compose extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.shape({
      loggedIn: PropTypes.bool.isRequired,
    }).isRequired,
    currentUserLoading: PropTypes.bool.isRequired,
    composeMode: PropTypes.string,
  };

  static defaultProps = {
    composeMode: 'Listing',
  };

  state = {
    composeMode: this.props.composeMode,
  }

  handleSubmit = (data) => {
    this.props.dispatch(postListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.props.dispatch(loadListings());
    this.props.history.push('/');
  }

  handleSubmitSeek = (data) => {
    this.props.dispatch(postSeek({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.props.dispatch(loadSeeks());
    this.props.history.push('/');
  }

  handleToggle = (event, isInputChecked) => {
    this.setState({
      composeMode: isInputChecked ? 'Seek' : 'Listing',
    });
  }

  render() {
    if (!this.props.currentUserLoading && !this.props.user.loggedIn) {
      return <RedirectToCas />;
    }

    return (
      <div>
        <Container>
          <Row>
            <Col xs={12}>
              <Paper style={{ padding: '1em' }}>
                <div style={{ float: 'right' }}>
                  <Toggle
                    label="Listing / Seek"
                    labelPosition="right"
                    toggled={this.state.composeMode !== 'Listing'}
                    onToggle={this.handleToggle}
                  />
                </div>
                { this.state.composeMode === 'Listing' ?
                  <ComposeForm onSubmit={this.handleSubmit} /> :
                  <SeekComposeForm onSubmit={this.handleSubmitSeek} />
                }
              </Paper>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.currentUser,
  form: state.form,
  currentUserLoading: state.currentUserLoading,
});

export default connect(mapStateToProps)(Compose);
