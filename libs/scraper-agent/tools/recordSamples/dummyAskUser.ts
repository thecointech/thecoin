import type { IAskUser, NamedOptions, NamedResponse, CancellablePromise, QuestionValue, QuestionConfirm, QuestionOptions, QuestionOptions2D } from "../../src/types";
import { nonCancellable } from "../../src/types";
import type { BankConfig } from "../config";
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
  selectOption(basic: QuestionOptions): CancellablePromise<string> {
    const { options } = basic;
    const option = this.getAnswer("select");
    return nonCancellable(Promise.resolve(options[option]));
  }
  selectOption2D(basic: QuestionOptions2D): CancellablePromise<NamedResponse> {
    const { options2d } = basic;
    const { group, option } = this.getAnswer("option");
    return nonCancellable(Promise.resolve({
      name: options2d[group].name,
      option: options2d[group].options[option]
    }));
  }
  expectedETransferRecipient(): Promise<string> {
    return Promise.resolve(this.getAnswer("recipient"));
  }
  forValue(basic: QuestionValue): CancellablePromise<string> {
    return nonCancellable(Promise.resolve(this.getAnswer("value")));
  }
  forConfirm(basic: QuestionConfirm): CancellablePromise<boolean> {
    return nonCancellable(Promise.resolve(this.getAnswer("confirm")));
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
