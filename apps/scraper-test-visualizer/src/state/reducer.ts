import { BaseReducer } from '@thecointech/redux';
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
  setFilterText(filterText: string): void;
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

  setFilterText(filterText: string): void {
    this.draftState.filterText = filterText;
  }
}

export function useFilteredTests() {
  const { tests, filter, failingTests, filterText } = TestsReducer.useData();

  let filtered = tests;

  // Apply filter type
  switch(filter) {
    case 'all':
      filtered = tests;
      break;
    case 'failing':
      filtered = tests.filter(test => failingTests.some(f => f.key === test.key && f.element === test.element));
      break;
    case 'passing':
      filtered = tests.filter(test => !failingTests.some(f => f.key === test.key && f.element === test.element));
      break;
  }

  // Apply text filter
  if (filterText.trim()) {
    const searchText = filterText.toLowerCase();
    filtered = filtered.filter(test => test.key.toLowerCase().includes(searchText));
  }

  return filtered;
}

export function useFilteredFailingTests() {
  const { failingTests, filterText } = TestsReducer.useData();

  if (!filterText.trim()) {
    return failingTests;
  }

  const searchText = filterText.toLowerCase();
  return failingTests.filter(ft => ft.key.toLowerCase().includes(searchText));
}
