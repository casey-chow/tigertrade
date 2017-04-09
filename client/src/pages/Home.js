import React, { Component } from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import ListingCard from './../components/ListingCard'
import { dummyListings } from './../util/dummyData'
import { Container, Row, Col } from 'react-grid-system';
import './Home.css'


class Home extends Component {
  render() {
    return (
      <div className="Home">
        <Container>
        <Row>
        <Col sm={12}>
        <div className="cardsContainer">
          {dummyListings.map((listing) => <ListingCard listing={listing}/>)}
        </div>
        </Col>
        </Row>
        </Container>
      </div>
    );
  }
}

export default Home;
