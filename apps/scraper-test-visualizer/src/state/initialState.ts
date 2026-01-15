import type { TestInfo } from "../testInfo";
import type { FailingTest } from "../types";

export type FilterType = 'all' | 'passing' | 'failing';

export interface InitialState {
  tests: TestInfo[];
  loading: boolean;
  error: string | null;
  selectedTest: TestInfo | null;
  failingTests: FailingTest[];
  filter: FilterType;
  filterText: string;
}

export const initialState: InitialState = {
  tests: [],
  loading: false,
  error: null,
  selectedTest: null,
  failingTests: [],
  filter: 'all',
  filterText: '',
};
