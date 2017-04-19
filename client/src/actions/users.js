import { client } from './common';

export function loadCurrentUser() {
  return function (dispatch, getState) {
    dispatch({
      type: 'LOAD_CURRENT_USER_REQUEST',
    });

    client.get('/users/current')
      .then(res => dispatch({
        data: res.data,
        type: 'LOAD_CURRENT_USER_SUCCESS',
      }))
      .catch(error => dispatch({
        error,
        type: 'LOAD_CURRENT_USER_FAILURE',
      }));
  };
}
