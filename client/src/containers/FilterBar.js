import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import { grey400 } from 'material-ui/styles/colors';

import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import SaveIcon from 'material-ui/svg-icons/content/save';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';
import { postSavedSearch } from './../actions/savedSearches';

class FilterBar extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    displayMode: PropTypes.string.isRequired,
    query: PropTypes.shape({
      isStarred: PropTypes.bool,
      query: PropTypes.string,
    }).isRequired,
    leftDrawerVisible: PropTypes.bool.isRequired,
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
        this.props.dispatch(loadSeeks({ query: { isStarred } }));
        break;
      case 'listings':
        this.props.dispatch(loadListings({ query: { isStarred } }));
        break;
      default:
        break;
    }
  }

  saveSearch = () => {
    this.props.dispatch(postSavedSearch(
      `Successfully created saved search ${this.props.query.query}`,
    ));
    this.props.history.push('/savedsearches');
  }

  render() {
    const style = {
      textAlign: 'center',
      width: '100%',
      zIndex: '1',
      ...this.props.style,
    };

    const favoriteButtonStyle = {
      backgroundColor: this.props.query.isStarred ? grey400 : 'transparent',
      float: 'center',
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
        <FlatButton
          secondary
          icon={<SaveIcon />}
          label="Watch Results"
          onTouchTap={this.saveSearch}
          style={{ float: 'right' }}
          disabled={this.props.query.query === ''}
        />
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  displayMode: state.displayMode,
  query: state.currentQuery,
  leftDrawerVisible: state.leftDrawerVisible,
});

export default withRouter(connect(mapStateToProps)(FilterBar));
