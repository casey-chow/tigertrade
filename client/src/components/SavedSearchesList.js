import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Container, Row, Col } from 'react-grid-system';

import SavedSearchCard from './SavedSearchCard';

class SavedSearchesList extends PureComponent {
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
    console.log('handleExpandChange', this);
    if (!expanded) {
      this.setState({ openCardId: -1 });
    } else {
      this.setState({ openCardId: keyId });
    }
  }

  render() {
    return (
      <div>
        <Container className="SavedSearchesList">
          <Row>
            <Col xs={1} />
            <Col xs={10}>
              <div className="cardsContainer">
                {this.props.savedSearches.map(savedSearch =>
                  <SavedSearchCard
                    key={savedSearch.keyId}
                    expanded={this.props.expandAll || this.isExpanded(savedSearch.keyId)}
                    savedSearch={savedSearch}
                    onExpandChange={this.handleExpandChange}
                  />)}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default SavedSearchesList;
