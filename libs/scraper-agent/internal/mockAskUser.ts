import { IAskUser, NamedOptions, NamedResponse } from "../src/types";
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
  // The following could be moved from Dummy to Mocked,
  // although it'd be nice to have automated responses
  selectOption(question: string, options: NamedOptions[]): Promise<NamedResponse> {
    const { group, option } = this.callback("option", question, options);
    return Promise.resolve({
      name: options[group].name,
      option: options[group].options[option]
    });
  }
  expectedETransferRecipient(): Promise<string> {
    return Promise.resolve(this.callback("recipient"));
  }
  forValue(question: string): Promise<string> {
    return Promise.resolve(this.callback("value", question));
  }
}

export type QuestionType = "option" | "recipient" | "value";
export type AnswerCallback = (type: QuestionType, question?: string, options?: NamedOptions[]) => any;
// Default is to read the answer from a file
export const getAnswerFromFileIfExists = (matchedFolder: string, step: string) : AnswerCallback => {
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
