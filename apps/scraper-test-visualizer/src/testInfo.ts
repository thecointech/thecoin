import type { Test } from "./types";

export class TestInfo {
  basic: Test;

  static failingTests: Test[] = [];

  constructor(basic: Test) {
    this.basic = basic;
  }

  get element() { return this.basic.fullname; }
  get key() { return this.basic.key; }

  get isFailing() {
    return TestInfo.failingTests.some(f => f.key === this.key && f.fullname === this.element);
  }
}
