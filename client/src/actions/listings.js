import fetch from 'isomorphic-fetch';
import { stringify } from 'query-string';

import { API_ROOT } from './common';

export function loadListings({ query = {}, reset = false, append = false }) {
  return function (dispatch, getState) {
    dispatch({
      query,
      reset,
      append,
      type: 'LOAD_LISTINGS_REQUEST',
    });
    fetch(`${API_ROOT}/listings?${stringify(query)}`, {
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

export function postListing(listing) {
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
      dispatch(loadListings({ query: { isMine: true }, reset: true }));
    })
    .catch(error => dispatch({
      error,
      type: 'POST_LISTING_FAILURE',
    }));
  };
}

export function deleteListing(listingId) {
  return function (dispatch, getState) {
    dispatch({
      type: 'DELETE_LISTING_REQUEST',
    });

    fetch(`${API_ROOT}/listings/${listingId}`, {
      credentials: 'include',
      method: 'DELETE',
    })
    .then((json) => {
      dispatch({
        json,
        type: 'DELETE_LISTING_SUCCESS',
      });
      dispatch(loadListings());
    })
    .catch(error => dispatch({
      error,
      type: 'DELETE_LISTING_FAILURE',
    }));
  };
}
