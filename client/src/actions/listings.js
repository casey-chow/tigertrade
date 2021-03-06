import fetch from 'isomorphic-fetch';
import { stringify } from 'query-string';
import { setComposeState, showSnackbar } from './ui';

import { API_ROOT, handleErrors } from './common';

export function loadListings({ query = {}, reset = false }) {
  return function (dispatch, getState) {
    dispatch({
      query,
      reset,
      type: 'LOAD_LISTINGS_REQUEST',
    });
    return fetch(`${API_ROOT}/listings?${stringify(getState().currentQuery)}`, {
      credentials: 'include',
    })
    .then(handleErrors)
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
    return fetch(`${API_ROOT}/listings/${id}`, {
      credentials: 'include',
    })
    .then(handleErrors)
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

    return fetch(`${API_ROOT}/listings`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listing),
    })
    .then(handleErrors)
    .then(response => response.json())
    .then((json) => {
      dispatch({
        json,
        type: 'POST_LISTING_SUCCESS',
      });

      if (successMessage) {
        dispatch(showSnackbar(successMessage));
      }
    })
    .catch(error => dispatch({
      error,
      type: 'POST_LISTING_FAILURE',
    }));
  };
}

export function starListing(listing) {
  return function (dispatch, getState) {
    dispatch({
      listing,
      type: 'STAR_LISTING_REQUEST',
    });

    return fetch(`${API_ROOT}/listings/${listing.keyId}/star`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isStarred: !listing.isStarred }),
    })
    .then(handleErrors)
    .then(() => {
      dispatch({
        type: 'STAR_LISTING_SUCCESS',
      });
    })
    .catch(error => dispatch({
      error,
      type: 'STAR_LISTING_FAILURE',
    }));
  };
}

export function deleteListing(listing, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'DELETE_LISTING_REQUEST',
      listing,
    });

    return fetch(`${API_ROOT}/listings/${listing.keyId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
    .then(handleErrors)
    .then(() => {
      dispatch({
        type: 'DELETE_LISTING_SUCCESS',
        listing,
      });
      if (successMessage) {
        dispatch(showSnackbar(successMessage));
      }
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

export function updateListing(listing, successMessage) {
  return function (dispatch, getState) {
    dispatch({
      type: 'UPDATE_LISTING_REQUEST',
    });

    return fetch(`${API_ROOT}/listings/${listing.keyId}`, {
      credentials: 'include',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listing),
    })
    .then(handleErrors)
    .then(() => {
      dispatch({
        type: 'UPDATE_LISTING_SUCCESS',
      });
      if (successMessage) {
        dispatch(showSnackbar(successMessage));
      }
    })
    .catch(error => dispatch({
      error,
      type: 'UPDATE_LISTING_FAILURE',
    }));
  };
}
