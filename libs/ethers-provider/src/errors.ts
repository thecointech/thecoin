import type { SrcCodeResponse } from "./types";

export class InvalidContractError extends SyntaxError {
  constructor(e: SyntaxError, public contract: SrcCodeResponse) {
    super(e.message);
    this.name = e.name;
    this.stack = e.stack;
    this.cause = e;
  }
}
