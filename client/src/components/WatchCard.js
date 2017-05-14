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

import { grey300 } from 'material-ui/styles/colors';

import {
  Card,
  CardActions,
  CardHeader,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import SearchIcon from 'material-ui/svg-icons/action/search';
import UnwatchIcon from 'material-ui/svg-icons/action/visibility-off';
import MailOutlineIcon from 'material-ui/svg-icons/communication/mail-outline';

import { mediaQueries } from '../helpers/breakpoints';
import { loadListings } from '../actions/listings';
import { loadWatches, deleteWatch, updateWatch } from '../actions/watches';

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
      isActive: PropTypes.bool,
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
    )).then(() => {
      this.props.dispatch(loadWatches());
    });
  }

  handleNotify = () => {
    this.props.dispatch(updateWatch({
      ...this.props.watch,
      isActive: !this.props.watch.isActive,
    })).then(() => {
      this.props.dispatch(loadWatches());
    });
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
              <FlatButton
                primary
                icon={<SearchIcon />}
                label="View Results"
                onTouchTap={this.handleActivate}
              />
              <FlatButton
                primary
                icon={<UnwatchIcon />}
                label="Stop Watching"
                onTouchTap={this.handleDelete}
              />
              <FlatButton
                primary
                icon={<MailOutlineIcon />}
                label={this.props.watch.isActive ? 'Email New Matches On' : 'Email New Matches Off'}
                backgroundColor={this.props.watch.isActive ? grey300 : 'transparent'}
                onTouchTap={this.handleNotify}
              />
            </CardActions>
          </div>
        </Card>
      </div>
    );
  }
}
