import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

// eslint-disable-next-line import/prefer-default-export
export function loadCurrentUser() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_CURRENT_USER_REQUEST',
    });

    fetch(`${API_ROOT}/users/current`, {
      credentials: 'include',
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

export function mailSeller(listingId, data) {
  return function (dispatch, getState) {
    dispatch({
      type: 'MAIL_SELLER_REQUEST',
    });

    console.log(`Contacting owner of listing ${listingId} with message ${data.message}`);
    console.log(data);

    fetch(`${API_ROOT}/listings/${listingId}/contact`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: data.message }),
    }).then((json) => {
      dispatch({
        json,
        type: 'MAIL_SELLER_SUCCESS',
      });
    })
    .catch(error => dispatch({
      error,
      type: 'MAIL_SELLER_FAILURE',
    }));
  };
}

export function mailBuyer(seekId, data) {
  return function (dispatch, getState) {
    dispatch({
      type: 'MAIL_BUYER_REQUEST',
    });

    console.log(`Contacting owner of seek ${seekId} with message ${data.message}`);
    console.log(data);
  };
}
