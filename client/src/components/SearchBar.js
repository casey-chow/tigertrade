import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';

import AutoComplete from 'material-ui/AutoComplete';
import Paper from 'material-ui/Paper';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';

import './SearchBar.css';

class SearchBar extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    style: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  }

  static defaultProps = {
    style: {},
    query: '',
  }

  state = {
    dataSource: [],
    open: false,
    focus: false,
    query: '',
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

    this.setState({
      component: this.props.location.pathname.split('/')[1],
      query: value,
    });
    switch (this.state.component) {
      case 'seeks':
        this.props.dispatch(loadSeeks(value));
        break;
      case 'listings':
      default:
        this.props.dispatch(loadListings(value));
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

  handleNewRequest = (chosenRequest, index) => {
    this.setState({
      component: this.props.location.pathname.split('/')[1],
      query: chosenRequest,
    });
    this.props.history.push(`/${encodeURIComponent(this.state.component)}` +
                            `/${encodeURIComponent(this.state.query)}`);
  }

  handleOnFocus = () => {
    this.setState({
      component: this.props.location.pathname.split('/')[1],
      focus: true,
      query: this.state.query,
    });
  }

  handleOnBlur = () => {
    this.setState({
      component: this.props.location.pathname.split('/')[1],
      focus: false,
      query: this.state.query,
    });
    this.props.history.push(`/${encodeURIComponent(this.state.component)}` +
                            `/${encodeURIComponent(this.state.query)}`);
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
          openOnFocus
          onClose={this.handleRequestClose}
          onFocus={this.handleOnFocus}
          onBlur={this.handleOnBlur}
          inputStyle={{ color: 'white' }}
          searchText={this.state.query}
          onNewRequest={this.handleNewRequest}
        />
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  query: state.currentQuery,
});

export default withRouter(connect(mapStateToProps)(SearchBar));
