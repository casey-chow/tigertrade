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
  CardTitle,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import EmailIcon from 'material-ui/svg-icons/communication/email';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import LinkIcon from 'material-ui/svg-icons/content/link';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';

import Dialog from 'material-ui/Dialog';
import Chip from 'material-ui/Chip';

import ContactBuyerForm from './ContactBuyerForm';

import { redirectToCas } from '../helpers/cas';
import { mailBuyer } from './../actions/users';
import { editSeek, deleteSeek } from './../actions/seeks';

class SeekCard extends React.Component {

  static propTypes = {
    ...routerPropTypes,
    currentUser: PropTypes.shape({
      keyId: PropTypes.number.isRequired,
      loggedIn: PropTypes.bool.isRequired,
    }),
    dispatch: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    onExpandChange: PropTypes.func,
    seek: PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      userId: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      savedSearchId: PropTypes.number,
      notifyEnabled: PropTypes.bool,
      status: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    currentUser: {
      keyId: -1,
      loggedIn: false,
    },
    expanded: false,
    onExpandChange: () => {},
  }

  static styles = {
    cardExpanded: {
      margin: '1.5rem -3rem',
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
  }


  state = {
    contactOpen: false,
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
    this.props.onExpandChange(expanded, this.props.seek.keyId);
  }

  handleSubmit = (data) => {
    this.props.dispatch(mailBuyer(
      this.props.seek,
      data,
      `Successfully contacted requestor of ${this.props.seek.title}`,
    ));
    this.handleContactClose();
  }

  handleEdit = () => {
    this.props.dispatch(editSeek(this.props.seek));
  }

  handleDelete = () => {
    this.props.dispatch(deleteSeek(
      this.props.seek,
      `Successfully deleted seek ${this.props.seek.title}`,
    ));
  }

  handlePermalinkRedirect = () => {
    this.props.history.push(`/seek/${this.props.seek.keyId}`);
  }

  render() {
    const { seek, expanded } = this.props;
    const styles = SeekCard.styles;

    return (
      <div>
        <Card
          style={expanded ? styles.cardExpanded : {}}
          onExpandChange={this.handleExpandChange}
          expanded={expanded}
        >
          <CardHeader
            title={seek.title}
            actAsExpander
          />

          <div style={expanded ? styles.cardContentsShown : styles.cardContentsHidden}>

            <CardTitle
              title={seek.title}
            />

            { seek.description &&
              <CardText>
                {seek.description}
              </CardText>
            }

            <CardActions>
              { this.props.currentUser.keyId !== seek.userId ?
                <FlatButton primary icon={<EmailIcon />} label="Contact Buyer" onTouchTap={this.handleContactOpen} /> :
              [
                <FlatButton primary icon={<ModeEdit />} label="Edit" onTouchTap={this.handleEdit} key={0} />,
                <FlatButton primary icon={<DeleteIcon />} label="Delete" onTouchTap={this.handleDelete} key={1} />,
              ]
              }

              <FlatButton secondary icon={<FavoriteIcon />} label="Notify Me" />
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
            <Chip style={{ margin: '0.3rem' }}>{this.props.seek.username}@princeton.edu</Chip>
          </div>
          <ContactBuyerForm onSubmit={this.handleSubmit} title={seek.title} initialValues={{ message: `Hi! I'm interested in selling "${seek.title}".` }} />
        </Dialog>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  currentUser: state.currentUser,
});

export default withRouter(connect(mapStateToProps)(SeekCard));
