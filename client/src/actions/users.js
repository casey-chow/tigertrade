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

export function mailSeller(listing, data, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'MAIL_SELLER_REQUEST',
      listing,
    });

    fetch(`${API_ROOT}/listings/${listing.keyId}/contact`, {
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

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }
    })
    .catch(error => dispatch({
      error,
      listing,
      type: 'MAIL_SELLER_FAILURE',
    }));
  };
}

export function mailBuyer(seek, data, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'MAIL_BUYER_REQUEST',
      seek,
      data,
    });

    fetch(`${API_ROOT}/seeks/${seek.keyId}/contact`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: data.message }),
    }).then((json) => {
      dispatch({
        json,
        type: 'MAIL_BUYER_SUCCESS',
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
      seek,
      data,
      type: 'MAIL_BUYER_FAILURE',
    }));
  };
}
