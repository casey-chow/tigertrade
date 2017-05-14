import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import LoadingSpinner from '../components/LoadingSpinner';

import ListContainer from '../components/ListContainer';
import SeekCard from '../components/SeekCard';

import { loadSeek } from './../actions/seeks';

const mapStateToProps = state => ({
  loading: state.seekLoading,
  seek: state.seek,
});

@withRouter
@connect(mapStateToProps)
export default class Seek extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    seek: PropTypes.shape({
      keyId: PropTypes.number,
    }).isRequired,
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
      <ListContainer style={{ marginTop: '-1rem' }}>
        <SeekCard expanded singleton seek={seek} />
        <LoadingSpinner loading={loading} />
      </ListContainer>
    );
  }
}
