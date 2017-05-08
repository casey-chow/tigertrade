import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import { Container, Row, Col } from 'react-grid-system';

import { grey300 } from 'material-ui/styles/colors';

import Paper from 'material-ui/Paper';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import SaveIcon from 'material-ui/svg-icons/content/save';

import { loadListings } from './../actions/listings';
import { loadSeeks } from './../actions/seeks';
import { setExpandAll } from './../actions/ui';
import { postSavedSearch } from './../actions/savedSearches';

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
    style: { },
  };

  static styles = {
    base: {
      right: '0',
      position: 'fixed',
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      zIndex: '50',
    },
    favoriteButton: {
      float: 'center',
    },
    expandAllToggle: {
      marginTop: '0.5rem',
    },
    watchButton: {
      position: 'absolute',
      top: '0.5em',
      right: '0',
    },
  }
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

  handleExpandAllToggle = (event, checked) => {
    this.props.dispatch(setExpandAll(checked));
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
        <Container>
          <Row>
            <Col xs={4} />
            <Col xs={2}>
              <div style={{ width: 'max-content' }}>
                <FlatButton
                  icon={<FavoriteIcon />}
                  label="Favorited"
                  style={{
                    ...styles.favoriteButton,
                    backgroundColor: query.isStarred ? grey300 : 'transparent',
                  }}
                  onTouchTap={this.handleFavorite}
                />
              </div>
            </Col>
            <Col xs={2}>
              <Toggle
                style={styles.expandAllToggle}
                toggled={this.props.expandAll}
                onToggle={this.handleExpandAllToggle}
              />
            </Col>
            <Col xs={4} />
          </Row>
        </Container>
        <div style={styles.watchButton}>
          <FlatButton
            secondary
            icon={<SaveIcon />}
            label="Watch Results"
            onTouchTap={this.handleWatchButtonTap}
            disabled={query.query === ''}
          />
        </div>
      </Paper>
    );
  }
}
