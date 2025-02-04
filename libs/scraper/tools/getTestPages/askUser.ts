import { ElementResponse } from "@thecointech/vqa";
import readline from 'readline/promises';
import { BankConfig, TestConfig } from "./config";

export type User2DChoice<T> = Record<string, T[]>
export type ElementOptions = User2DChoice<ElementResponse>;
export type ChoiceText<T> = keyof {
  [K in keyof T as T[K] extends string ? K : never]: T[K]
}

export interface IAskUser {
  forValue(question: string): Promise<string>;
  selectOption<T extends object>(question: string, options: User2DChoice<T>, z: ChoiceText<T>): Promise<T>;

  forUsername(): Promise<string | undefined>;
  forPassword(): Promise<string | undefined>;

  forETransferRecipient(): Promise<string | undefined>;
}

export class AskUser implements IAskUser {

  private rlp: readline.Interface;
  private config: Partial<BankConfig>

  constructor(config: Partial<BankConfig> = {}) {
    this.config = config;
    // In NodeJS
    this.rlp = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }
  async forUsername(): Promise<string|undefined> {
    return this.config.username;
  }
  async forPassword(): Promise<string|undefined> {
    return this.config.password;
  }
  async forETransferRecipient(): Promise<string|undefined> {
    return this.config.to_recipient;
  }

  async forValue(question: string): Promise<string> {
    return this.rlp.question(`${question}: `);
  }
  async selectOption<T extends object>(question: string, options: User2DChoice<T>, z: ChoiceText<T> ): Promise<T> {
    this.rlp.write(`\n${question}\n`);
    const entries = Object.entries(options);
    const flatEntries = entries.flatMap(([k, arr]) => arr.map((v) => [k, v] as const));
    for (let i = 0; i < flatEntries.length; i++) {
      const [key, value] = flatEntries[i];
      this.rlp.write(`[${i}] ${key}: ${value[z]}\n`);
    }
    const option = await this.forValue("Select an option");
    return flatEntries[parseInt(option)][1];
  }

  [Symbol.dispose]() {
    this.rlp.close();
  }
}
