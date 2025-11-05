import type { Test } from "./types";

export class TestInfo {
  basic: Test;

  constructor(basic: Test) {
    this.basic = basic;
  }

  get folder() { return this.basic.folder; }
  get step() { return this.basic.step; }
  get element() { return this.basic.element; }
  get key() { return `${this.basic.folder}-${this.basic.step}`; }

  get isFailing() { return false; }
}
