import { loadCurrentUser } from '../actions/users';

// Reload the current user if an error occurs.
// eslint-disable-next-line import/prefer-default-export
export const checkLoggedInIfError = store => next => (action) => {
  if (action.err && action.type !== 'LOAD_CURRENT_USER_FAILURE') {
    store.dispatch(loadCurrentUser());
  }

  return next(action);
};
