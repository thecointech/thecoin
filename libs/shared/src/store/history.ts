import { createHashHistory, createMemoryHistory } from 'history';

// Create the appropriate history for the environment we are in.
const history = process.env.NODE_ENV === 'test'
  ? createMemoryHistory()
  : createHashHistory();
export { history };
