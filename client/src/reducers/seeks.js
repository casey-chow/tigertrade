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

export const seekLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_SEEK_REQUEST':
      return true;
    case 'LOAD_SEEK_SUCCESS':
    case 'LOAD_SEEK_FAILURE':
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
      if (action.concat) {
        return state.concat(action.json);
      } else {
        return action.json;
      }
    case 'LOAD_SEEKS_REQUEST':
    default:
      return state;
  }
};

export const seek = (state = { title: '' }, action) => {
  switch (action.type) {
    case 'LOAD_SEEK_FAILURE': // TODO: failure state
      return {};
    case 'LOAD_SEEK_SUCCESS':
      return action.json;
    case 'LOAD_SEEK_REQUEST':
    default:
      return state;
  }
};
