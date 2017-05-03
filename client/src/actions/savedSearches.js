import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

export function loadSavedSearches() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_SAVED_SEARCHES_REQUEST',
    });
    fetch(`${API_ROOT}/savedsearches`, {
      credentials: 'include',
    })
    .then(response => response.json())
    .then(json => dispatch({
      json,
      type: 'LOAD_SAVED_SEARCHES_SUCCESS',
    }))
    .catch(error => dispatch({
      error,
      type: 'LOAD_SAVED_SEARCHES_FAILURE',
    }));
  };
}

export function loadSavedSearch(id = '') {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_SAVED_SEARCHES_REQUEST',
    });
    fetch(`${API_ROOT}/savedsearches/${id}`, {
      credentials: 'include',
    })
    .then(response => response.json())
    .then(json => dispatch({
      json: [json],
      type: 'LOAD_SAVED_SEARCHES_SUCCESS',
    }))
    .catch(error => dispatch({
      error,
      type: 'LOAD_SAVED_SEARCHES_FAILURE',
    }));
  };
}

export function postSavedSearch(savedSearch) {
  return function (dispatch, getState) {
    dispatch({
      type: 'POST_SAVED_SEARCH_REQUEST',
    });

    fetch(`${API_ROOT}/savedsearches`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savedSearch),
    })
    .then((json) => {
      dispatch({
        json,
        type: 'POST_SAVED_SEARCH_SUCCESS',
      });
      dispatch(loadSavedSearches());
    })
    .catch(error => dispatch({
      error,
      type: 'POST_SAVED_SEARCH_FAILURE',
    }));
  };
}
