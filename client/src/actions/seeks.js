import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

export function loadSeeks(query = '') {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_SEEKS_REQUEST',
    });
    fetch(`${API_ROOT}/seeks?query=${encodeURIComponent(query)}`)
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

export function setCurrentSeeksQuery(query = '') {
  return ({
    type: 'SET_CURRENT_SEEKS_QUERY',
    query,
  });
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
      dispatch(loadSeeks());
    })
    .catch(error => dispatch({
      error,
      type: 'POST_SEEK_FAILURE',
    }));
  };
}
