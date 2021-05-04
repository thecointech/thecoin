import { ActionContainer } from "statemachine/types";

//
// A no-op transition moves us into a new state without changing any data
export const noop = (_deposit: ActionContainer) => Promise.resolve({});
