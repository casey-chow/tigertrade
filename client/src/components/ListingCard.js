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
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';

import ContactSellerForm from './ContactSellerForm';

class ListingCard extends React.Component {

  static propTypes = {
    expanded: PropTypes.bool.isRequired,
    onExpandChange: PropTypes.func,
    listing: PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      userId: PropTypes.number.isRequired,
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
    contactOpen: false,
  }

  handleContactOpen = () => {
    this.setState({ contactOpen: true });
  };

  handleContactClose = () => {
    this.setState({ contactOpen: false });
  };


  handleExpandChange = (expanded) => {
    this.props.onExpandChange(expanded, this.props.listing.keyId);
  }

  render() {
    const { listing, expanded } = this.props;

    const cardStyles = expanded ? {
      margin: '1.5em -3em',
    } : {};

    const onShowStyles = { maxHeight: '1000px', transition: 'max-height 0.5s ease-in', overflow: 'hidden' };
    const onHideStyles = { maxHeight: '0', transition: 'max-height 0.15s ease-out', overflow: 'hidden' };

    const actions = [
      <FlatButton
        label="Send"
        primary
        onTouchTap={this.handleClose}
      />,
    ];

    return (
      <div>
        <Card style={cardStyles} onExpandChange={this.handleExpandChange} expanded={expanded}>
          <CardHeader
            title={listing.title}
            subtitle={`$${listing.price / 100}`}
            actAsExpander
          />

          <div style={expanded ? onShowStyles : onHideStyles}>

            { listing.thumbnail &&
              <CardMedia>
                <img alt={listing.title} src={listing.thumbnail} style={{ minWidth: undefined, maxHeight: '300px', width: 'auto' }} />
              </CardMedia>
            }

            <CardTitle
              title={listing.title}
            />

            { listing.description &&
              <CardText>
                {listing.description}
              </CardText>
            }

            <CardActions>
              <FlatButton primary icon={<EmailIcon />} label="Contact Seller" onTouchTap={this.handleContactOpen} />
              <FlatButton secondary icon={<FavoriteIcon />} label="Save" />
            </CardActions>

          </div>
        </Card>
        <Dialog
          title="Let the seller know you're interested"
          actions={actions}
          modal={false}
          open={this.state.contactOpen}
          onRequestClose={this.handleContactClose}
        >
          <TextField
            hintText="Hi! I'm interested in buying your item."
            multiLine
            fullWidth
          />
          <ContactSellerForm />
        </Dialog>
      </div>
    );
  }
}

export default ListingCard;
