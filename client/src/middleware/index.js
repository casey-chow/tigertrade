import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const middleware = [];

middleware.push(thunk);

if (process.env.NODE_ENV === 'development') {
  const logger = createLogger({
    collapsed: (getState, action) => {
      return action.type.indexOf('redux-ui') > 0;
    },
  });
  middleware.push(logger);
}

export default middleware;
