import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import EmailIcon from 'material-ui/svg-icons/communication/email';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';

class ListingCard extends React.Component {

  static propTypes = {
    expanded: PropTypes.bool.isRequired,
    onExpandChange: PropTypes.func,
    listing: PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      userId: PropTypes.number,
      price: PropTypes.number,
      status: PropTypes.string,
      expirationDate: PropTypes.number,
      thumbnail: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    expanded: false,
    onExpandChange: () => {},
  };

  state = {
    expanded: false,
  }

  handleExpandChange = (expanded) => {
    this.props.onExpandChange(expanded, this.props.listing.keyId);
    this.setState({ expanded });
  }

  render() {
    const { listing, expanded } = this.props;

    const cardStyles = expanded ? {
      margin: '1.5em -3em',
    } : {};

    const onShowStyles = { maxHeight: '1000px', transition: 'max-height 0.5s ease-in', overflow: 'hidden' };
    const onHideStyles = { maxHeight: '0', transition: 'max-height 0.15s ease-out', overflow: 'hidden' };

    return (
      <Card style={cardStyles} onExpandChange={this.handleExpandChange} expanded={expanded}>
        <CardHeader
          title={listing.title}
          subtitle={`$${listing.price / 100}`}
          actAsExpander
        />

        <div style={expanded ? onShowStyles : onHideStyles}>

          <CardMedia>
            <img alt={listing.title} src={listing.thumbnail} style={{ minWidth: undefined, maxHeight: '300px', width: 'auto' }} />
          </CardMedia>

          <CardTitle
            title={listing.title}
          />

          <CardText>
            {listing.description}
          </CardText>

          <CardActions>
            <FlatButton primary icon={<EmailIcon />} label="Contact Seller" />
            <FlatButton secondary icon={<FavoriteIcon />} label="Save" />
          </CardActions>

        </div>
      </Card>
    );
  }
}

export default ListingCard;
