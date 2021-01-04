
import { describe } from '.';

let defaultRan = false;
let boolRan = false;
let testFnTrueExec = false;
let testFnFalseExec = false;
let testFnRan = false;

afterAll(() => {
  console.log('Testing that all fns ran');
  if (!(defaultRan && boolRan && testFnTrueExec && testFnFalseExec && testFnRan)) {
    throw new Error("Functions not completed appropriately");
  }
  console.log('All tests ran appropriately');
});

describe("These functions should run by default",
  () => {
    test('default function succeeds', () => {
      defaultRan = true;
    })
  }
);

describe("These functions should run",
  () => {
    test('Bool test succeeds', () => {
      boolRan = true;
    })
  },
  true
);

describe("These functions should not run",
  () => {
    test('Bool test skips', () => {
      // This is failure
      expect(false).toBeTruthy();
    })
  },
  false
);

describe("These functions should run",
  () => {
    test('Fn test succeeds', () => {
      testFnRan = true;
    })
  },
  () => {
    testFnTrueExec = true;
    return true;
  }
);

describe("These functions should not run",
  () => {
    test('Fn test skips', () => {
      expect(false).toBeTruthy();
    })
  },
  () => {
    testFnFalseExec = true;
    return false;
  }
);
