//
// A mock-jest.  Oh, the meta-irony...
// We use this to define a global jest object so we
// can import the our mock DB in dev mode
// (where we don't necessarily have/want the full emulator)

globalThis.jest = globalThis.jest ?? {
  fn: (original: any) => {
    // Allow overriding return values in node.
    let returnVal: any = null;
    const caller = (...args: any) => returnVal ?? original?.(...args);
    caller.mockReturnValue = (v: any) => returnVal = v;
    return caller;
  }
};

export {}
