export const API_ROOT = `${process.env.REACT_APP_SERVER_ROOT}/api`;

export function setDisplayMode(mode = 'listings') {
  return function (dispatch, getState) {
    dispatch({
      type: 'SET_DISPLAY_MODE',
      mode,
    });
  };
}
