import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Card,
  CardActions,
  CardHeader,
  CardTitle,
  CardText,
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import EmailIcon from 'material-ui/svg-icons/communication/email';
import FavoriteIcon from 'material-ui/svg-icons/action/favorite';
import Dialog from 'material-ui/Dialog';

import ContactBuyerForm from './ContactBuyerForm';
import { mailBuyer } from './../actions/users';

class SeekCard extends React.Component {

  static propTypes = {
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
      savedSearchId: PropTypes.number,
      notifyEnabled: PropTypes.bool,
      status: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    expanded: false,
    onExpandChange: () => {},
  }

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
    this.props.onExpandChange(expanded, this.props.seek.keyId);
  }

  handleSubmit = (data) => {
    this.props.dispatch(mailBuyer(this.props.seek.keyId, data));
    this.handleContactClose();
  }

  render() {
    const { seek, expanded } = this.props;

    const cardStyles = expanded ? {
      margin: '1.5em -3em',
    } : {};

    const onShowStyles = { maxHeight: '1000px', transition: 'max-height 0.5s ease-in', overflow: 'hidden' };
    const onHideStyles = { maxHeight: '0', transition: 'max-height 0.15s ease-out', overflow: 'hidden' };

    const actions = [
/*      <FlatButton
        label="Send"
        primary
        onTouchTap={this.handleClose}
      />,*/
    ];

    return (
      <div>
        <Card style={cardStyles} onExpandChange={this.handleExpandChange} expanded={expanded}>
          <CardHeader
            title={seek.title}
            actAsExpander
          />

          <div style={expanded ? onShowStyles : onHideStyles}>

            <CardTitle
              title={seek.title}
            />

            { seek.description &&
              <CardText>
                {seek.description}
              </CardText>
            }

            <CardActions>
              <FlatButton primary icon={<EmailIcon />} label="Contact Buyer" onTouchTap={this.handleContactOpen} />
              <FlatButton secondary icon={<FavoriteIcon />} label="Notify Me" />
            </CardActions>

          </div>
        </Card>
        <Dialog
          title="Let the seller know you're interested. We'll put you in touch via email:"
          actions={actions}
          modal={false}
          open={this.state.contactOpen}
          onRequestClose={this.handleContactClose}
        >
          <ContactBuyerForm onSubmit={this.handleSubmit} title={seek.title} initialValues={{ message: `Hi! I'm interested in selling "${seek.title}".` }} />
        </Dialog>
      </div>
    );
  }
}

export default connect()(SeekCard);
