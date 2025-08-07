import readline from 'readline/promises';
import { BankConfig } from "../config";
import type { IAskUser, NamedOptions, NamedResponse } from "../../src/types";


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

  async forValue(question: string, options?: string[]): Promise<string> {
    return options
      ? this.selectString(question, options)
      : this.rlp.question(`${question}: `);
  }

  async selectOption(question: string, options: NamedOptions[]): Promise<NamedResponse> {
    this.rlp.write(`\n${question}\n`);
    // const entries = Object.entries(options);
    const flatEntries = options.flatMap(o => o.options.map((v) => [o.name, v] as const));
    for (let i = 0; i < flatEntries.length; i++) {
      const [key, value] = flatEntries[i];
      this.rlp.write(`[${i}] ${key}: ${value}\n`);
    }
    const option = await this.forValue("Select an option");
    return {
      name: flatEntries[parseInt(option)][0],
      option: flatEntries[parseInt(option)][1]
    };
  }

  async selectString(question: string, options: string[]): Promise<string> {
    this.rlp.write(`\n${question}\n`);
    for (let i = 0; i < options.length; i++) {
      this.rlp.write(`[${i}] ${options[i]}\n`);
    }
    const option = await this.forValue("Select an option");
    return options[parseInt(option)];
  }

  [Symbol.dispose]() {
    this.rlp.close();
  }
}
