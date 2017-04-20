import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const middleware = [];

middleware.push(thunk);

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    collapsed: true,
  });
  middleware.push(logger);
}

export default middleware;
