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

  /**
   * Returns either the name or the URL of the page for use as the title
   */
  title() {
    if (this.name !== '') {
      return this.name;
    }
    return this.url;
  }
}

export const routes = [
  {
    meta: {
      url: `${process.env.PUBLIC_URL}/api/listings`,
    },
    returns: Listing.list(),
  },
];
