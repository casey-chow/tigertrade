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
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Toggle from 'material-ui/Toggle';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import WatchIcon from 'material-ui/svg-icons/action/visibility';
import PhotoIcon from 'material-ui/svg-icons/image/photo';
import ExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import ExpandLessIcon from 'material-ui/svg-icons/navigation/expand-less';

import { loadPosts } from '../actions/common';
import { setExpandAll, toggleFilterBar } from '../actions/ui';
import { loadWatches, postWatch } from '../actions/watches';
import { writeHistory } from '../helpers/query';

const mapStateToProps = state => ({
  displayMode: state.displayMode,
  expanded: state.filterBarExpanded,
  query: state.currentQuery,
  leftDrawerVisible: state.leftDrawerVisible,
  expandAll: state.expandAll,
});

@withRouter
@connect(mapStateToProps)
export default class FilterBar extends Component {
  static propTypes = {
    ...routerPropTypes,
    contentContainer: PropTypes.any.isRequired, // eslint-disable-line react/forbid-prop-types
    dispatch: PropTypes.func.isRequired,
    displayMode: PropTypes.string.isRequired,
    expandAll: PropTypes.bool.isRequired,
    expanded: PropTypes.bool.isRequired,
    query: PropTypes.shape({
      isStarred: PropTypes.bool,
      hasPhotos: PropTypes.bool,
      minPrice: PropTypes.bool,
      maxPrice: PropTypes.bool,
      order: PropTypes.string,
    }).isRequired,
    leftDrawerVisible: PropTypes.bool.isRequired,
    style: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  }

  static defaultProps = {
    style: {
      display: 'flex',
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      alignItems: 'center',
      alignContent: 'space-around',
    },
  };

