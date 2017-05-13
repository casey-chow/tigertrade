export const watchesLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_WATCHES_REQUEST':
      return true;
    case 'LOAD_WATCHES_SUCCESS':
    case 'LOAD_WATCHES_FAILURE':
      return false;
    default:
      return state;
  }
};

export const watches = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_WATCHES_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_WATCHES_SUCCESS':
      return action.json;
    case 'LOAD_WATCHES_REQUEST':
    default:
      return state;
  }
};
