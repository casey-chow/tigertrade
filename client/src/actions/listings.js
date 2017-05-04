import fetch from 'isomorphic-fetch';
import { stringify } from 'query-string';
import { setComposeState } from './ui';

import { API_ROOT } from './common';

export function loadListings({ query = {}, reset = false }) {
  return function (dispatch, getState) {
    dispatch({
      query,
      reset,
      type: 'LOAD_LISTINGS_REQUEST',
    });
    fetch(`${API_ROOT}/listings?${stringify(getState().currentQuery)}`, {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'LOAD_LISTINGS_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'LOAD_LISTINGS_FAILURE',
      }));
  };
}

export function loadListing(id = '') {
  return function (dispatch, getState) {
    dispatch({
      query: {},
      type: 'LOAD_LISTING_REQUEST',
    });
    fetch(`${API_ROOT}/listings/${id}`, {
      credentials: 'include',
    })
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'LOAD_LISTING_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'LOAD_LISTING_FAILURE',
      }));
  };
}

export function postListing(listing, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'POST_LISTING_REQUEST',
    });

    fetch(`${API_ROOT}/listings`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listing),
    })
    .then((json) => {
      dispatch({
        json,
        type: 'POST_LISTING_SUCCESS',
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }

      dispatch(loadListings({ query: { isMine: true }, reset: true }));
    })
    .catch(error => dispatch({
      error,
      type: 'POST_LISTING_FAILURE',
    }));
  };
}

export function deleteListing(listing, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'DELETE_LISTING_REQUEST',
      listing,
    });

    fetch(`${API_ROOT}/listings/${listing.keyId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
    .then(() => {
      dispatch({
        type: 'DELETE_LISTING_SUCCESS',
        listing,
      });

      if (successMessage) {
        dispatch({
          type: 'SNACKBAR_SHOW',
          message: successMessage,
        });
      }
      dispatch(loadListings({}));
    })
    .catch(error => dispatch({
      error,
      listing,
      type: 'DELETE_LISTING_FAILURE',
    }));
  };
}

export function editListing(listing) {
  return setComposeState(true, true, 'listings', listing, undefined);
}

export function updateListing(listing) {
  return function (dispatch, getState) {
    dispatch({
      type: 'UPDATE_LISTING_REQUEST',
    });

    fetch(`${API_ROOT}/listings/${listing.keyId}`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listing),
    })
    .then((json) => {
      dispatch({
        json,
        type: 'UPDATE_LISTING_SUCCESS',
      });
      dispatch(loadListings({}));
    })
    .catch(error => dispatch({
      error,
      type: 'UPDATE_LISTING_FAILURE',
    }));
  };
}
