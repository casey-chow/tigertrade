import React, { PureComponent, PropTypes } from 'react';
import load, { Status } from 'tectonic';

import {GridList, GridTile} from 'material-ui/GridList';
import ListingCard from '../components/ListingCard'
//import './Home.css'

import ListingModel from '../models/listings'

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

@load((props) => ({
  listings: ListingModel.getList(),
}))
export default class Home extends PureComponent {
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
         <div style={styles.root}>
            <GridList
              cellHeight={'auto'}
              style={styles.gridList}
            >
              {this.props.listings.map((listing) => <ListingCard listing={listing}/>)}
            </GridList>
          </div>
      </div>
    );
  }
}

