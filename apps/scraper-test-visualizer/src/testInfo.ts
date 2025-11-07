import type { Test } from "./types";
import { TestsReducer } from "./state/reducer";

export class TestInfo {
  basic: Test;

  static failingTests: Set<string> = new Set();

  constructor(basic: Test) {
    this.basic = basic;
  }

  get step() { return this.basic.key.split("-").slice(-1)[0]; }
  get element() { return this.basic.element; }
  get key() { return this.basic.key; }

  get isFailing() {
    return TestInfo.failingTests.has(this.key);
  }
}
