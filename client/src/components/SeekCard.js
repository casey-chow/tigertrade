import React from 'react';
import PropTypes from 'prop-types';

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

class SeekCard extends React.Component {

  static propTypes = {
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
  };

  handleExpandChange = (expanded) => {
    this.props.onExpandChange(expanded, this.props.seek.keyId);
  }

  render() {
    const { seek, expanded } = this.props;

    const cardStyles = expanded ? {
      margin: '1.5em -3em',
    } : {};

    const onShowStyles = { maxHeight: '1000px', transition: 'max-height 0.5s ease-in', overflow: 'hidden' };
    const onHideStyles = { maxHeight: '0', transition: 'max-height 0.15s ease-out', overflow: 'hidden' };

    return (
      <Card style={cardStyles} onExpandChange={this.handleExpandChange} expanded={expanded}>
        <CardHeader
          title={seek.title}
          actAsExpander
        />

        <div style={expanded ? onShowStyles : onHideStyles}>

          <CardTitle
            title={seek.title}
          />

          <CardText>
            {seek.description}
          </CardText>

          <CardActions>
            <FlatButton primary icon={<EmailIcon />} label="Contact Buyer" />
            <FlatButton secondary icon={<FavoriteIcon />} label="Notify Me" />
          </CardActions>

        </div>
      </Card>
    );
  }
}

export default SeekCard;
