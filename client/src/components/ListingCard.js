import React from 'react';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

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
     <Card expanded = {this.state.expanded} onExpandChange={this.handleExpandChange}
     >
      <CardHeader title={listing.title} actAsExpander={true}/>
      
      <CardMedia 
        expandable={true} overlay={<CardTitle title={"$" + (listing.price / 100)} />}>
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
