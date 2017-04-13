// import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

export function loadCurrentUser() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_CURRENT_USER_REQUEST',
    });
  
    fetch(`${API_ROOT}/users/current`, {
      credentials: "include",
    })
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'LOAD_CURRENT_USER_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'LOAD_CURRENT_USER_FAILURE',
      }));
  };
}
