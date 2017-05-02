export const seeksLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_SEEKS_REQUEST':
      return true;
    case 'LOAD_SEEKS_SUCCESS':
    case 'LOAD_SEEKS_FAILURE':
      return false;
    default:
      return state;
  }
};

export const seeks = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_SEEKS_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_SEEKS_SUCCESS':
      return action.json;
    case 'LOAD_SEEKS_REQUEST':
    default:
      return state;
  }
};
