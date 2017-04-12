import { Model } from 'tectonic';

export default class User extends Model {
  static modelName = 'user';
  static idField = 'keyId';

  static fields = {
    keyId: 0,
    creationDate: new Date(),
    lastModificationDate: new Date(),
    netId: '',
  }
}

export const routes = [
  {
    params: ['id'],
    meta: {
      url: `${process.env.REACT_APP_SERVER_ROOT}/api/users/:id`,
    },
    returns: User.item(),
  },
];
