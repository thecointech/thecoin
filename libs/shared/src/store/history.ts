/**
 * React Router v6+ manages its own history internally.
 * This file is kept for backwards compatibility but is no longer used by the router.
 * If you need programmatic navigation, use the useNavigate() hook instead.
 */

import { createHashHistory, createMemoryHistory } from 'history';

// Create the appropriate history for the environment we are in.
const history = process.env.NODE_ENV === 'test'
  ? createMemoryHistory()
  : createHashHistory();
export { history };
