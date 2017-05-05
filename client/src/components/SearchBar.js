import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';
import { stringify } from 'query-string';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';

import './SearchBar.css';

class SearchBar extends Component {

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

  state = {
    open: false,
    focus: false,
     // submitIntent is true when the user last expressed some
     // intent of submission, in this case a "request"
    submitIntent: true,
  }

  handleUpdateInput = (value) => {
    const query = this.props.query;
    query.query = value;

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

    if (this.props.query) {
      const queryStr = stringify(this.props.query);
      this.props.history.push(`${this.props.location.pathname}?${queryStr}`);
    } else {
      this.props.history.push(`${this.props.location.pathname}`);
    }
  };

  render() {
    const style = {
      ...this.props.style,
      backgroundColor: 'hsla(0,0%,100%,.3)',
      marginTop: '8px',
      marginBottom: '8px',
      paddingLeft: '16px',
      paddingRight: '16px',
    };

    const hintText = (this.props.displayMode === 'seeks')
          ? (<span className="hint-text">What do you want to sell?</span>)
          : (<span className="hint-text">What do you want to buy?</span>);

    return (
      <Paper style={style} className={this.state.focus ? 'focus' : 'blur'} zDepth={2}>
        <AutoComplete
          className="SearchBar"
          fullWidth
          hintText={hintText}
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

const mapStateToProps = state => ({
  displayMode: state.displayMode,
  query: state.currentQuery,
});

export default withRouter(connect(mapStateToProps)(SearchBar));
