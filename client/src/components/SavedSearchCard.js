import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';
import { isNull, omit, omitBy } from 'lodash';
import { stringify } from 'query-string';
import Radium, { Style } from 'radium';

import {
  Card,
  CardActions,
  CardHeader,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import SearchIcon from 'material-ui/svg-icons/action/search';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

import { mediaQueries } from '../helpers/breakpoints';
import { loadListings } from './../actions/listings';
import { deleteSavedSearch } from './../actions/savedSearches';

@withRouter
@connect()
@Radium
export default class SavedSearchCard extends React.Component {

  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    savedSearch: PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      query: PropTypes.string,
      minPrice: PropTypes.number,
      maxPrice: PropTypes.number,
      listingExpirationDate: PropTypes.string,
      searchExpirationDate: PropTypes.string,
    }).isRequired,
  };

  static styles = {
    cardExpanded: {
      margin: '1.5rem 0',
      mediaQueries: {
        [mediaQueries.mediumUp]: {
          margin: '1.5rem -3rem',
        },
      },
    },
    cardContentsShown: {
      maxHeight: '1000px',
      transition: 'max-height 0.5s ease-in',
      overflow: 'hidden',
    },
  }

  handleActivate = () => {
    const query = omitBy(omit(this.props.savedSearch, ['keyId', 'creationDate', 'lastModificationDate']), isNull);
    this.props.dispatch(loadListings({
      query,
      reset: true,
    }));
    this.props.history.push(`/listings?${stringify(query)}`);
  }

  handleDelete = () => {
    this.props.dispatch(deleteSavedSearch(
      this.props.savedSearch,
      'Successfully deleted saved search',
    ));
  }

  render() {
    const { savedSearch } = this.props;
    const styles = SavedSearchCard.styles;

    return (
      <div>
        <Style
          scopeSelector=".savedsearch-card-expanded"
          rules={styles.cardExpanded}
        />
        <Card
          expanded
          className="savedsearch-card-expanded"
        >
          { savedSearch.query &&
            <CardHeader
              title={savedSearch.query}
            />
          }

          <div style={styles.cardContentsShown}>

            { (savedSearch.minPrice || savedSearch.minPrice === 0) &&
              <CardText> Minimum Price: {savedSearch.minPrice / 100} </CardText>
            }

            { (savedSearch.maxPrice || savedSearch.maxPrice === 0) &&
              <CardText> Maximum Price: {savedSearch.maxPrice / 100} </CardText>
            }

            <CardActions>
              <FlatButton primary icon={<SearchIcon />} label="Activate" onTouchTap={this.handleActivate} />
              <FlatButton primary icon={<DeleteIcon />} label="Delete" onTouchTap={this.handleDelete} />
            </CardActions>

          </div>
        </Card>
      </div>
    );
  }
}
