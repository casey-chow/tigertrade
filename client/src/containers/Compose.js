import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { postListing, loadRecentListings } from '../actions/listings';
import ComposeForm from '../components/ComposeForm';

class Compose extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
  }

  state = {
    submitted: false,
  }

  handleSubmit = (data) => {
    this.props.dispatch(postListing({
      ...data,
      price: data.price ? Math.round(parseFloat(data.price) * 100) : 0,
    }));
    this.props.dispatch(loadRecentListings());
    this.props.history.push('/');
  };

  render() {
    return (<div>
      {this.state.submitted ? <h1>Submitted!</h1> : ''}
      <ComposeForm onSubmit={this.handleSubmit} />
    </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.currentUser,
  form: state.form,
});

export default connect(mapStateToProps)(Compose);
