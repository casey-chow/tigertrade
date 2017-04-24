import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

export function loadSavedSearches() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_SAVEDSEARCHES_REQUEST',
    });
    fetch(`${API_ROOT}/savedsearches`, {
      credentials: 'include',
    })
    .then(response => response.json())
    .then(json => dispatch({
      json,
      type: 'LOAD_SAVEDSEARCHES_SUCCESS',
    }))
    .catch(error => dispatch({
      error,
      type: 'LOAD_SAVEDSEARCHES_FAILURE',
    }));
  };
}

export function postSavedSearch(savedsearch) {
  return function (dispatch, getState) {
    dispatch({
      type: 'POST_SAVEDSEARCH_REQUEST',
    });

    fetch(`${API_ROOT}/savedsearches`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(savedsearch),
    })
    .then((json) => {
      dispatch({
        json,
        type: 'POST_SAVEDSEARCH_SUCCESS',
      });
      dispatch(loadSavedSearches());
    })
    .catch(error => dispatch({
      error,
      type: 'POST_SAVEDSEARCH_FAILURE',
    }));
  };
}
