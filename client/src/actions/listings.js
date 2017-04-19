
import { client } from './common';

export function loadRecentListings() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_LISTINGS_REQUEST',
    });

    client.get('/listings')
      .then((res) => {
        dispatch({
          json: res.data,
          type: 'LOAD_LISTINGS_SUCCESS',
        });
      })
      .catch((error) => {
        dispatch({
          error,
          type: 'LOAD_LISTINGS_FAILURE',
        });
      });
  };
}

export function searchListings(query) {
  return function (dispatch, getState) {
    dispatch({
      type: 'SEARCH_LISTINGS_REQUEST',
    });

    client.get(`/search/${encodeURIComponent(query)}`)
      .then(res => dispatch({
        json: res.data,
        type: 'SEARCH_LISTINGS_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'SEARCH_LISTINGS_FAILURE',
      }));
  };
}

export function postListing(listing) {
  return function (dispatch, getState) {
    dispatch({
      type: 'POST_LISTING_REQUEST',
    });

    client.post('/listings', {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listing),
    })
    .then((res) => {
      dispatch({
        json: res.data,
        type: 'POST_LISTING_SUCCESS',
      });
      dispatch(loadRecentListings());
    })
    .catch(error => dispatch({
      error,
      type: 'POST_LISTING_SUCCESS',
    }));
  };
}
