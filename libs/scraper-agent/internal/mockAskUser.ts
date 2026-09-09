import { IAskUser, NamedOptions, NamedResponse, CancellablePromise, nonCancellable, QuestionValue, QuestionConfirm, QuestionOptions, QuestionOptions2D } from "../src/types";
import fs from "node:fs";

export class MockAskUser implements IAskUser {


  private callback: AnswerCallback;

  constructor(callback: AnswerCallback) {
    this.callback = callback;
  }
  setCallback(callback: AnswerCallback) {
    this.callback = callback;
  }

  forUsername(): Promise<string> {
    return Promise.resolve("mocked_user");
  }
  forPassword(): Promise<string> {
    return Promise.resolve("mocked_password");
  }

  doNotCompleteETransfer(): boolean {
    return true;
  }
  forValue(basic: QuestionValue): CancellablePromise<string> {
    return nonCancellable(Promise.resolve(this.callback("value", basic.question)));
  }
  forConfirm(basic: QuestionConfirm): CancellablePromise<boolean> {
    return nonCancellable(Promise.resolve(this.callback("confirm", basic.question)))
  }
  // The following could be moved from Dummy to Mocked,
  // although it'd be nice to have automated responses
  selectOption(basic: QuestionOptions): CancellablePromise<string> {
    const { options } = basic;
    const option = this.callback("select", basic.question, options);
    return nonCancellable(Promise.resolve(options[option]));
  }
  selectOption2D(basic: QuestionOptions2D): CancellablePromise<NamedResponse> {
    const { options2d } = basic;
    const { group, option } = this.callback("option", basic.question, options2d);
    return nonCancellable(Promise.resolve({
      name: options2d[group].name,
      option: options2d[group].options[option]
    }));
  }
  expectedETransferRecipient(): Promise<string> {
    return Promise.resolve(this.callback("recipient"));
  }
}

export type QuestionType = "option" | "select" | "confirm" | "recipient" | "value";
export type AnswerCallback = (type: QuestionType, question?: string, options?: string[] | NamedOptions[]) => any;
// Default is to read the answer from a file
export const getAnswerFromFileIfExists = (matchedFolder: string, step: number) : AnswerCallback => {
  const answerFile = `${matchedFolder}/${step}-answers.json`;
  if (fs.existsSync(answerFile)) {
    return (type: QuestionType) => {
      const answers = JSON.parse(fs.readFileSync(answerFile, "utf-8"));
      if (answers[type]) {
        return answers[type];
      }
    }
  }
  return () => {
    throw new Error("No answer file provided or answer not found");
  }
}
