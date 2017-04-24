import React from 'react';
import PropTypes from 'prop-types';

import {
  Card,
  CardHeader,
  CardTitle,
} from 'material-ui/Card';

class SavedSearchCard extends React.Component {

  static propTypes = {
    expanded: PropTypes.bool.isRequired,
    onExpandChange: PropTypes.func,
    savedSearch: PropTypes.shape({
      keyId: PropTypes.number,
      creationDate: PropTypes.string,
      lastModificationDate: PropTypes.string,
      query: PropTypes.string,
      minPrice: PropTypes.number,
      maxPrice: PropTypes.number,
      listingExpirationDate: PropTypes.string,
      searchExpirationDate: PropTypes.string,
    }).isRequired,
  };

  static defaultProps = {
    expanded: false,
    onExpandChange: () => {},
  };

  handleExpandChange = (expanded) => {
    this.props.onExpandChange(expanded, this.props.savedSearch.keyId);
  }

  render() {
    const { savedSearch, expanded } = this.props;

    const cardStyles = expanded ? {
      margin: '1.5em -3em',
    } : {};

    const onShowStyles = { maxHeight: '1000px', transition: 'max-height 0.5s ease-in', overflow: 'hidden' };
    const onHideStyles = { maxHeight: '0', transition: 'max-height 0.15s ease-out', overflow: 'hidden' };

    return (
      <Card style={cardStyles} onExpandChange={this.handleExpandChange} expanded={expanded}>
        <CardHeader
          title={savedSearch.query}
          actAsExpander
        />

        <div style={expanded ? onShowStyles : onHideStyles}>

          <CardTitle
            title={savedSearch.query}
          />

        </div>
      </Card>
    );
  }
}

export default SavedSearchCard;
