import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import ListingCard from './ListingCard';
import ListContainer from './ListContainer';

export default class ListingsList extends PureComponent {
  static propTypes = {
    listings: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
    expandAll: PropTypes.bool.isRequired,
  };

  state = { openCardId: -1 };

  // Reset the open card when new listings are inserted.
  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({ openCardId: -1 });
    }
  }

  isExpanded = keyId => this.state.openCardId === keyId;

  handleExpandChange = (expanded, keyId) => {
    if (!expanded) {
      this.setState({ openCardId: -1 });
    } else {
      this.setState({ openCardId: keyId });
    }
  }

  render() {
    return (
      <ListContainer>
        {this.props.listings.map(listing =>
          <ListingCard
            key={listing.keyId}
            expanded={this.props.expandAll || this.isExpanded(listing.keyId)}
            listing={listing}
            onExpandChange={this.handleExpandChange}

          />)
        }
      </ListContainer>
    );
  }
}
