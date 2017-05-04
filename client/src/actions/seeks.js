import fetch from 'isomorphic-fetch';
import { stringify } from 'query-string';

import { API_ROOT } from './common';

export function loadSeeks({ query = {}, reset = false, append = false }) {
  return function (dispatch, getState) {
    dispatch({
      query,
      reset,
      append,
      type: 'LOAD_SEEKS_REQUEST',
    });
    fetch(`${API_ROOT}/seeks?${stringify(query)}`, {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'LOAD_SEEKS_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'LOAD_SEEKS_FAILURE',
      }));
  };
}

export function postSeek(seek) {
  return function (dispatch, getState) {
    dispatch({
      type: 'POST_SEEK_REQUEST',
    });

    fetch(`${API_ROOT}/seeks`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seek),
    })
    .then((json) => {
      dispatch({
        json,
        type: 'POST_SEEK_SUCCESS',
      });
      dispatch(loadSeeks({ reset: true }));
    })
    .catch(error => dispatch({
      error,
      type: 'POST_SEEK_FAILURE',
    }));
  };
}

export function deleteSeek(seekId, refreshQuery) {
  return function (dispatch, getState) {
    dispatch({
      type: 'DELETE_LISTING_REQUEST',
    });

    fetch(`${API_ROOT}/seeks/${seekId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
    .then((json) => {
      dispatch({
        json,
        type: 'DELETE_LISTING_SUCCESS',
      });
      dispatch(loadSeeks());
    })
    .catch(error => dispatch({
      error,
      type: 'DELETE_LISTING_FAILURE',
    }));
  };
}

