import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';

import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Chip from 'material-ui/Chip';

import EmailIcon from 'material-ui/svg-icons/communication/email';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import LinkIcon from 'material-ui/svg-icons/content/link';

import ContactSellerForm from './ContactSellerForm';
import { mailSeller } from './../actions/users';
import { deleteListing } from './../actions/listings';

class ListingCard extends React.Component {

  static propTypes = {
    ...routerPropTypes,
    currentUserId: PropTypes.number,
    dispatch: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    onExpandChange: PropTypes.func,
    listing: PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      userId: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      price: PropTypes.number,
      status: PropTypes.string,
      expirationDate: PropTypes.number,
      thumbnail: PropTypes.string,
    }).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    query: PropTypes.object,
  };

  static defaultProps = {
    query: { query: '' },
    currentUserId: -1,
    expanded: false,
    onExpandChange: () => {},
  };

  state = {
    contactOpen: false,
  }

  handleContactOpen = () => {
    this.setState({ contactOpen: true });
  }

  handleContactClose = () => {
    this.setState({ contactOpen: false });
  }


  handleExpandChange = (expanded) => {
    this.props.onExpandChange(expanded, this.props.listing.keyId);
  }

  handleSubmit = (data) => {
    this.props.dispatch(mailSeller(
      this.props.listing,
      data,
      `Successfully contacted seller for ${this.props.listing.title}`,
    ));
    this.handleContactClose();
  }

  handleDelete = () => {
    this.props.dispatch(deleteListing(
      this.props.listing,
      this.props.query,
      `Successfully deleted listing ${this.props.listing.title}`,
    ));
  }

  handlePermalinkRedirect = () => {
    this.props.history.push(`/listing/${this.props.listing.keyId}`);
  }

  render() {
    const { listing, expanded } = this.props;

    const cardStyles = expanded ? {
      margin: '1.5rem -3rem',
    } : {};

    const onShowStyles = { maxHeight: '1000px', transition: 'max-height 0.5s ease-in', overflow: 'hidden' };
    const onHideStyles = { maxHeight: '0', transition: 'max-height 0.15s ease-out', overflow: 'hidden' };

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
              { this.props.currentUserId !== listing.userId ?
                <FlatButton primary icon={<EmailIcon />} label="Contact Seller" onTouchTap={this.handleContactOpen} /> :
                <FlatButton primary icon={<DeleteIcon />} label="Delete" onTouchTap={this.handleDelete} />
              }
              <FlatButton secondary icon={<FavoriteIcon />} label="Save" />
              <FlatButton icon={<LinkIcon />} label="Permalink" onTouchTap={this.handlePermalinkRedirect} />
            </CardActions>

          </div>
        </Card>
        <Dialog
          title="Let the seller know you're interested. We'll put you in touch via email:"
          modal={false}
          open={this.state.contactOpen}
          onRequestClose={this.handleContactClose}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '-0.35rem', marginBottom: '0.625rem' }}>
            <div style={{ margin: '0.625rem' }}>To:</div>
            <Chip style={{ margin: '0.3rem' }}>{this.props.listing.username}@princeton.edu</Chip>
          </div>
          <ContactSellerForm onSubmit={this.handleSubmit} initialValues={{ message: `Hi! I'm interested in buying "${listing.title}".` }} />
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentUserId: state.currentUser.keyId,
  query: state.currentQuery,
});

export default withRouter(connect(mapStateToProps)(ListingCard));
