import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import { isEmpty, omit } from 'lodash';

import { grey300 } from 'material-ui/styles/colors';

import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import SaveIcon from 'material-ui/svg-icons/content/save';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';
import { setExpandAll } from './../actions/ui';
import { postSavedSearch } from './../actions/savedSearches';
import { writeHistory } from '../helpers/query';

const mapStateToProps = state => ({
  displayMode: state.displayMode,
  query: state.currentQuery,
  leftDrawerVisible: state.leftDrawerVisible,
  expandAll: state.expandAll,
});

@withRouter
@connect(mapStateToProps)
export default class FilterBar extends Component {
  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    displayMode: PropTypes.string.isRequired,
    expandAll: PropTypes.bool.isRequired,
    query: PropTypes.shape({
      isStarred: PropTypes.bool,
      query: PropTypes.string,
    }).isRequired,
    leftDrawerVisible: PropTypes.bool.isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    style: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      alignItems: 'center',
      alignContent: 'space-around',
    },
  };

  static styles = {
    base: {
      right: '0',
      position: 'fixed',
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      zIndex: '50',
    },
    priceField: {
      maxWidth: '6.5rem',
      width: '100%',
    },
  }

  state = {
    isStarred: false,
    minPrice: -1,
    maxPrice: -1,
  }

  componentWillMount() {
    this.setState({
      isStarred: this.props.query.isStarred,
      minPrice: this.props.query.minPrice / 100 || '',
      maxPrice: this.props.query.maxPrice / 100 || '',
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      isStarred: nextProps.query.isStarred,
      minPrice: nextProps.query.minPrice / 100 || '',
      maxPrice: nextProps.query.maxPrice / 100 || '',
    });
  }

  handleFavorite = () => {
    const isStarred = !this.props.query.isStarred;
    const query = { isStarred };
    this.setState(query);
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

    writeHistory({ query, history: this.props.history, location: this.props.location });
  }

  handleExpandAllToggle = (event, checked) => {
    this.props.dispatch(setExpandAll(checked));
  }

  handleMinChange = (event, minPrice) => {
    this.setState({ minPrice });
    const query = { minPrice: (minPrice === '') ? undefined : Math.floor(minPrice * 100) };
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

  handleMaxChange = (event, maxPrice) => {
    this.setState({ maxPrice });
    const query = { maxPrice: (maxPrice === '') ? undefined : Math.floor(maxPrice * 100) };
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

  handleWatchButtonTap = () => {
    this.props.dispatch(postSavedSearch(null, 'Successfully created saved search'));
    this.props.history.push('/savedsearches');
  }

  render() {
    const { query, leftDrawerVisible } = this.props;
    const styles = FilterBar.styles;

    return (
      <Paper
        style={{
          ...styles.base,
          left: leftDrawerVisible ? '20vw' : '0',
          ...this.props.style,
        }}
      >
        { (this.props.location.pathname === '/listings') &&
          <TextField
            hintText="Min Price"
            type="number"
            onChange={this.handleMinChange}
            value={this.state.minPrice}
            style={styles.priceField}
            prefix="$"
            min="0"
            step="0.01"
          />
        }
        { (this.props.location.pathname === '/listings') &&
          <TextField
            hintText="Max Price"
            type="number"
            onChange={this.handleMaxChange}
            value={this.state.maxPrice}
            style={styles.priceField}
            prefix="$"
            min="0"
            step="0.01"
          />
        }
        { (this.props.location.pathname === '/listings') &&
          <FlatButton
            secondary
            icon={<FavoriteIcon />}
            label="Favorites Only"
            style={{
              backgroundColor: query.isStarred ? grey300 : 'transparent',
            }}
            onTouchTap={this.handleFavorite}
          />
        }
        { (this.props.location.pathname === '/listings' || this.props.location.pathname === '/seeks') &&
          <div>
            <Toggle
              label="Expand All"
              labelPosition="right"
              toggled={this.props.expandAll}
              onToggle={this.handleExpandAllToggle}
            />
          </div>
        }
        { (this.props.location.pathname === '/listings') &&
          <FlatButton
            primary
            icon={<SaveIcon />}
            label="Watch Results"
            onTouchTap={this.handleWatchButtonTap}
            disabled={isEmpty(omit(query, ['isStarred', 'limit']))}
          />
        }
      </Paper>
    );
  }
}