  static styles = {
    base: {
      minHeight: '4rem',
      right: '0',
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
    expanded: false,
    order: 'creationDateDesc',
    isStarred: false,
    hasPhotos: false,
    minPrice: -1,
    maxPrice: -1,
  }

  componentWillMount() {
    this.setState({
      expanded: this.props.expanded,
      order: this.props.query.order || 'creationDateDesc',
      isStarred: this.props.query.isStarred,
      hasPhotos: this.props.query.hasPhotos,
      minPrice: this.props.query.minPrice / 100 || '',
      maxPrice: this.props.query.maxPrice / 100 || '',
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      expanded: nextProps.expanded,
      order: nextProps.query.order || 'creationDateDesc',
      isStarred: nextProps.query.isStarred,
      hasPhotos: nextProps.query.hasPhotos,
      minPrice: nextProps.query.minPrice / 100 || '',
      maxPrice: nextProps.query.maxPrice / 100 || '',
    });
  }

  handleFavorite = () => {
    const isStarred = !this.props.query.isStarred;
    const query = { isStarred };
    this.setState(query);
    this.props.dispatch(loadPosts(
      this.props.displayMode,
      { query },
    )).then(() => {
      writeHistory(this.props);
    });
  }

  handlePhoto = () => {
    const hasPhotos = !this.props.query.hasPhotos;
    const query = { hasPhotos };
    this.setState(query);
    this.props.dispatch(loadPosts(
      this.props.displayMode,
      { query },
    )).then(() => {
      writeHistory(this.props);
    });
  }

  handleExpandedToggle = () => {
    const expanded = !this.props.expanded;
    this.setState({ expanded });
    this.props.dispatch(toggleFilterBar());
  }

  handleExpandAllToggle = (event, checked) => {
    if (this.props.contentContainer) {
      this.props.contentContainer.scrollTop = 0;
    }
    this.props.dispatch(setExpandAll(checked));
  }

  handleOrder = (event, index, order) => {
    this.setState({ order });
    if (this.props.contentContainer) {
      this.props.contentContainer.scrollTop = 0;
    }
    const query = { order: (order === 'creationDateDesc') ? undefined : order };
    this.props.dispatch(loadPosts(
      this.props.displayMode,
      { query },
    )).then(() => {
      writeHistory(this.props);
    });
  }

  handleMinChange = (event, minPrice) => {
    this.setState({ minPrice });
    const query = { minPrice: (minPrice === '') ? undefined : Math.floor(minPrice * 100) };
    this.props.dispatch(loadPosts(
      this.props.displayMode,
      { query },
    ));
  }

  handleMaxChange = (event, maxPrice) => {
    this.setState({ maxPrice });
    const query = { maxPrice: (maxPrice === '') ? undefined : Math.floor(maxPrice * 100) };
    this.props.dispatch(loadPosts(
      this.props.displayMode,
      { query },
    ));
  }

  handleOnBlur = () => {
    writeHistory(this.props);
  }

  handleWatchButtonTap = () => {
    this.props.dispatch(postWatch(null, 'Successfully watched search'));
    this.props.dispatch(loadWatches());
    this.props.history.push('/watches');
  }

  render() {
    const { query, leftDrawerVisible, location } = this.props;
    const styles = FilterBar.styles;
    const isListing = location.pathname.startsWith('/listings');
    const isSeek = location.pathname.startsWith('/seeks');

    return (
      <div>
        { (isListing || isSeek) &&
          <Paper
            style={{
              ...styles.base,
              left: leftDrawerVisible ? '20vw' : '0',
              ...this.props.style,
            }}
          >
            { isListing &&
              <FlatButton
                primary
                icon={this.state.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                labelPosition="before"
                label={this.state.expanded ? 'Hide Filters' : 'Show Filters'}
                onTouchTap={this.handleExpandedToggle}
              />
            }
            { (isListing || isSeek) &&
              <div>
                <Toggle
                  label="Expand All"
                  labelPosition="right"
                  toggled={this.props.expandAll}
                  onToggle={this.handleExpandAllToggle}
                />
              </div>
            }
            { isListing &&
              <FlatButton
                secondary
                icon={<FavoriteIcon />}
                label="Favorites Only"
                backgroundColor={this.state.isStarred ? grey300 : 'transparent'}
                onTouchTap={this.handleFavorite}
              />
            }
            { isListing &&
              <DropDownMenu
                value={this.state.order}
                onChange={this.handleOrder}
                autoWidth
              >
                <MenuItem value={'creationDateDesc'} primaryText="Most Recently Created" />
                <MenuItem value={'creationDateAsc'} primaryText="Oldest" />
                <MenuItem value={'priceAsc'} primaryText="Cheapest" />
                <MenuItem value={'priceDesc'} primaryText="Most Expensive" />
                <MenuItem value={'expirationDateAsc'} primaryText="Soonest Expiration" />
                <MenuItem value={'expirationDateDesc'} primaryText="Furthest Expiration" />
              </DropDownMenu>
            }
            { (isListing && !location.pathname.startsWith('/listings/mine')) &&
              <FlatButton
                primary
                icon={<WatchIcon />}
                label="Watch this Search"
                onTouchTap={this.handleWatchButtonTap}
                disabled={isEmpty(omit(query, ['isStarred', 'limit', 'hasPhotos', 'order']))}
              />
            }
          </Paper>
        }
        { this.state.expanded && isListing &&
          <Paper
            style={{
              ...styles.base,
              left: leftDrawerVisible ? '20vw' : '0',
              ...this.props.style,
            }}
          >
            <FlatButton
              secondary
              icon={<PhotoIcon />}
              label="Has Photos Only"
              backgroundColor={this.state.hasPhotos ? grey300 : 'transparent'}
              onTouchTap={this.handlePhoto}
            />
            <TextField
              hintText="Max Price"
              type="number"
              onChange={this.handleMaxChange}
              onBlur={this.handleOnBlur}
              value={this.state.maxPrice}
              style={styles.priceField}
              prefix="$"
              min="0"
              step="1"
            />
            <TextField
              hintText="Min Price"
              type="number"
              onChange={this.handleMinChange}
              onBlur={this.handleOnBlur}
              value={this.state.minPrice}
              style={styles.priceField}
              prefix="$"
              min="0"
              step="1"
            />
          </Paper>
        }
      </div>
    );
  }
}
