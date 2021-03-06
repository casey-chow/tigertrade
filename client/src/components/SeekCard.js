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
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';

import { grey300 } from 'material-ui/styles/colors';

import EmailIcon from 'material-ui/svg-icons/communication/email';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import WatchIcon from 'material-ui/svg-icons/action/visibility';
import LinkIcon from 'material-ui/svg-icons/content/link';
import ModeEdit from 'material-ui/svg-icons/editor/mode-edit';
import MoneyIcon from 'material-ui/svg-icons/editor/monetization-on';

import Dialog from 'material-ui/Dialog';
import Chip from 'material-ui/Chip';

import ContactBuyerForm from './ContactBuyerForm';

import { mediaQueries } from '../helpers/breakpoints';
import { redirectToCas } from '../helpers/cas';
import { mailBuyer } from './../actions/users';
import { loadSeeks, editSeek, deleteSeek, loadSeek, updateSeek } from './../actions/seeks';
import { postWatch } from './../actions/watches';


const mapStateToProps = state => ({
  currentUser: state.currentUser,
});

@withRouter
@connect(mapStateToProps)
@Radium
export default class SeekCard extends React.Component {

  static propTypes = {
    ...routerPropTypes,
    currentUser: PropTypes.shape({
      keyId: PropTypes.number.isRequired,
      loggedIn: PropTypes.bool.isRequired,
    }),
    dispatch: PropTypes.func.isRequired,
    expanded: PropTypes.bool.isRequired,
    onExpandChange: PropTypes.func,
    singleton: PropTypes.bool,
    seek: PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      userId: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      watchId: PropTypes.number,
      notifyEnabled: PropTypes.bool,
      status: PropTypes.string,
      isActive: PropTypes.bool,
    }).isRequired,
  };

  static defaultProps = {
    currentUser: {
      keyId: -1,
      loggedIn: false,
    },
    singleton: false,
    expanded: false,
    onExpandChange: () => {},
  }

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
      `Successfully deleted buy request ${this.props.seek.title}`,
    )).then(() => {
      if (this.props.singleton) {
        this.props.dispatch(loadSeeks({ query: { isMine: true }, reset: true }));
        this.props.history.push('/seeks/mine');
      } else {
        this.props.dispatch(loadSeeks({}));
      }
    });
  }

  handleStar = () => {
    this.props.dispatch(postWatch(
      { query: this.props.seek.title },
      'Successfully watched for matching listings',
    ));
  }

  handleBought = () => {
    this.props.dispatch(updateSeek({
      ...this.props.seek,
      isActive: !this.props.seek.isActive,
    })).then(() => {
      if (this.props.singleton) {
        this.props.dispatch(loadSeek(this.props.seek.keyId));
      } else {
        this.props.dispatch(loadSeeks({}));
      }
    });
  }

  formatDescription = description => description.split('\n').map(line => <p key={line}>{line}</p>);

  render() {
    const { seek, expanded } = this.props;
    const styles = SeekCard.styles;

    const boughtButtonBackground = this.props.seek.isActive ? 'transparent' : grey300;

    return (
      <div>
        <Style
          scopeSelector=".seek-card-expanded"
          rules={styles.cardExpanded}
        />
        <Card
          onExpandChange={this.handleExpandChange}
          expanded={expanded}
          className={expanded && 'seek-card-expanded'}
        >
          <CardHeader
            title={seek.title}
            actAsExpander
          />

          <div style={expanded ? styles.cardContentsShown : styles.cardContentsHidden}>

            { seek.description &&
              <CardText>
                {this.formatDescription(seek.description)}
              </CardText>
            }

            <CardActions>
              { this.props.currentUser.keyId !== seek.userId ?
                <FlatButton primary icon={<EmailIcon />} label="Contact Buyer" onTouchTap={this.handleContactOpen} /> :
              [
                <FlatButton primary icon={<ModeEdit />} label="Edit" onTouchTap={this.handleEdit} key={0} />,
                <FlatButton primary icon={<DeleteIcon />} label="Delete" onTouchTap={this.handleDelete} key={1} />,
                <FlatButton primary icon={<MoneyIcon />} backgroundColor={boughtButtonBackground} label="Mark as Bought" onTouchTap={this.handleBought} key={2} />,
              ]
              }

              <FlatButton primary icon={<WatchIcon />} label="Notify Me" onTouchTap={this.handleStar} />
              <Link to={`/seek/${this.props.seek.keyId}`}><FlatButton icon={<LinkIcon />} label="Permalink" /></Link>
            </CardActions>

          </div>
        </Card>
        <Dialog
          title="Contact Buyer"
          modal={false}
          open={this.state.contactOpen}
          onRequestClose={this.handleContactClose}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '-0.35rem', marginBottom: '0.625rem' }}>
            <div style={{ margin: '0.25rem 0 0.5rem' }}>
              If you are interested in answering this buy request, you can let the
              buyer know here. We&rsquo;ll send them an email about your interest
              so that you can further discuss and make plans.
            </div>
            <div style={{ margin: '10px 0.625rem 0 0' }}>To:</div>
            <Chip style={{ margin: '0.3rem 0 1rem' }}>{this.props.seek.username}@princeton.edu</Chip>
          </div>
          <ContactBuyerForm
            onSubmit={this.handleSubmit}
            title={seek.title}
            initialValues={{ message: `Hi! I'm interested in selling "${seek.title}".` }}
          />
        </Dialog>
      </div>
    );
  }
}
