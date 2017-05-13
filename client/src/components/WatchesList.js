import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import WatchCard from './WatchCard';
import ListContainer from './ListContainer';

export default class WatchesList extends PureComponent {
  static propTypes = {
    watches: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
  };

  render() {
    return (
      <ListContainer>
        {this.props.watches.map(watch =>
          <WatchCard
            key={watch.keyId}
            watch={watch}
          />)
        }
      </ListContainer>
    );
  }
}
