import { makeTransition  } from '../makeTransition';

//
// TODO: Implement timeout handling
export const timeout = makeTransition("timeout", () => Promise.resolve({}));
