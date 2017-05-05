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

export function postSavedSearch(successMessage) {
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
      body: JSON.stringify(getState().currentQuery),
    })
    .then((json) => {
      dispatch({
        json,
        type: 'POST_SAVED_SEARCH_SUCCESS',
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }
      dispatch(loadSavedSearches());
    })
    .catch(error => dispatch({
      error,
      type: 'POST_SAVED_SEARCH_FAILURE',
    }));
  };
}

export function deleteSavedSearch(savedSearch, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'DELETE_SAVED_SEARCH_REQUEST',
      savedSearch,
    });

    fetch(`${API_ROOT}/savedSearches/${savedSearch.keyId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
    .then(() => {
      dispatch({
        type: 'DELETE_SAVED_SEARCH_SUCCESS',
        savedSearch,
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }
      dispatch(loadSavedSearches({}));
    })
    .catch(error => dispatch({
      error,
      savedSearch,
      type: 'DELETE_SAVED_SEARCH_FAILURE',
    }));
  };
}
