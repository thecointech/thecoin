export const IsDebug = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"

//
// Utility function allows chaining into exceptions.
// Example: obj?.doStuff() ?? doThrow("An error happened");
export const doThrow = (err: string) => { debugger; throw new Error(err); }
