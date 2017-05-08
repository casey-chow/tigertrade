import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import SeekCard from './SeekCard';
import ListContainer from './ListContainer';

export default class SeeksList extends PureComponent {
  static propTypes = {
    seeks: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
    expandAll: PropTypes.bool.isRequired,
  };

  state = {
    openCardId: -1,
  };

  // Reset the open card when new seeks are inserted.
  componentWillReceiveProps(nextProps) {
    if (this.props.seeks.length > nextProps.seeks.length) {
      this.setState({ openCardId: -1 });
    }

    if (this.state.openCardId !== -1) {
      for (let i = 0; i < this.props.seeks.length; i += 1) {
        if (this.props.seeks[i].keyId !== nextProps.seeks[i].keyId) {
          this.setState({ openCardId: -1 });
          break;
        }
      }
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
        {this.props.seeks.map(seek =>
          <SeekCard
            key={seek.keyId}
            expanded={this.props.expandAll || this.isExpanded(seek.keyId)}
            seek={seek}
            onExpandChange={this.handleExpandChange}
          />)
        }
      </ListContainer>
    );
  }
}
