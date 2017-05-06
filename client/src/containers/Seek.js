import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import { Container, Row, Col } from 'react-grid-system';
import LoadingSpinner from '../components/LoadingSpinner';

import SeekCard from '../components/SeekCard';

import { loadSeek } from './../actions/seeks';

class Seek extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    seek: PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadSeek(this.props.match.params.id));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.id !== nextProps.match.params.id) {
      this.props.dispatch(loadSeek(this.props.match.params.id));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.loading !== nextProps.loading) {
      return true;
    }

    if (this.props.seek.keyId !== nextProps.seek.keyId) {
      return true;
    }

    return false;
  }

  render() {
    const { seek, loading } = this.props;

    return (
      <Container className="ListingsList">
        <Row>
          <Col xs={1} />
          <Col xs={10} style={{ marginTop: '-1rem' }}>
            <SeekCard expanded seek={seek} />
            <LoadingSpinner loading={loading} />
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapStateToProps = state => ({
  loading: state.seekLoading,
  seek: state.seek,
});

export default withRouter(connect(mapStateToProps)(Seek));
