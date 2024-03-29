//
// A mock-jest.  Oh, the meta-irony...
// We use this to define a global jest object so we
// can import the our mock DB in dev mode
// (where we don't necessarily have/want the full emulator)
const getBuiltin = () : (typeof jest)|null => {
  try { return jest; } // wrap in try/catch as Electron throws on undefined var
  catch (e) { return null; }
}


const shim = getBuiltin() ?? {
  fn: (original: any) => {
    // Allow overriding return values in node.
    let returnVal: any = null;
    const caller = (...args: any) => returnVal ?? original?.(...args);
    caller.mockReturnValue = (v: any) => returnVal = v;
    return caller;
  },
};
export { shim as jest };

// This structure will be created to allow setting jest to global
// IFF there is no current global Jest config
export const register = {
  on: globalThis.jest ? () => {} : () => globalThis.jest = shim as any,
  off: globalThis.jest ? () => {} : () => globalThis.jest = undefined as any,
}
