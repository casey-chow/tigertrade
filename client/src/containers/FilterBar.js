import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';

class FilterBar extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    displayMode: PropTypes.string.isRequired,
    query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    style: {
      marginBottom: '2rem',
      textAlign: 'center',
    },
  };

  handleFavorite = isStarred => () => {
    switch (this.props.displayMode) {
      case 'seeks':
        this.props.dispatch(loadSeeks({ isStarred }));
        break;
      case 'listings':
        this.props.dispatch(loadListings({ isStarred }));
        break;
      default:
        break;
    }
  }

  render() {
    return (
      <Paper style={this.props.style}>
        { this.props.query.isStarred ?
          <RaisedButton primary icon={<FavoriteIcon />} label="Favorites" onTouchTap={this.handleFavorite(false)} /> :
          <FlatButton primary icon={<FavoriteIcon />} label="Favorites" onTouchTap={this.handleFavorite(true)} />
        }
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  displayMode: state.displayMode,
  query: state.currentQuery,
});

export default withRouter(connect(mapStateToProps)(FilterBar));
