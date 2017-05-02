const savedSearchesLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_SAVED_SEARCHES_REQUEST':
      return true;
    case 'LOAD_SAVED_SEARCHES_SUCCESS':
    case 'LOAD_SAVED_SEARCHES_FAILURE':
      return false;
    default:
      return state;
  }
};

const savedSearches = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_SAVED_SEARCHES_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_SAVED_SEARCHES_SUCCESS':
      return action.json;
    case 'LOAD_SAVED_SEARCHES_REQUEST':
    default:
      return state;
  }
};

export default {
  savedSearchesLoading,
  savedSearches,
};
