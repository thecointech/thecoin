import { expect, it } from "@jest/globals";
import { getTestResults, getTests } from "./data";

it ('Correctly gets all tests', () => {
  const tests = getTests();
  expect(tests.length).toBeGreaterThan(100);
});


it ('Correctly gets test results', () => {
  const test = getTests()[100];
  const results = getTestResults(test.key, test.element);
  expect(results.original).toBeTruthy();
  expect(results.snapshot.length).toBeGreaterThan(0);
})
