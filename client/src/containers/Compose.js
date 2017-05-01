import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { propTypes as routerPropTypes, withRouter } from 'react-router-dom';

import { Container, Row, Col } from 'react-grid-system';
import Paper from 'material-ui/Paper';
import { Tabs, Tab } from 'material-ui/Tabs';

import { postListing, loadListings } from '../actions/listings';
import { postSeek, loadSeeks } from '../actions/seeks';
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
    composeMode: PropTypes.string,
  };

  static defaultProps = {
    composeMode: 'listing',
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

  handleChange = (composeMode) => {
    this.setState({ composeMode });
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
              <Paper style={{ padding: '0' }}>
                <Tabs onChange={this.handleChange} value={this.state.composeMode}>
                  <Tab label="Listing" value="listing" >
                    <ComposeForm
                      onSubmit={this.handleSubmit}
                      style={{ padding: '2em', paddingTop: '0.5em', paddingBottom: '1em' }}
                    />
                  </Tab>
                  <Tab label="Seek" value="seek">
                    <SeekComposeForm
                      onSubmit={this.handleSubmitSeek}
                      style={{ padding: '2em', paddingTop: '0.5em', paddingBottom: '1em' }}
                    />
                  </Tab>
                </Tabs>
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

export default withRouter(connect(mapStateToProps)(Compose));
