import React, { Component } from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import ListingCard from './../components/ListingCard'
import { dummyListings } from './../util/dummyData'
//import './Home.css'

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  gridList: {
    width: 700,
  },
};



class Home extends Component {
  render() {
    return (
      <div className="Home">
         <div style={styles.root}>
            <GridList
              cellHeight={'auto'}
              style={styles.gridList}
            >
              {dummyListings.map((listing) => <ListingCard listing={listing}/>)}
            </GridList>
          </div>
      </div>
    );
  }
}

export default Home;
