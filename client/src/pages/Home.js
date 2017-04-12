import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import load, { Status } from 'tectonic';
import ListingCard from './../components/ListingCard'
import ListingModel from '../models/listings'
import { Container, Row, Col } from 'react-grid-system';
import './Home.css'

// react-grid-system: https://github.com/JSxMachina/react-grid-system

@load((props) => ({
  listings: ListingModel.getList(),
})) 
class Home extends PureComponent {
  static propTypes = {
    // automatically injected status models, containing the http response
    // code, any error messages, and the overall status of the query
    status: PropTypes.shape({
      listings: PropTypes.instanceOf(Status),
    }),

    // data loaded w/ tectonic
    listings: PropTypes.arrayOf(PropTypes.instanceOf(ListingModel)),
  }

  render() {
    return (
      <div className="Home">
        <Container>
        <Row>
        <Col xs={12}>
        <div className="cardsContainer">
          {this.props.listings.map((listing) => <ListingCard listing={listing}/>)}
        </div>
        </Col>
        </Row>
        </Container>
      </div>
    );
  }
}

export default Home;
