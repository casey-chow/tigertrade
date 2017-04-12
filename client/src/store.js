import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import { compose } from 'lodash';
import { reducer } from 'tectonic';

import { reducer as formReducer } from 'redux-form';
import { reducer as uiReducer } from 'redux-ui';
// Middleware and friends
import { createLogger } from 'redux-logger';

const logger = createLogger({
  collapsed: (getState, action) => {
    return action.type.indexOf('redux-ui') > 0;
  },
});

const reducers = combineReducers({
  ui: uiReducer,
  form: formReducer,
  tectonic: reducer,
});

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, composeEnhancers(applyMiddleware(logger)));

export default store;
