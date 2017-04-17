import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';

import { searchListings, loadRecentListings } from './../actions/listings';


import './SearchBar.css';

class SearchBar extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    style: PropTypes.object,
  }

  static defaultProps = {
    style: {},
  }

  state = {
    dataSource: [],
    open: false,
    focus: false,
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
    if (!value) {
      this.props.dispatch(loadRecentListings());
    } else {
      this.props.dispatch(searchListings(value));
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

  handleNewRequest = (chosenRequest, index) => {
    this.props.dispatch(searchListings(chosenRequest));
  }

  handleOnFocus = () => {
    this.setState({
      focus: true,
    });
  }

  handleOnBlur = () => {
    this.setState({
      focus: false,
    });
  }

  render() {
    const style = {
      ...this.props.style,
      backgroundColor: 'hsla(0,0%,100%,.3)',
      marginTop: '8px',
      marginBottom: '8px',
      paddingLeft: '16px',
      paddingRight: '16px',
    };

    return (
      <Paper style={style} className={this.state.focus ? 'focus' : 'blur'} zDepth={2}>
        <AutoComplete
          className="SearchBar"
          fullWidth
          hintText={<span className="hint-text">What do you want to buy?</span>}
          dataSource={this.state.dataSource}
          onUpdateInput={this.handleUpdateInput}
          onClose={this.handleRequestClose}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
          inputStyle={{ color: 'white' }}
          onNewRequest={this.handleNewRequest}
        />
      </Paper>
    );
  }
}

export default connect()(SearchBar);
