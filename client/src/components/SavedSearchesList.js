import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import SavedSearchCard from './SavedSearchCard';
import ListContainer from './ListContainer';

export default class SavedSearchesList extends PureComponent {
  static propTypes = {
    savedSearches: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
    expandAll: PropTypes.bool.isRequired,
  };

  state = {
    openCardId: -1,
  };

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
        {this.props.savedSearches.map(savedSearch =>
          <SavedSearchCard
            key={savedSearch.keyId}
            expanded={this.props.expandAll || this.isExpanded(savedSearch.keyId)}
            savedSearch={savedSearch}
            onExpandChange={this.handleExpandChange}
          />)
        }
      </ListContainer>
    );
  }
}
