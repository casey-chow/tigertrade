import { reducer as formReducer } from 'redux-form';
import { reducer as uiReducer } from 'redux-ui';

import { combineReducers } from 'redux';

const listingsLoading = (state = false, action) => {
  switch (action.type) {
    case 'RECENT_LISTINGS_REQUEST':
    case 'SEARCH_LISTINGS_REQUEST':
      return true;
    case 'RECENT_LISTINGS_FAILURE':
    case 'SEARCH_LISTINGS_FAILURE':
    case 'RECENT_LISTINGS_SUCCESS':
    case 'SEARCH_LISTINGS_SUCCESS':
      return false;
    default:
      return state;
  }
};

const recentListings = (state = [], action) => {
  switch (action.type) {
    case 'RECENT_LISTINGS_FAILURE': // TODO: failure state
      return [];
    case 'RECENT_LISTINGS_SUCCESS':
      return action.json;
    case 'RECENT_LISTINGS_REQUEST':
    default:
      return state;
  }
};

const searchListings = (state = [], action) => {
  switch (action.type) {
    case 'SEARCH_LISTINGS_FAILURE': // TODO: failure state
      return [];
    case 'SEARCH_LISTINGS_SUCCESS':
      return action.json;
    case 'SEARCH_LISTINGS_REQUEST':
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
  recentListings,
  listingsLoading,
  searchListings,
  currentUserLoading,
  currentUser,
  currentQuery,
  ui: uiReducer,
  form: formReducer,
});

export default rootReducer;
