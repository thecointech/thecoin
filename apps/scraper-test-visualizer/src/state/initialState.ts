import type { TestInfo } from "../testInfo";

export type FilterType = 'all' | 'passing' | 'failing';

export interface InitialState {
  tests: TestInfo[];
  loading: boolean;
  error: string | null;
  selectedTest: TestInfo | null;
  failingTests: Set<string>;
  filter: FilterType;
}

export const initialState: InitialState = {
  tests: [],
  loading: false,
  error: null,
  selectedTest: null,
  failingTests: new Set(),
  filter: 'all',
};
