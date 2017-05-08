import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';
import { writeHistory } from '../helpers/query';

import './SearchBar.css';


const mapStateToProps = state => ({
  displayMode: state.displayMode,
  query: state.currentQuery,
});

@withRouter
@connect(mapStateToProps)
export default class SearchBar extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    displayMode: PropTypes.string.isRequired,
    query: PropTypes.shape({
      isStarred: PropTypes.bool,
      query: PropTypes.string,
    }).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {},
  }

  static styles = {
    base: {
      backgroundColor: 'hsla(0,0%,100%,.3)',
      marginTop: '8px',
      marginBottom: '8px',
      paddingLeft: '16px',
      paddingRight: '16px',
    },
    hintText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%',
    },
  }

  state = {
    open: false,
    focus: false,
     // submitIntent is true when the user last expressed some
     // intent of submission, in this case a "request"
    submitIntent: true,
  }

  handleUpdateInput = (value) => {
    const query = { query: value === '' ? undefined : value };
    switch (this.props.displayMode) {
      case 'seeks':
        this.props.dispatch(loadSeeks({ query }));
        break;
      case 'listings':
        this.props.dispatch(loadListings({ query }));
        break;
      default:
        break;
    }
  }

  handleTouchTap = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  handleOnFocus = () => {
    this.setState({
      focus: true,
    });
    switch (this.props.location.pathname) {
      case '/seeks':
      case '/listings':
      case '/profile':
        break;
      default:
        this.props.history.push(`/${this.props.displayMode}`);
        break;
    }
  };

  handleOnBlur = () => {
    this.setState({
      focus: false,
    });

    writeHistory(this.props);
  };

  render() {
    const styles = SearchBar.styles;
    const hintText = (this.props.displayMode === 'seeks')
          ? (<span className="hint-text">What do you want to sell?</span>)
          : (<span className="hint-text">What do you want to buy?</span>);

    return (
      <Paper
        style={{ ...styles.base, ...this.props.style }}
        className={this.state.focus ? 'focus' : 'blur'}
        zDepth={2}
      >
        <AutoComplete
          className="SearchBar"
          fullWidth
          hintText={hintText}
          hintStyle={styles.hintText}
          dataSource={[]}
          onUpdateInput={this.handleUpdateInput}
          openOnFocus
          onClose={this.handleRequestClose}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
          inputStyle={{ color: 'white' }}
          searchText={this.props.query.query || ''}
        />
      </Paper>
    );
  }
}
