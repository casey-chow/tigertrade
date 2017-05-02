import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { checkLoggedInIfError } from './errorHandling';

const middleware = [];

middleware.push(thunk);

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    collapsed: (getState, action, logEntry) => !logEntry.error,
  });
  middleware.push(logger);
}

middleware.push(checkLoggedInIfError);

export default middleware;
