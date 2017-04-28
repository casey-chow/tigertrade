import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-grid-system';

import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import SavedSearchCard from './SavedSearchCard';

const fabStyle = {
  position: 'fixed',
  bottom: '35px',
  right: '35px',
};

class SavedSearchesList extends PureComponent {
  static propTypes = {
    savedSearches: PropTypes.arrayOf(PropTypes.shape({
      keyId: PropTypes.number,
    })).isRequired,
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
                    expanded={this.isExpanded(savedSearch.keyId)}
                    savedSearch={savedSearch}
                    onExpandChange={this.handleExpandChange}
                  />)}
              </div>
            </Col>
          </Row>
        </Container>
        <Link to="/compose">
          <FloatingActionButton style={fabStyle}>
            <ContentAdd />
          </FloatingActionButton>
        </Link>
      </div>
    );
  }
}

export default SavedSearchesList;
