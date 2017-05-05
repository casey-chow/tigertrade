import fetch from 'isomorphic-fetch';
import { stringify } from 'query-string';
import { setComposeState, showSnackbar } from './ui';

import { API_ROOT } from './common';

export function loadSeeks({ query = {}, reset = false }) {
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
        dispatch(showSnackbar(successMessage));
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
        dispatch(showSnackbar(successMessage));
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

export function editSeek(seek) {
  return setComposeState(true, true, 'seeks', undefined, seek);
}

export function updateSeek(seek, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'UPDATE_SEEK_REQUEST',
    });

    fetch(`${API_ROOT}/seeks/${seek.keyId}`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seek),
    })
    .then((json) => {
      dispatch({
        json,
        type: 'UPDATE_SEEK_SUCCESS',
      });
      dispatch(loadSeeks({}));
      if (successMessage) {
        dispatch(showSnackbar(successMessage));
      }
    })
    .catch(error => dispatch({
      error,
      type: 'UPDATE_SEEK_FAILURE',
    }));
  };
}

