
import {describe } from '.';

let boolRan = false;
let testFnTrueExec = false;
let testFnFalseExec = false;
let testFnRan = false;

export function afterAll() {
  if (!boolRan && testFnTrueExec && testFnFalseExec && testFnRan)
    throw new Error("Functions not completed appropriately");
}

describe("These functions should run", true, () => {
  test('Bool test succeeds', () => {
    boolRan = true;
  })
});

describe("These functions should not run", false, () => {
  test('Bool test skips', () => {
    // This is failure
    expect(false).toBeTruthy();
  })
});

describe("These functions should run",
  () => {
    testFnTrueExec = true;
    return true;
  },
  () => {
    test('Fn test succeeds', () => {
      testFnRan = true;
    })
  });

describe("These functions should not run",
  () => {
    testFnFalseExec = true;
    return false;
  },
  () => {
    test('Fn test skips', () => {
      expect(false).toBeTruthy();
    })
  });
