import React, { Component } from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import ListingCard from './../components/ListingCard'
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

const dummyDate = Date.now();
const dummyListings = [
  {
    keyId: 0,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Chair',
    description: 'Donec non congue ante. Sed blandit, velit sed imperdiet venenatis, odio lorem venenatis risus, nec egestas odio ligula non dolor. Quisque at est nibh. Morbi suscipit elementum diam, non egestas felis porttitor consectetur. Aenean cursus sed metus eu cursus. Phasellus suscipit orci sem, a volutpat turpis vulputate vitae.',
    userId: 0,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/74TZlp9.png'
  },
  {
    keyId: 1,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Did you ever hear the tragedy of Darth Plagueis the Wise?',
    description: 'I thought not. It’s not a story the Jedi would tell you. It’s a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.',
    userId: 1,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/sSyxLmI.png'
  },
  {
    keyId: 0,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Chair',
    description: 'Donec non congue ante. Sed blandit, velit sed imperdiet venenatis, odio lorem venenatis risus, nec egestas odio ligula non dolor. Quisque at est nibh. Morbi suscipit elementum diam, non egestas felis porttitor consectetur. Aenean cursus sed metus eu cursus. Phasellus suscipit orci sem, a volutpat turpis vulputate vitae.',
    userId: 0,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/74TZlp9.png'
  },
  {
    keyId: 1,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Did you ever hear the tragedy of Darth Plagueis the Wise?',
    description: 'I thought not. It’s not a story the Jedi would tell you. It’s a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.',
    userId: 1,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/sSyxLmI.png'
  },
  {
    keyId: 0,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Chair',
    description: 'Donec non congue ante. Sed blandit, velit sed imperdiet venenatis, odio lorem venenatis risus, nec egestas odio ligula non dolor. Quisque at est nibh. Morbi suscipit elementum diam, non egestas felis porttitor consectetur. Aenean cursus sed metus eu cursus. Phasellus suscipit orci sem, a volutpat turpis vulputate vitae.',
    userId: 0,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/74TZlp9.png'
  },
  {
    keyId: 1,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Did you ever hear the tragedy of Darth Plagueis the Wise?',
    description: 'I thought not. It’s not a story the Jedi would tell you. It’s a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.',
    userId: 1,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/sSyxLmI.png'
  },
  {
    keyId: 0,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Chair',
    description: 'Donec non congue ante. Sed blandit, velit sed imperdiet venenatis, odio lorem venenatis risus, nec egestas odio ligula non dolor. Quisque at est nibh. Morbi suscipit elementum diam, non egestas felis porttitor consectetur. Aenean cursus sed metus eu cursus. Phasellus suscipit orci sem, a volutpat turpis vulputate vitae.',
    userId: 0,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/74TZlp9.png'
  },
  {
    keyId: 1,
    creationDate: dummyDate,
    lastModificationDate: dummyDate,
    title: 'Did you ever hear the tragedy of Darth Plagueis the Wise?',
    description: 'I thought not. It’s not a story the Jedi would tell you. It’s a Sith legend. Darth Plagueis was a Dark Lord of the Sith, so powerful and so wise he could use the Force to influence the midichlorians to create life… He had such a knowledge of the dark side that he could even keep the ones he cared about from dying. The dark side of the Force is a pathway to many abilities some consider to be unnatural. He became so powerful… the only thing he was afraid of was losing his power, which eventually, of course, he did. Unfortunately, he taught his apprentice everything he knew, then his apprentice killed him in his sleep. Ironic. He could save others from death, but not himself.',
    userId: 1,
    price: 500,
    status: 'for sale',
    expirationDate: dummyDate + 100000,
    thumbnail: 'https://i.imgur.com/sSyxLmI.png'
  },
];

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
