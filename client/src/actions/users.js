import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

export function loadCurrentUser() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_CURRENT_USER_REQUEST',
    });
  
    fetch(`${API_ROOT}/users/current`)
      .then(response => response.json())
      .catch(error => dispatch({
        error,
        type: 'LOAD_CURRENT_USER_FAILURE',
      }))
      .then(json => dispatch({
        json,
        type: 'LOAD_CURRENT_USER_SUCCESS',
      }));
  };
}
