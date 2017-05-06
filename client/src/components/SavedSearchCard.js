import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';
import { isNull, omit, omitBy } from 'lodash';
import { stringify } from 'query-string';

import {
  Card,
  CardActions,
  CardHeader,
  CardTitle,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import SearchIcon from 'material-ui/svg-icons/action/search';
import DeleteIcon from 'material-ui/svg-icons/action/delete';

import { loadListings } from './../actions/listings';
import { deleteSavedSearch } from './../actions/savedSearches';

class SavedSearchCard extends React.Component {

  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    onExpandChange: PropTypes.func,
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

  static defaultProps = {
    expanded: false,
    onExpandChange: () => {},
  };

  static styles = {
    cardExpanded: {
      margin: '1.5rem -3rem',
    },
    cardContentsShown: {
      maxHeight: '1000px',
      transition: 'max-height 0.5s ease-in',
      overflow: 'hidden',
    },
    cardContentsHidden: {
      maxHeight: '0',
      transition: 'max-height 0.15s ease-out',
      overflow: 'hidden',
    },
  }

  handleExpandChange = (expanded) => {
    this.props.onExpandChange(expanded, this.props.savedSearch.keyId);
  }

  handleActivate = () => {
    console.log(this.props.savedSearch);
    const query = omitBy(omit(this.props.savedSearch, ['keyId', 'creationDate', 'lastModificationDate']), isNull);
    console.log(query);
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
    const { savedSearch, expanded } = this.props;
    const styles = SavedSearchCard.styles;

    return (
      <Card
        style={expanded ? styles.cardExpanded : {}}
        onExpandChange={this.handleExpandChange}
        expanded={expanded}
      >
        <CardHeader
          title={savedSearch.query}
          actAsExpander
        />

        <div style={expanded ? styles.cardContentsShown : styles.cardContentsHidden}>

          <CardTitle
            title={savedSearch.query}
          />

          <CardActions>
            <FlatButton primary icon={<SearchIcon />} label="Activate" onTouchTap={this.handleActivate} />
            <FlatButton primary icon={<DeleteIcon />} label="Delete" onTouchTap={this.handleDelete} />
          </CardActions>

        </div>
      </Card>
    );
  }
}

export default withRouter(connect()(SavedSearchCard));
