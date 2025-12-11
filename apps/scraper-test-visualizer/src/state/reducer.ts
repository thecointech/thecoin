import { BaseReducer } from '@thecointech/shared/store/immerReducer';
import { initialState, type InitialState, type FilterType } from './initialState';
import { TestInfo } from '../testInfo';
import { FailingTest } from '../types';

export const TESTS_KEY = "tests";

export interface IActions {
  setTests(tests: TestInfo[]): void;
  setLoading(loading: boolean): void;
  setError(error: string | null): void;
  setSelectedTest(test: TestInfo | null): void;
  setFailingTests(failingTests: FailingTest[]): void;
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

  setFailingTests(failingTests: FailingTest[]): void {
    this.draftState.failingTests = failingTests;
    TestInfo.failingTests = failingTests;
  }

  setFilter(filter: FilterType): void {
    this.draftState.filter = filter;
  }
}

export function useFilteredTests() {
  const { tests, filter, failingTests } = TestsReducer.useData();
  switch(filter) {
    case 'all': return tests;
    case 'failing': return tests.filter(test => failingTests.some(f => f.key === test.key && f.element === test.element));
    case 'passing': return tests.filter(test => !failingTests.some(f => f.key === test.key && f.element === test.element));
  }
}
