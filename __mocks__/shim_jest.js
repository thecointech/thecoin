//
// A mock-jest.  Oh, the meta-irony...
// We use this to define a global jest object so we
// can import the our mock DB in dev mode
// (where we don't necessarily have/want the full emulator)
if (!globalThis.jest) {
  globalThis.jest = {
    fn: () => () => {}
  };
}
