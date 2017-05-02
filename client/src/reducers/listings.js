export const listingsLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_REQUEST':
      return true;
    case 'LOAD_LISTINGS_SUCCESS':
    case 'LOAD_LISTINGS_FAILURE':
      return false;
    default:
      return state;
  }
};

export const listings = (state = [], action) => {
  switch (action.type) {
    case 'LOAD_LISTINGS_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_LISTINGS_SUCCESS':
      return action.json;
    case 'LOAD_LISTINGS_REQUEST':
    default:
      return state;
  }
};
