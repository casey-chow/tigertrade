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
    case 'LOAD_SAVED_SEARCHES_REQUEST':
      return true;
    case 'LOAD_SAVED_SEARCHES_SUCCESS':
    case 'LOAD_SAVED_SEARCHES_FAILURE':
      return false;
    default:
      return state;
  }
};

const savedSearches = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_SAVED_SEARCHES_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_SAVED_SEARCHES_SUCCESS':
      return action.json;
    case 'LOAD_SAVED_SEARCHES_REQUEST':
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

const currentQuery = (state = { query: '' }, action) => {
  switch (action.type) {
    case 'LOAD_SAVED_SEARCHES_REQUEST':
      return { query: '' };
    case 'LOAD_LISTINGS_REQUEST':
    case 'LOAD_SEEKS_REQUEST':
      return action.query;
    default:
      return state;
  }
};

const searchMode = (state = 'listings', action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_REQUEST':
      return 'listings';
    case 'LOAD_SEEKS_REQUEST':
      return 'seeks';
    case 'SET_SEARCH_MODE':
      return action.mode;
    default:
      return state;
  }
};

const showCompose = (state = false, action) => {
  switch (action.type) {
    case 'SHOW_COMPOSE':
      return true;
    case 'HIDE_COMPOSE':
      return false;
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
  searchMode,
  showCompose,
  ui: uiReducer,
  form: formReducer,
});

export default rootReducer;
