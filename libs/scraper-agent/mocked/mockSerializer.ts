export class AgentSerializer implements Disposable {

  constructor() {
    // No-op, this is an empty class
  }

  dispose(): void {
    // No-op
  }

  [Symbol.dispose](): void {
    this.dispose();
  }
}
