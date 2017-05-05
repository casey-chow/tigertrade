import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import Waypoint from 'react-waypoint';

import CircularProgress from 'material-ui/CircularProgress';
import { parse } from 'query-string';

import SeeksList from '../components/SeeksList';

import { loadSeeks } from './../actions/seeks';

class Seeks extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    seeksLoading: PropTypes.bool.isRequired,
    seeks: PropTypes.arrayOf(PropTypes.object).isRequired,
  };

  componentWillMount() {
    const query = this.getQuery(this.props);
    this.props.dispatch(loadSeeks({ query, reset: true }));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params.type !== nextProps.match.params.type) {
      const query = this.getQuery(nextProps);
      this.props.dispatch(loadSeeks({ query, reset: true }));
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

    if (this.props.expandAll !== nextProps.expandAll) {
      return true;
    }

    return false;
  }

  getQuery = (props) => {
    const query = {
      query: parse(props.location.search).query || '',
    };

    if (props.match.params.type === 'mine') {
      query.isMine = true;
    }

    return query;
  }

  loadMoreSeeks = () => {
    const limit = 2 * this.props.seeks.length;
    this.props.dispatch(loadSeeks({ query: { limit } }));
  }

  render() {
    return (
      <div>
        <SeeksList seeks={this.props.seeks} expandAll={this.props.expandAll} />
        <Waypoint topOffset="70%" bottomOffset="-25%" onEnter={this.loadMoreSeeks} />
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
  expandAll: state.expandAll,
});

export default withRouter(connect(mapStateToProps)(Seeks));
