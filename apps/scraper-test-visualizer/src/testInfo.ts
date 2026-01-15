import type { FailingTest, Test } from "./types";

export class TestInfo {
  basic: Test;

  static failingTests: FailingTest[] = [];

  constructor(basic: Test) {
    this.basic = basic;
  }

  get element() { return this.basic.fullname; }
  get key() { return this.basic.key; }

  get isFailing() {
    return TestInfo.failingTests.some(f => f.key === this.key && f.element === this.element);
  }
}
