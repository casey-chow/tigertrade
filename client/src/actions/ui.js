export function setDisplayMode(mode = 'listings') {
  return function (dispatch, getState) {
    dispatch({
      type: 'SET_DISPLAY_MODE',
      mode,
    });
  };
}

export function toggleLeftDrawer() {
  return function (dispatch, getState) {
    dispatch({
      type: 'TOGGLE_LEFT_DRAWER',
    });
  };
}
