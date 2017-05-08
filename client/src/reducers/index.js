import { reducer as formReducer } from 'redux-form';
import { reducer as uiReducer } from 'redux-ui';

import { combineReducers } from 'redux';
import { isUndefined, omitBy } from 'lodash';

import * as listingsReducers from './listings';
import * as savedSearchesReducers from './savedSearches';
import * as seeksReducers from './seeks';
import * as userReducers from './user';

const currentQuery = (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_SAVED_SEARCHES_REQUEST':
      return {};
    case 'LOAD_LISTINGS_REQUEST':
    case 'LOAD_SEEKS_REQUEST':
      if (action.reset) {
        return omitBy(action.query, isUndefined);
      } else {
        return omitBy({
          ...state,
          ...action.query,
        }, isUndefined);
      }
    default:
      return state;
  }
};

const displayMode = (state = 'listings', action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_REQUEST':
      return 'listings';
    case 'LOAD_SEEKS_REQUEST':
      return 'seeks';
    case 'SET_DISPLAY_MODE':
      return action.mode;
    default:
      return state;
  }
};

const composeState = (state = { show: false, isEdit: false, mode: 'listings', listing: undefined, seek: undefined }, action) => {
  switch (action.type) {
    case 'SET_COMPOSE_STATE':
      return {
        show: action.show,
        isEdit: action.isEdit,
        mode: action.mode,
        listing: action.listing,
        seek: action.seek,
      };
    default:
      return state;
  }
};

const leftDrawerVisible = (state = false, action) => {
  switch (action.type) {
    case 'SET_LEFT_DRAWER':
      return action.visible;
    case 'TOGGLE_LEFT_DRAWER':
      return !state;
    default:
      return state;
  }
};

const defaultSnackbar = { open: false, message: '' };
const snackbar = (state = defaultSnackbar, action) => {
  switch (action.type) {
    case 'SNACKBAR_SHOW':
      return {
        open: true,
        message: action.message,
      };
    case 'SNACKBAR_HIDE':
      return defaultSnackbar;
    default:
      return state;
  }
};

const expandAll = (state = false, action) => {
  switch (action.type) {
    case 'SET_EXPAND_ALL':
      return action.expandAll;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  ...listingsReducers,
  ...savedSearchesReducers,
  ...seeksReducers,
  ...userReducers,
  currentQuery,
  composeState,
  displayMode,
  leftDrawerVisible,
  snackbar,
  expandAll,
  ui: uiReducer,
  form: formReducer,
});

export default rootReducer;
