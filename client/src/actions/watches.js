import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';
import { stripQuery } from '../helpers/query';

export function loadWatches() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_WATCHES_REQUEST',
    });
    fetch(`${API_ROOT}/savedsearches`, {
      credentials: 'include',
    })
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
    fetch(`${API_ROOT}/savedsearches`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stripQuery(watch || getState().currentQuery)),
    })
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
      dispatch(loadWatches());
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

    fetch(`${API_ROOT}/savedSearches/${watch.keyId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
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
      dispatch(loadWatches({}));
    })
    .catch(error => dispatch({
      error,
      watch,
      type: 'DELETE_WATCH_FAILURE',
    }));
  };
}
