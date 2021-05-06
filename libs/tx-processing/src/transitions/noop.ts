import { ActionContainer } from "statemachine/types";

//
// A no-op transition moves us into a new state without changing any data
export function noop(_deposit: ActionContainer) { return Promise.resolve({}); }
