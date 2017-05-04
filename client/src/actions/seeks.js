import fetch from 'isomorphic-fetch';
import { stringify } from 'query-string';

import { API_ROOT } from './common';

export function loadSeeks({ query = {}, reset = false, concat = false }) {
  return function (dispatch, getState) {
    dispatch({
      query,
      reset,
      type: 'LOAD_SEEKS_REQUEST',
    });
    fetch(`${API_ROOT}/seeks?${stringify(getState().currentQuery)}`, {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => dispatch({
        json,
        concat,
        type: 'LOAD_SEEKS_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'LOAD_SEEKS_FAILURE',
      }));
  };
}

export function loadSeek(id = '') {
  return function (dispatch, getState) {
    dispatch({
      query: {},
      type: 'LOAD_SEEK_REQUEST',
    });
    fetch(`${API_ROOT}/seeks/${id}`, {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'LOAD_SEEK_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'LOAD_SEEK_FAILURE',
      }));
  };
}

export function postSeek(seek, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'POST_SEEK_REQUEST',
      seek,
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
        type: 'POST_SEEK_SUCCESS',
        json,
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }

      dispatch(loadSeeks({ query: { isMine: true }, reset: true }));
    })
    .catch(error => dispatch({
      error,
      seek,
      type: 'POST_SEEK_FAILURE',
    }));
  };
}

export function deleteSeek(seek, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'DELETE_SEEK_REQUEST',
      seek,
    });

    fetch(`${API_ROOT}/seeks/${seek.keyId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
    .then((json) => {
      dispatch({
        type: 'DELETE_SEEK_SUCCESS',
        json,
        seek,
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }

      dispatch(loadSeeks({}));
    })
    .catch(error => dispatch({
      error,
      seek,
      type: 'DELETE_SEEK_FAILURE',
    }));
  };
}

