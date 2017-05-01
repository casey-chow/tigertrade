export const API_ROOT = `${process.env.REACT_APP_SERVER_ROOT}/api`;

export function setSearchMode(mode = false) {
  return function (dispatch, getState) {
    dispatch({
      type: mode ? 'CONTAINER_SEEKS_MODE' : 'CONTAINER_LISTINGS_MODE',
    });
  };
}
