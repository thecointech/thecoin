import readline from 'readline/promises';
import { BankConfig } from "../config";
import type { ChoiceText, IAskUser, User2DChoice } from "../../src/types";


// Simple console input for data the user needs to provide
export class AskUserConsole implements IAskUser {

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
  async forUsername(): Promise<string> {
    return this.config.username!;
  }
  async forPassword(): Promise<string> {
    return this.config.password!;
  }
  async forETransferRecipient(): Promise<string> {
    return this.config.to_recipient!;
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
