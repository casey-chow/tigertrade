export const API_ROOT = `${process.env.REACT_APP_SERVER_ROOT}/api`;

export function setSearchMode(mode = 'listings') {
  return function (dispatch, getState) {
    dispatch({
      type: 'SET_SEARCH_MODE',
      mode,
    });
  };
}

export function showCompose() {
  return function (dispatch, getState) {
    dispatch({
      type: 'SHOW_COMPOSE',
    });
  };
}

export function hideCompose() {
  return function (dispatch, getState) {
    dispatch({
      type: 'HIDE_COMPOSE',
    });
  };
}

