// eslint-disable-next-line import/prefer-default-export
export const API_ROOT = `${process.env.REACT_APP_SERVER_ROOT}/api`;

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
