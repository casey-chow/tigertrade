import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import CircularProgress from 'material-ui/CircularProgress';

import SeeksList from '../components/SeeksList';

import { loadSeek } from './../actions/seeks';

class Seek extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    seeksLoading: PropTypes.bool.isRequired,
    seeks: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  componentWillMount() {
    this.props.dispatch(loadSeek(this.props.match.params.id));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      this.props.dispatch(loadSeek(this.props.match.params.id));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.seeksLoading !== nextProps.seeksLoading) {
      return true;
    }

    if (this.props.seeks.length !== nextProps.seeks.length) {
      return true;
    }

    for (let i = 0; i < this.props.seeks.length; i += 1) {
      if (this.props.seeks[i].keyId !== nextProps.seeks[i].keyId) {
        return true;
      }
    }

    return false;
  }

  render() {
    return (
      <div>
        <SeeksList seeks={this.props.seeks} />
        { this.props.seeksLoading &&
          <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <CircularProgress size={80} thickness={8} />
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  seeksLoading: state.seeksLoading,
  seeks: state.seeks,
});

export default withRouter(connect(mapStateToProps)(Seek));
