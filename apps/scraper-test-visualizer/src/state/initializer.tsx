import { useEffect } from "react";
import { TestsReducer } from "./reducer";
import { Test } from "../types";
import { TestInfo } from "../testInfo";

export const Initializer = () => {
  // Initialize Redux store for tests
  TestsReducer.useStore();

  // Get actions and data from Redux
  const actions = TestsReducer.useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      actions.setLoading(true);
      actions.setError(null);

      // Load test list
      const testsResponse = await fetch('/api/tests');
      if (!testsResponse.ok) throw new Error('Failed to load tests');
      const tests: Test[] = await testsResponse.json();
      actions.setTests(tests.map(test => new TestInfo(test)));

      // Load failing tests
      const failingResponse = await fetch('/api/failing');
      if (failingResponse.ok) {
        const failingData = await failingResponse.json();
        actions.setFailingTests(new Set(failingData.include || []));
      }

      // // Load details for each test
      // const testDetails = await Promise.all(
      //   testNames.map(async (name: string) => {
      //     const response = await fetch(`/api/tests/${name}`);
      //     const data = await response.json();
      //     return {
      //       name,
      //       groups: data.groups,
      //       isFailing: failingTests.has(name),
      //     };
      //   })
      // );

      // setTests(testDetails);
    } catch (err) {
      actions.setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      actions.setLoading(false);
    }
  };

  return null;
}
