import { makeTransition  } from '../makeTransition';

//
// A no-op transition moves us into a new state without changing any data
export const noop = makeTransition("noop", () => Promise.resolve({}));
