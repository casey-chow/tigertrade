import { Model } from 'tectonic';

export default class Listing extends Model {
  static modelName = 'listing';
  static idField = 'keyId';

  static fields = {
    keyId: 0,
    creationDate: new Date(),
    lastModificationDate: new Date(),
    title: '',
    description: '',
    userId: 0,
    price: 0,
    status: '',
    expirationDate: new Date(),
    thumbnail: ''
  }
}

export const routes = [
  {
    meta: {
      url: `${process.env.REACT_APP_SERVER_ROOT}/api/listings`,
    },
    returns: Listing.list(),
  },
];
