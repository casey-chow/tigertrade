import { reducer as formReducer } from 'redux-form';
import { reducer as uiReducer } from 'redux-ui';

import { combineReducers } from 'redux';

const listings = (state, action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_FAILURE': // TODO: failure state
    case 'LOAD_LISTINGS_REQUEST':
      return [];
    case 'LOAD_LISTINGS_SUCCESS':
      return action.json;
    default:
      return [];
  }
}

const rootReducer = combineReducers({
  listings,
  ui: uiReducer,
  form: formReducer,
});

export default rootReducer;
