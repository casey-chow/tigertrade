import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';

import { setCurrentListingsQuery, loadListings } from './../actions/listings';
import { setCurrentSeeksQuery, loadSeeks } from './../actions/seeks';

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
    query: PropTypes.string.isRequired,
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {},
  }

  state = {
    dataSource: [],
    open: false,
    focus: false,
     // submitIntent is true when the user last expressed some
     // intent of submission, in this case a "request"
    submitIntent: true,
  }

  handleUpdateInput = (value) => {
    this.setState({
      dataSource: [
        'apples',
        'oranges',
        'chairs',
        'textbooks',
        'clothing',
        'clothes',
      ],
    });

    switch (this.props.location.pathname) {
      case '/listings':
        this.props.dispatch(setCurrentListingsQuery(value));
        this.props.dispatch(loadListings(value));
        break;
      case '/seeks':
        this.props.dispatch(setCurrentSeeksQuery(value));
        this.props.dispatch(loadSeeks(value));
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
        break;
      default:
        this.props.history.push('/listings');
        break;
    }
  };

  handleOnBlur = () => {
    this.setState({
      focus: false,
    });
    const queryStr = (this.props.query ? `?query=${encodeURIComponent(this.props.query)}` : '');
    this.props.history.push(`${this.props.location.pathname}${queryStr}`);
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

    const hintText = (this.props.location.pathname === '/seeks')
          ? (<span className="hint-text">What do you want to sell?</span>)
          : (<span className="hint-text">What do you want to buy?</span>);

    return (
      <Paper style={style} className={this.state.focus ? 'focus' : 'blur'} zDepth={2}>
        <AutoComplete
          className="SearchBar"
          fullWidth
          hintText={hintText}
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput}
          openOnFocus
          onClose={this.handleRequestClose}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
          inputStyle={{ color: 'white' }}
          searchText={this.props.query}
        />
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  query: state.currentQuery,
});

export default withRouter(connect(mapStateToProps)(SearchBar));
