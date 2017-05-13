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
import UnwatchIcon from 'material-ui/svg-icons/action/visibility-off';

import { mediaQueries } from '../helpers/breakpoints';
import { loadListings } from '../actions/listings';
import { deleteWatch } from '../actions/watches';

@withRouter
@connect()
@Radium
export default class WatchCard extends React.Component {

  static propTypes = {
    ...routerPropTypes,
    dispatch: PropTypes.func.isRequired,
    watch: PropTypes.shape({
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
    const query = omitBy(omit(this.props.watch, ['keyId', 'creationDate', 'lastModificationDate']), isNull);
    this.props.dispatch(loadListings({
      query,
      reset: true,
    }));
    this.props.history.push(`/listings?${stringify(query)}`);
  }

  handleDelete = () => {
    this.props.dispatch(deleteWatch(
      this.props.watch,
      'Successfully unwatched search',
    ));
  }

  render() {
    const { watch } = this.props;
    const styles = WatchCard.styles;

    return (
      <div>
        <Style
          scopeSelector=".watch-card-expanded"
          rules={styles.cardExpanded}
        />
        <Card
          expanded
          className="watch-card-expanded"
        >
          { watch.query &&
            <CardHeader
              title={watch.query}
            />
          }

          <div style={styles.cardContentsShown}>

            { (watch.minPrice || watch.minPrice === 0) &&
              <CardText> Minimum Price: {watch.minPrice / 100} </CardText>
            }

            { (watch.maxPrice || watch.maxPrice === 0) &&
              <CardText> Maximum Price: {watch.maxPrice / 100} </CardText>
            }

            <CardActions>
              <FlatButton primary icon={<SearchIcon />} label="Activate" onTouchTap={this.handleActivate} />
              <FlatButton primary icon={<UnwatchIcon />} label="Stop Watching" onTouchTap={this.handleDelete} />
            </CardActions>
          </div>
        </Card>
      </div>
    );
  }
}
