import { IAskUser, NamedOptions, NamedResponse } from "../../src/types";
import { BankConfig } from "../config";
import fs from "node:fs";

export class DummyAskUser implements IAskUser {

  private _answerFile?: string

  // default username for getting "cannot login" error
  username: string = "1234567812345678"
  // Default password for getting "cannot login" message
  password: string = "1234oIOHHS!lyL"
  constructor(badValues: Partial<BankConfig> = {}, _answerFile?: string) {
    if (badValues.username) {
      this.username = badValues.username;
    }
    if (badValues.password) {
      this.password = badValues.password;
    }
    this._answerFile = _answerFile;
  }

  forUsername(): Promise<string> {
    return Promise.resolve(this.username);
  }
  forPassword(): Promise<string> {
    return Promise.resolve(this.password);
  }

  doNotCompleteETransfer(): boolean {
    return true;
  }
  // The following could be moved from Dummy to Mocked,
  // although it'd be nice to have automated responses
  selectOption(question: string, options: NamedOptions[]): Promise<NamedResponse> {
    const { group, option } = this.getAnswer("option");
    return Promise.resolve({
      name: options[group].name,
      option: options[group].options[option]
    });
  }
  expectedETransferRecipient(): Promise<string> {
    return Promise.resolve(this.getAnswer("recipient"));
  }
  forValue(question: string): Promise<string> {
    return Promise.resolve(this.getAnswer("value"));
  }

  getAnswer(type: string): any {
    if (this._answerFile && fs.existsSync(this._answerFile)) {
      const answers = JSON.parse(fs.readFileSync(this._answerFile, "utf-8"));
      if (answers[type]) {
        return answers[type];
      }
    }
    throw new Error("No answer file provided or answer not found");
  }
}
