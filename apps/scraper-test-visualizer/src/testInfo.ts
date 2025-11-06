import type { Test } from "./types";
import { TestsReducer } from "./state/reducer";

export class TestInfo {
  basic: Test;

  constructor(basic: Test) {
    this.basic = basic;
  }

  // get folder() { return this.basic.folder; }
  get step() { return this.basic.key.split("-").slice(-1)[0]; }
  get element() { return this.basic.element; }
  get key() { return this.basic.key; }

  get isFailing() {
    return TestsReducer.useData().failingTests.has(this.key);
  }
}
