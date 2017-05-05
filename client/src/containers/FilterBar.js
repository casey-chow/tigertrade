import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { grey400 } from 'material-ui/styles/colors';

import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';

class FilterBar extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    displayMode: PropTypes.string.isRequired,
    query: PropTypes.shape({
      isStarred: PropTypes.bool.isRequired,
    }).isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    style: { },
  };

  state = {
    isStarred: false,
  }

  componentWillMount() {
    this.setState({
      isStarred: this.props.query.isStarred,
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isStarred: nextProps.query.isStarred,
    });
  }

  handleFavorite = () => {
    const isStarred = !this.props.query.isStarred;
    this.setState({ isStarred });
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
    const style = {
      textAlign: 'center',
      width: '100%',
      ...this.props.style,
    };

    const favoriteButtonStyle = {
      backgroundColor: this.props.query.isStarred ? grey400 : 'transparent',
    };

    return (
      <Paper style={style}>
        <FlatButton
          primary
          icon={<FavoriteIcon />}
          label="Favorites"
          style={favoriteButtonStyle}
          onTouchTap={this.handleFavorite}
        />
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  displayMode: state.displayMode,
  query: state.currentQuery,
});

export default withRouter(connect(mapStateToProps)(FilterBar));