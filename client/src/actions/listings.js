import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

export function loadRecentListings() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_LISTINGS_REQUEST',
    });
  
    fetch(`${API_ROOT}/listings`)
      .then(response => response.json())
      .catch(error => dispatch({
        error,
        type: 'LOAD_LISTINGS_FAILURE',
      }))
      .then(json => dispatch({
        json,
        type: 'LOAD_LISTINGS_SUCCESS',
      }));
  };
}
