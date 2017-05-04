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

export function setComposeState(show = false, isEdit = false, mode = 'listings', listing, seek, refreshQuery) {
  return {
    type: 'SET_COMPOSE_STATE',
    show,
    isEdit,
    mode,
    listing,
    seek,
    refreshQuery,
  };
}
