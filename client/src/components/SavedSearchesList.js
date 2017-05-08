import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import SavedSearchCard from './SavedSearchCard';
import ListContainer from './ListContainer';

export default class SavedSearchesList extends PureComponent {
  static propTypes = {
    savedSearches: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
  };

  render() {
    return (
      <ListContainer>
        {this.props.savedSearches.map(savedSearch =>
          <SavedSearchCard
            key={savedSearch.keyId}
            savedSearch={savedSearch}
          />)
        }
      </ListContainer>
    );
  }
}
