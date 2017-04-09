import React from 'react';
import {Card, CardActions, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

const ListingCard = (props) => {
  const {listing} = props;

  return (
   <Card style={{width: '30%'}}>
    <CardMedia>
      <img src={listing.thumbnail} />
    </CardMedia>
    <CardTitle title={listing.title}/>
    <CardText>
      {listing.description}
    </CardText>
    <CardActions>
      <FlatButton label="Action1" />
      <FlatButton label="Action2" />
    </CardActions>
  </Card>
  );
};

ListingCard.propTypes = {
  listing: React.PropTypes.shape({
    keyId: React.PropTypes.number,
    creationDate: React.PropTypes.number,
    lastModificationDate: React.PropTypes.number,
    title: React.PropTypes.string,
    description: React.PropTypes.string,
    userId: React.PropTypes.number,
    price: React.PropTypes.number,
    status: React.PropTypes.string,
    expirationDate: React.PropTypes.number,
    thumbnail: React.PropTypes.string
  }).isRequired
};

export default ListingCard;
