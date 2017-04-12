import {
  applyMiddleware,
  createStore,
} from 'redux';
import { compose } from 'lodash';

import reducers from './reducers';
import middleware from './middleware';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, composeEnhancers(applyMiddleware(...middleware)));

export default store;
