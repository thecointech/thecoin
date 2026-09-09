import readline from 'readline/promises';
import type { BankConfig } from "../config";
import type { IAskUser, NamedResponse, CancellablePromise, QuestionValue, QuestionConfirm, QuestionOptions, QuestionOptions2D } from "../../src/types";
import { nonCancellable } from "../../src/types";


// Simple console input for data the user needs to provide
export class AskUserConsole implements IAskUser {

  private rlp: readline.Interface;
  private config: Partial<BankConfig>;

  useBadLogin = false;

  constructor(config: Partial<BankConfig> = {}) {
    this.config = config;
    // In NodeJS
    this.rlp = readline.createInterface({
      input: process.stdin as NodeJS.ReadableStream,
      output: process.stdout as NodeJS.WritableStream
    });
  }

  doNotCompleteETransfer(): boolean {
    return true;
  }
  async forUsername(): Promise<string> {
    if (this.useBadLogin) {
      return this.config.bad_credentials?.username ?? "1234567812345678";
    }
    return this.config.username!;
  }
  async forPassword(): Promise<string> {
    if (this.useBadLogin) {
      return this.config.bad_credentials?.password ?? "1234oIOHHS!lyL";
    }
    return this.config.password!;
  }

  async expectedETransferRecipient(): Promise<string> {
    return this.config.to_recipient!;
  }

  forValue(basic: QuestionValue): CancellablePromise<string> {
    return this.cancellable(`${basic.question}: `, (value) => value);
  }

  forConfirm(basic: QuestionConfirm): CancellablePromise<boolean> {
    return this.cancellable(`${basic.confirm} (y/n): `, (answer) => answer.toLowerCase().startsWith("y"));
  }

  selectOption(basic: QuestionOptions): CancellablePromise<string> {
    const { question, options } = basic;
    if (this.config.questions?.[question]) {
      // Ensure this answer is an option
      const answer = this.config.questions[question];
      if (options.find(o => o == answer)) {
        return nonCancellable(Promise.resolve(answer));
      }
    }

    this.rlp.write(`\n${question}\n`);
    for (let i = 0; i < options.length; i++) {
      this.rlp.write(`[${i}] ${options[i]}\n`);
    }
    return this.cancellable("Select an option: ", (option) => options[parseInt(option)]);
  }

  selectOption2D(basic: QuestionOptions2D): CancellablePromise<NamedResponse> {
    const { question, options2d } = basic;
    const flatEntries = options2d.flatMap(o => o.options.map((v) => [o.name, v] as const));
    this.rlp.write(`\n${question}\n`);
    for (let i = 0; i < flatEntries.length; i++) {
      const [key, value] = flatEntries[i];
      this.rlp.write(`[${i}] ${key}: ${value}\n`);
    }
    return this.cancellable("Select an option: ", (option) => ({
      name: flatEntries[parseInt(option)][0],
      option: flatEntries[parseInt(option)][1]
    }));
  }

  [Symbol.dispose]() {
    this.rlp.close();
  }

  cancellable<T>(question: string, then: (value: string) => T): CancellablePromise<T> {
    const aborter = new AbortController();
    const cp = this.rlp.question(question, aborter);
    const cp2 = cp.then(then) as CancellablePromise<T>;
    cp2.cancel = () => aborter.abort();
    return cp2;
  }
}
