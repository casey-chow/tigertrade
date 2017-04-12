import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const middleware = [];

middleware.push(thunk);

const logger = createLogger({
  collapsed: (getState, action) => {
    return action.type.indexOf('redux-ui') > 0;
  },
});

middleware.push(logger);

export default middleware;
