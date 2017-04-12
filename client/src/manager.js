import {
  Manager,
  BaseResolver,
} from 'tectonic';
import TectonicSuperagent from 'tectonic-superagent';
import store from './store';

import { routes as listingRoutes } from './models/listings';
import { routes as userRoutes } from './models/users';

const manager = new Manager({
  drivers: {
    fromSuperagent: new TectonicSuperagent(),
  },
  resolver: new BaseResolver(),
  store,
});

manager.fromSuperagent([
  ...listingRoutes,
  ...userRoutes,
]);

export default manager;
