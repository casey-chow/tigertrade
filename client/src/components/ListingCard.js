import React from 'react';
import PropTypes from 'prop-types';

import {
  Card, 
  CardActions, 
  CardHeader, 
  CardMedia, 
  CardTitle, 
  CardText
} from 'material-ui/Card';

class ListingCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  handleExpandChange = (expanded) => {
    this.setState({expanded: expanded});
  };

  handleToggle = (event, toggle) => {
    this.setState({expanded: toggle});
  };

  handleExpand = () => {
    this.setState({expanded: true});
  };

  handleReduce = () => {
    this.setState({expanded: false});
  };

  render() {
    const {listing} = this.props;
    return (
     <Card expanded = {this.state.expanded} onExpandChange={this.handleExpandChange}>
      <CardHeader title={listing.title} subtitle={'$' + (listing.price / 100)}actAsExpander={true}/>
      
      <CardMedia expandable={true}>
          <img src={listing.thumbnail} style={{minWidth: undefined, maxHeight: '300px', width: 'auto'}}/>
      </CardMedia>

      <CardText expandable={true}>
        {listing.description}
      </CardText>
    </Card>
    );
  }
};

ListingCard.propTypes = {
  listing: PropTypes.shape({
    keyId: PropTypes.number,
    creationDate: PropTypes.number,
    lastModificationDate: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    userId: PropTypes.number,
    price: PropTypes.number,
    status: PropTypes.string,
    expirationDate: PropTypes.number,
    thumbnail: PropTypes.string
  }).isRequired
};

export default ListingCard;
