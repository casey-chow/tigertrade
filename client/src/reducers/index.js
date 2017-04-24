import { reducer as formReducer } from 'redux-form';
import { reducer as uiReducer } from 'redux-ui';

import { combineReducers } from 'redux';

const listingsLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_REQUEST':
      return true;
    case 'LOAD_LISTINGS_SUCCESS':
    case 'LOAD_LISTINGS_FAILURE':
      return false;
    default:
      return state;
  }
};

const listings = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_LISTINGS_SUCCESS':
      return action.json;
    case 'LOAD_LISTINGS_REQUEST':
    default:
      return state;
  }
};

const seeksLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_SEEKS_REQUEST':
      return true;
    case 'LOAD_SEEKS_SUCCESS':
    case 'LOAD_SEEKS_FAILURE':
      return false;
    default:
      return state;
  }
};

const seeks = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_SEEKS_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_SEEKS_SUCCESS':
      return action.json;
    case 'LOAD_SEEKS_REQUEST':
    default:
      return state;
  }
};

const savedSearchesLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_SAVEDSEARCHES_REQUEST':
      return true;
    case 'LOAD_SAVEDSEARCHES_SUCCESS':
    case 'LOAD_SAVEDSEARCHES_FAILURE':
      return false;
    default:
      return state;
  }
};

const savedSearches = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_SAVEDSEARCHES_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_SAVEDSEARCHES_SUCCESS':
      return action.json;
    case 'LOAD_SAVEDSEARCHES_REQUEST':
    default:
      return state;
  }
};

const currentUserLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_CURRENT_USER_REQUEST':
      return true;
    case 'LOAD_CURRENT_USER_FAILURE':
    case 'LOAD_CURRENT_USER_SUCCESS':
      return false;
    default:
      return state;
  }
};

const currentUser = (state = { loggedIn: false }, action) => {
  switch (action.type) {
    case 'LOAD_CURRENT_USER_REQUEST': // TODO: failure state
    case 'LOAD_CURRENT_USER_FAILURE':
      return { loggedIn: false };
    case 'LOAD_CURRENT_USER_SUCCESS':
      return {
        ...action.json,
        loggedIn: true,
      };
    default:
      return state;
  }
};

const currentQuery = (state = '', action) => {
  switch (action.type) {
    case 'SET_CURRENT_LISTINGS_QUERY':
      return decodeURIComponent(action.query);
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  listingsLoading,
  listings,
  seeksLoading,
  seeks,
  savedSearchesLoading,
  savedSearches,
  currentUserLoading,
  currentUser,
  currentQuery,
  ui: uiReducer,
  form: formReducer,
});

export default rootReducer;
