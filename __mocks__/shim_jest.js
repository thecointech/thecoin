//
// A mock-jest.  Oh, the meta-irony...
// We use this to define a global jest object so we
// can import the our mock DB in dev mode
// (where we don't necessarily have/want the full emulator)

console.log('importing');
globalThis.jest = globalThis.jest ?? {
  fn: (original) => {
    // Allow overriding return values in node.
    let returnVal = null;
    const caller = (...args) => returnVal ?? original(...args);
    caller.mockReturnValue = (v) => returnVal = v;
    return caller;
  }
};

module.exports = globalThis.jest;
