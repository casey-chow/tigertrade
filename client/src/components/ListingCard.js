import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Link,
  withRouter,
  propTypes as routerPropTypes,
} from 'react-router-dom';
import Radium, { Style } from 'radium';

import {
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import Chip from 'material-ui/Chip';

import { grey300 } from 'material-ui/styles/colors';

import EmailIcon from 'material-ui/svg-icons/communication/email';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import LinkIcon from 'material-ui/svg-icons/content/link';

import Lightbox from 'react-images';

import ContactSellerForm from './ContactSellerForm';

import { mediaQueries } from '../helpers/breakpoints';
import { redirectToCas } from '../helpers/cas';
import { mailSeller } from './../actions/users';
import { editListing, deleteListing, starListing } from './../actions/listings';

import './ListingCard.css';

const mapStateToProps = state => ({
  currentUser: state.currentUser,
});

@withRouter
@connect(mapStateToProps)
@Radium
export default class ListingCard extends React.Component {

  static propTypes = {
    ...routerPropTypes,
    currentUser: PropTypes.shape({
      keyId: PropTypes.number,
      loggedIn: PropTypes.bool,
    }).isRequired,
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
      isStarred: PropTypes.bool,
      expirationDate: PropTypes.number,
      thumbnail: PropTypes.string,
      photos: PropTypes.array,
    }).isRequired,
  };

  static defaultProps = {
    currentUser: {
      keyId: -1,
      loggedIn: false,
    },
    expanded: false,
    onExpandChange: () => {},
  };

  static styles = {
    // Using a stupid style hack with classes to make this work
    // with Material UI, because Material UI is pretty shit for styling.
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
    cardContentsHidden: {
      maxHeight: '0',
      transition: 'max-height 0.15s ease-out',
      overflow: 'hidden',
    },
    thumbnail: {
      minWidth: undefined,
      maxHeight: '300px',
      width: 'auto',
    },
  }

  state = {
    contactOpen: false,
    lightboxImage: -1,
    lightboxOpen: false,
  }

  handleContactOpen = () => {
    if (!this.props.currentUser.loggedIn) {
      redirectToCas();
      return;
    }

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

  handleEdit = () => {
    this.props.dispatch(editListing(this.props.listing));
  }

  handleDelete = () => {
    this.props.dispatch(deleteListing(
      this.props.listing,
      `Successfully deleted listing ${this.props.listing.title}`,
    ));
  }

  handleStar = () => {
    this.props.dispatch(starListing(
      this.props.listing,
    ));
  }

  render() {
    const { listing, expanded } = this.props;
    const styles = ListingCard.styles;

    const favoriteButtonStyle = {
      backgroundColor: this.props.listing.isStarred ? grey300 : 'transparent',
    };

    return (
      <div>
        <Style
          scopeSelector=".listing-card-expanded"
          rules={styles.cardExpanded}
        />
        <Card
          onExpandChange={this.handleExpandChange}
          expanded={expanded}
          className={expanded && 'listing-card-expanded'}
        >
          <CardHeader
            title={listing.title}
            subtitle={`$${listing.price / 100}`}
            actAsExpander
          />

          <div style={expanded ? styles.cardContentsShown : styles.cardContentsHidden}>

            { listing.photos && listing.photos.length > 0 &&

              <CardMedia>
                <div className="wrapper">
                  <div className="scrolls">
                    <div className="imageDiv">
                      {
                        listing.photos.map(
                          (image, i) =>
                            <button
                              key={image}
                              onClick={
                                event => this.setState({ lightboxImage: i, lightboxOpen: true })
                              }
                            >
                              <img alt="listing" src={image} />
                            </button>,
                          )
                      }
                    </div>
                  </div>
                </div>
                { this.state.lightboxOpen &&
                <Lightbox
                  images={listing.photos.map(image => ({ src: image }))}
                  onClose={() => this.setState({ lightboxOpen: false })}
                  isOpen={this.state.lightboxOpen}
                  currentImage={this.state.lightboxImage}
                  onClickNext={() => this.setState({ lightboxImage: this.state.lightboxImage + 1 })}
                  onClickPrev={() => this.setState({ lightboxImage: this.state.lightboxImage - 1 })}
                  backdropClosesModal
                /> }
              </CardMedia>
            }

            { listing.description &&
              <CardText>
                {listing.description}
              </CardText>
            }

            <CardActions>
              { this.props.currentUser.keyId !== listing.userId ?
                <FlatButton primary icon={<EmailIcon />} label="Contact Seller" onTouchTap={this.handleContactOpen} /> :
              [
                <FlatButton primary icon={<ModeEdit />} label="Edit" onTouchTap={this.handleEdit} key={0} />,
                <FlatButton primary icon={<DeleteIcon />} label="Delete" onTouchTap={this.handleDelete} key={1} />,
              ]
              }

              <FlatButton secondary icon={<FavoriteIcon />} style={favoriteButtonStyle} label="Favorite" onTouchTap={this.handleStar} />
              <Link to={`/listing/${this.props.listing.keyId}`}><FlatButton icon={<LinkIcon />} label="Permalink" /></Link>
            </CardActions>

          </div>
        </Card>
        {this.state.contactOpen &&
          <Dialog
            title="Contact Seller"
            modal={false}
            open={this.state.contactOpen}
            onRequestClose={this.handleContactClose}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                If you are interested in this item, you can let the seller know here.
                We&rsquo;ll send the seller an email about your interest so that you
                can further discuss and make plans.
              </div>
              <div style={{ margin: '10px 0.625rem 0 0' }}>To:</div>
              <Chip style={{ margin: '0.3rem 0 1rem' }}>{this.props.listing.username}@princeton.edu</Chip>
            </div>
            <ContactSellerForm
              onSubmit={this.handleSubmit}
              initialValues={{ message: `Hi! I'm interested in buying "${listing.title}".` }}
            />
          </Dialog>
        }
      </div>
    );
  }
}
