import { BaseReducer } from '@thecointech/shared/store/immerReducer';
import { initialState, type InitialState, type FilterType } from './initialState';
import type { TestInfo } from '../testInfo';

export const TESTS_KEY = "tests";

export interface IActions {
  setTests(tests: TestInfo[]): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setSelectedTest(test: TestInfo | null): void;
  setFailingTests(failingTests: Set<string>): void;
  setFilter(filter: FilterType): void;
}

export class TestsReducer extends BaseReducer<IActions, InitialState>(TESTS_KEY, initialState)
  implements IActions
{
  setTests(tests: TestInfo[]): void {
    this.draftState.tests = tests;
  }

  setLoading(loading: boolean): void {
    this.draftState.loading = loading;
  }

  setError(error: string | null): void {
    this.draftState.error = error;
  }

  setSelectedTest(test: TestInfo | null): void {
    this.draftState.selectedTest = test;
  }

  setFailingTests(failingTests: Set<string>): void {
    this.draftState.failingTests = failingTests;
  }

  setFilter(filter: FilterType): void {
    this.draftState.filter = filter;
  }
}

export function useFilteredTests() {
  const { tests, filter, failingTests } = TestsReducer.useData();
  switch(filter) {
    case 'all': return tests;
    case 'failing': return tests.filter(test => failingTests.has(test.key));
    case 'passing': return tests.filter(test => !failingTests.has(test.key));
  }
}
