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

export function setComposeState(show = false, isEdit = false, mode = 'listings', listing, seek) {
  return {
    type: 'SET_COMPOSE_STATE',
    show,
    isEdit,
    mode,
    listing,
    seek,
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

export function setExpandAll(expandAll = false) {
  return {
    type: 'SET_EXPAND_ALL',
    expandAll,
  };
}
