import fetch from 'isomorphic-fetch';

import { API_ROOT } from './common';

export function loadRecentListings() {
  return function (dispatch, getState) {
    dispatch({
      type: 'SEARCH_LISTINGS_REQUEST',
    });

    fetch(`${API_ROOT}/listings`)
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'SEARCH_LISTINGS_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'SEARCH_LISTINGS_FAILURE',
      }));
  };
}

export function searchListings(query) {
  return function (dispatch, getState) {
    dispatch({
      type: 'SEARCH_LISTINGS_REQUEST',
    });
    fetch(`${API_ROOT}/listings?query=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'SEARCH_LISTINGS_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'SEARCH_LISTINGS_FAILURE',
      }));
    /*
    fetch(`${API_ROOT}/search/${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(json => dispatch({
        json,
        type: 'SEARCH_LISTINGS_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'SEARCH_LISTINGS_FAILURE',
      }));
      */
  };
}

export function setCurrentListingsQuery(query) {
  return ({
    type: 'SET_CURRENT_LISTINGS_QUERY',
    query,
  });
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
      dispatch(loadRecentListings());
    })
    .catch(error => dispatch({
      error,
      type: 'POST_LISTING_FAILURE',
    }));
  };
}
