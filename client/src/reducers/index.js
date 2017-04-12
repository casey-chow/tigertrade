import { reducer as formReducer } from 'redux-form';
import { reducer as uiReducer } from 'redux-ui';

import { combineReducers } from 'redux';

const listings = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_FAILURE': // TODO: failure state
    case 'LOAD_LISTINGS_REQUEST':
      return [];
    case 'LOAD_LISTINGS_SUCCESS':
      return action.json;
    default:
      return state;
  }
}

const currentUser = (state = { loggedIn: false }, action) => {
  switch (action.type) {
    case 'LOAD_CURRENT_USER_REQUEST': // TODO: failure state
    case 'LOAD_CURRENT_USER_FAILURE':
      return state;
    case 'LOAD_CURRENT_USER_SUCCESS':
      return {
        ...action.json,
        loggedIn: true,
      };
    default:
      return state;
  }
}

const rootReducer = combineReducers({
  listings,
  currentUser,
  ui: uiReducer,
  form: formReducer,
});

export default rootReducer;
