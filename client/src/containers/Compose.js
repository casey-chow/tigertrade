import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import { Field, reduxForm } from 'redux-form';
import ComposeForm from './../components/ComposeForm';
import { postListing } from '../actions/listings';

class Compose extends Component {

  state = {
    submitted: false
  }

  render() {
  const handleSubmit = (data) => {
    this.props.dispatch(postListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }))
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
