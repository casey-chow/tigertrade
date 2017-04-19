import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  // CardActions,
  CardHeader,
  CardMedia,
  // CardTitle,
  CardText,
} from 'material-ui/Card';

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
    console.log('ListingCard: expanding to', expanded, this.props.listing.keyId);
    this.props.onExpandChange(expanded, this.props.listing.keyId);
  }

  render() {
    const { listing, expanded } = this.props;
    return (
      <Card expanded={expanded} onExpandChange={this.handleExpandChange}>
        <CardHeader
          title={listing.title}
          subtitle={`$${listing.price / 100}`}
          actAsExpander
        />

        <CardMedia expandable>
          <img alt={listing.title} src={listing.thumbnail} style={{ minWidth: undefined, maxHeight: '300px', width: 'auto' }} />
        </CardMedia>

        <CardText expandable>
          {listing.description}
        </CardText>
      </Card>
    );
  }
}

export default ListingCard;
