import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CircularProgress from 'material-ui/CircularProgress';
import { parse } from 'query-string';

import SeeksList from '../components/SeeksList';

import { loadSeeks } from './../actions/seeks';

class Seeks extends Component {
  static propTypes = {
    seeksLoading: PropTypes.bool.isRequired,
    seeks: PropTypes.arrayOf(PropTypes.object).isRequired,
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.shape({
      search: PropTypes.string.isRequired,
    }).isRequired,
  };

  state = {
    initialLoad: true,
  }

  componentWillMount() {
    const query = parse(this.props.location.search).query || '';
    this.props.dispatch(loadSeeks(query));
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.seeksLoading) {
      this.setState({ initialLoad: false });
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
    if (this.props.seeksLoading && this.state.initialLoad) {
      return (
        <div style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
          <CircularProgress size={80} thickness={8} />
        </div>
      );
    }

    return (
      <SeeksList seeks={this.props.seeks} />
    );
  }
}

const mapStateToProps = state => ({
  seeksLoading: state.seeksLoading,
  seeks: state.seeks,
});

export default withRouter(connect(mapStateToProps)(Seeks));
