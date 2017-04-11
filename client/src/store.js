import {
  applyMiddleware,
  createStore,
  combineReducers,
} from 'redux';
import { reducer } from 'tectonic';

import { reducer as formReducer } from 'redux-form';
import { reducer as uiReducer } from 'redux-ui';
// Middleware and friends
import { createLogger } from 'redux-logger';

const middlewares = [];

if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger({
    collapsed: (getState, action) => {
      return action.type.indexOf('redux-ui') > 0;
    },
  }));
}

const reducers = combineReducers({
  ui: uiReducer,
  form: formReducer,
  tectonic: reducer,
});

const store = createStore(reducers, applyMiddleware(...middlewares));

export default store;
