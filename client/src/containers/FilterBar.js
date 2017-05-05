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
// import { setExpandAll } from './../actions/ui';

class FilterBar extends Component {
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
    this.props.dispatch(postSavedSearch('Successfully created saved search'));
    this.props.history.push('/savedsearches');
  }

  render() {
    const style = {
      right: '0',
      position: 'fixed',
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      left: this.props.leftDrawerVisible ? '20vw' : '0',
      zIndex: '50',
      ...this.props.style,
    };

    const favoriteButtonStyle = {
      backgroundColor: this.props.query.isStarred ? grey300 : 'transparent',
      float: 'center',
    };

    const expandAllToggleStyle = {
      marginTop: '0.5rem',
    };

    return (
      <Paper style={style}>
        <Container>
          <Row>
            <Col xs={4} />
            <Col xs={2}>
              <div style={{ width: 'max-content' }}>
                <FlatButton
                  icon={<FavoriteIcon />}
                  label="Favorited"
                  style={favoriteButtonStyle}
                  onTouchTap={this.handleFavorite}
                />
              </div>
            </Col>
            <Col xs={2}>
              <Toggle
                style={expandAllToggleStyle}
                toggled={this.props.expandAll}
                onToggle={(event, checked) => this.props.dispatch(setExpandAll(checked))}
              />
            </Col>
            <Col xs={4} />
          </Row>
        </Container>
        <div style={{ position: 'absolute', top: '0.5em', right: '0' }}>
          <FlatButton
            secondary
            icon={<SaveIcon />}
            label="Watch Results"
            onTouchTap={this.saveSearch}
            disabled={this.props.query.query === ''}
          />
        </div>
      </Paper>
    );
  }
}

const mapStateToProps = state => ({
  displayMode: state.displayMode,
  query: state.currentQuery,
  leftDrawerVisible: state.leftDrawerVisible,
  expandAll: state.expandAll,
});

export default withRouter(connect(mapStateToProps)(FilterBar));
