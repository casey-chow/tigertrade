import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import Waypoint from 'react-waypoint';

import SeeksList from '../components/SeeksList';
import LoadingSpinner from '../components/LoadingSpinner';

import { loadSeeks } from './../actions/seeks';
import { parseQuery } from '../helpers/query';

const mapStateToProps = state => ({
  seeksLoading: state.seeksLoading,
  seeks: state.seeks,
  expandAll: state.expandAll,
});

@withRouter
@connect(mapStateToProps)
export default class Seeks extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    seeksLoading: PropTypes.bool.isRequired,
    seeks: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  componentWillMount() {
    const query = parseQuery(this.props);
    this.props.dispatch(loadSeeks({ query, reset: true }));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      const query = parseQuery(nextProps);
      this.props.dispatch(loadSeeks({ query, reset: true }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.expandAll !== nextProps.expandAll) {
      return true;
    }

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

  loadMoreSeeks = () => {
    const limit = 2 * this.props.seeks.length;
    this.props.dispatch(loadSeeks({ query: { limit } }));
  }

  render() {
    const { seeks, expandAll, seeksLoading } = this.props;

    return (
      <div>
        <SeeksList seeks={seeks} expandAll={expandAll} />
        <LoadingSpinner loading={seeksLoading} />
        <Waypoint
          topOffset="70%"
          bottomOffset="-25%"
          onEnter={this.loadMoreSeeks}
        />
      </div>
    );
  }
}
