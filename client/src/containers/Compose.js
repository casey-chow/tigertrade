import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import { Field, reduxForm } from 'redux-form';
import ComposeForm from './../components/ComposeForm';

class Compose extends Component {

  state = {
    submitted: false
  }

  // componentWillReceiveProps(nextProps) {
  //   this.props.dispatch(loadRecentListings());
  // }

  render() {
  const handleSubmit = (data) => {
    console.log("submitted data")
    console.log(data);
    this.state.submitted = true;
  }
  return (<div>
    {this.state.submitted ? <h1>Submitted!</h1> : ''}
    <ComposeForm onSubmit={handleSubmit}/>
    </div>
  )
  }
}

const mapStateToProps = (state) => {
  return ({
    user: state.currentUser,
    form: state.form,
  });
}

export default connect(mapStateToProps)(Compose);
