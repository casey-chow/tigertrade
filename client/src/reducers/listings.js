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

export const listingLoading = (state = false, action) => {
  switch (action.type) {
    case 'LOAD_LISTING_REQUEST':
      return true;
    case 'LOAD_LISTING_SUCCESS':
    case 'LOAD_LISTING_FAILURE':
      return false;
    default:
      return state;
  }
};

export const listings = (state = [], action) => {
  switch (action.type) {
    case 'STAR_LISTING_REQUEST':
      return state.map(listing => (
        (action.listing.keyId === listing.keyId) ?
        {
          ...listing,
          isStarred: !listing.isStarred,
        } : listing));
    case 'LOAD_LISTINGS_FAILURE': // TODO: failure state
      return [];
    case 'LOAD_LISTINGS_SUCCESS':
      return action.json;
    case 'SET_EXPAND_ALL':
      return action.expandAll ? state.slice(0, 30) : state;
    case 'LOAD_LISTINGS_REQUEST':
    default:
      return state;
  }
};

export const listing = (state = { title: '' }, action) => {
  switch (action.type) {
    case 'LOAD_LISTING_FAILURE': // TODO: failure state
      return {};
    case 'LOAD_LISTING_SUCCESS':
      return action.json;
    case 'LOAD_LISTING_REQUEST':
    default:
      return state;
  }
};
