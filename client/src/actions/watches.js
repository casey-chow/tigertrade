import fetch from 'isomorphic-fetch';

import { API_ROOT, handleErrors } from './common';
import { stripQuery } from '../helpers/query';

export function loadWatches() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_WATCHES_REQUEST',
    });
    return fetch(`${API_ROOT}/watches`, {
      credentials: 'include',
    })
    .then(handleErrors)
    .then(response => response.json())
    .then(json => dispatch({
      json,
      type: 'LOAD_WATCHES_SUCCESS',
    }))
    .catch(error => dispatch({
      error,
      type: 'LOAD_WATCHES_FAILURE',
    }));
  };
}

export function postWatch(watch, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'POST_WATCH_REQUEST',
    });
    return fetch(`${API_ROOT}/watches`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stripQuery(watch || getState().currentQuery)),
    })
    .then(handleErrors)
    .then(response => response.json())
    .then((json) => {
      dispatch({
        json,
        type: 'POST_WATCH_SUCCESS',
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }
    })
    .catch(error => dispatch({
      error,
      type: 'POST_WATCH_FAILURE',
    }));
  };
}

export function deleteWatch(watch, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'DELETE_WATCH_REQUEST',
      watch,
    });

    return fetch(`${API_ROOT}/watches/${watch.keyId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
    .then(handleErrors)
    .then(() => {
      dispatch({
        type: 'DELETE_WATCH_SUCCESS',
        watch,
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }
    })
    .catch(error => dispatch({
      error,
      watch,
      type: 'DELETE_WATCH_FAILURE',
    }));
  };
}
