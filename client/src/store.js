import {
  applyMiddleware,
  createStore,
} from 'redux';
import { flowRight } from 'lodash';

import reducers from './reducers';
import middleware from './middleware';

// eslint-disable-next-line no-underscore-dangle
const compose = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || flowRight;
const store = createStore(reducers, compose(applyMiddleware(...middleware)));

export default store;
