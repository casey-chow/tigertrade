export function setDisplayMode(mode = 'listings') {
  return {
    type: 'SET_DISPLAY_MODE',
    mode,
  };
}

export function toggleLeftDrawer() {
  return {
    type: 'TOGGLE_LEFT_DRAWER',
  };
}

export function setComposeShown(show = false) {
  return {
    type: 'SET_COMPOSE_SHOWN',
    show,
  };
}

export function showSnackbar(message = '') {
  return {
    type: 'SNACKBAR_SHOW',
    message,
  };
}

export function hideSnackbar(message = '') {
  return {
    type: 'SNACKBAR_HIDE',
  };
}
