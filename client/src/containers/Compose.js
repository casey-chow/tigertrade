import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import { Field, reduxForm } from 'redux-form';
import ComposeForm from './../components/ComposeForm';

class Compose extends Component {

  handleSubmit = (values) => {
    // do something with the form values
  }
  // componentWillReceiveProps(nextProps) {
  //   this.props.dispatch(loadRecentListings());
  // }

  render() {
    /*return (
      <div>
      <Container className="Compose">
      
      </Container>
      </div>
    );*/
  return (
    <ComposeForm onSubmit={handleSubmit}/>
  )
  }
}

const mapStateToProps = (state) => {
  return ({
    user: state.currentUser,
    form: state.form,
  });
}

export default connect(mapStateToProps)(reduxForm({form: 'compose'})(Compose));
