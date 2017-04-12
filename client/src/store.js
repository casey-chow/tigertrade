import {
  applyMiddleware,
  createStore,
} from 'redux';
import { flowRight } from 'lodash';

import reducers from './reducers';
import middleware from './middleware';

const composeEnhancers = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || flowRight;
const store = createStore(reducers, composeEnhancers(applyMiddleware(...middleware)));

export default store;
