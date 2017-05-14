import { loadListings } from './listings';
import { loadSeeks } from './seeks';

export const API_ROOT = `${process.env.REACT_APP_SERVER_ROOT}/api`;

export function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }

  return response;
}

export function loadPosts(displayMode, params) {
  switch (displayMode) {
    case 'seeks':
      return loadSeeks(params);
    case 'listings':
      return loadListings(params);
    default:
      throw new Error(`invalid display mode in loadPosts: ${displayMode}`);
  }
}
