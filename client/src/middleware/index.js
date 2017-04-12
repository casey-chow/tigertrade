import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

const logger = createLogger({
  collapsed: (getState, action) => {
    return action.type.indexOf('redux-ui') > 0;
  },
});


export default [
  thunk,
  logger,
];
