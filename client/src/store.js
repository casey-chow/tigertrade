import {
  applyMiddleware,
  createStore,
} from 'redux';
import { flowRight } from 'lodash';
import { persistStore, autoRehydrate } from 'redux-persist';

import reducers from './reducers';
import middleware from './middleware';

// eslint-disable-next-line no-underscore-dangle
const compose = (window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || flowRight;
const store = createStore(reducers, undefined, compose(
  autoRehydrate(),
  applyMiddleware(...middleware),
));

persistStore(store, {
  whitelist: [
    'composeState',
    'form',
    'expandAll',
  ],
});

export default store;
