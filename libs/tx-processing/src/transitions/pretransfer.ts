//
// A pre-transfer simply records the timestamp of an attempted transfer.
// This timestamp is used as a lock by a transfer event
// Return empty object and FSM will fill in the necessary details
export function preTransfer() { return Promise.resolve({}); }
