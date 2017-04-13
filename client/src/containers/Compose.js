import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'react-grid-system';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import ListingCard from './../components/ListingCard';
import { loadRecentListings } from '../actions/listings';

import { Link } from 'react-router-dom';

const fabStyle = {
  position: 'fixed',
  bottom: '35px',
  right: '35px',
};

class Compose extends Component {
  static propTypes = {
    listings: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  handleTouchTap = (event) => {

  }

  componentWillMount() {
    this.props.dispatch(loadRecentListings());
  }

  // componentWillReceiveProps(nextProps) {
  //   this.props.dispatch(loadRecentListings());
  // }

  render() {
    if (this.props.isFetching) {
      return <p>Loading...</p>
    }
    return (
      <div>
      <Container className="Compose">
        <h1>Compose</h1>
      </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return ({
    listings: state.listings,
  });
}

export default connect(mapStateToProps)(Compose);
