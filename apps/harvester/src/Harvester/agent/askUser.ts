import { ChoiceText, IAskUser, User2DChoice } from "@thecointech/scraper-agent";

export class AskUserReact implements IAskUser {
  forValue(question: string): Promise<string> {
    // TODO
    throw new Error("Method not implemented.");
  }
  selectOption<T extends object>(question: string, options: User2DChoice<T>, z: ChoiceText<T>): Promise<T> {
    // TODO
    throw new Error("Method not implemented.");
  }
  forUsername(): Promise<string> {
    // TODO
    throw new Error("Method not implemented.");
  }
  forPassword(): Promise<string> {
    // TODO
    throw new Error("Method not implemented.");
  }
  forETransferRecipient(): Promise<string> {
    // TODO
    throw new Error("Method not implemented.");
  }

  static get instance(): IAskUser {
    throw new Error("Method not implemented.");
  }
}
