import { ElementResponse } from "@thecointech/vqa";
import readline from 'readline/promises';

export type ElementOptions = Record<string, ElementResponse[]>;

export interface IAskUser {
  forValue(question: string): Promise<string>;
  selectOption(question: string, options: ElementOptions): Promise<ElementResponse>;
}

export class AskUser implements IAskUser {

  private rlp: readline.Interface;

  constructor() {
    // In NodeJS
    this.rlp = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async forValue(question: string): Promise<string> {
    return this.rlp.question(question);
  }
  async selectOption(question: string, options: ElementOptions): Promise<ElementResponse> {
    this.rlp.write(`\n${question}\n`);
    const entries = Object.entries(options);
    for (let i = 0; i < entries.length; i++) {
      const [key, value] = entries[i];
      this.rlp.write(`[${i}] ${key}: ${value[0].content}\n`);
    }
    const option = await this.forValue("Select an option: ");
    return entries[parseInt(option)][1][0];
  }

  [Symbol.dispose]() {
    this.rlp.close();
  }
}
