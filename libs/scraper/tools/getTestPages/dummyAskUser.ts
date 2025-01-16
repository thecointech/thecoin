import { IAskUser, User2DChoice, ChoiceText } from "./askUser";
import { BankConfig } from "./config";


export class DummyAskUser implements IAskUser {

  // default username for getting "cannot login" error
  username: string = "1234567812345678"
  // Default password for getting "cannot login" message
  password: string = "1234oIOHHS!lyL"
  constructor(badValues: Partial<BankConfig> = {}) {
    if (badValues.username) {
      this.username = badValues.username;
    }
    if (badValues.password) {
      this.password = badValues.password;
    }
  }
  forValue(question: string): Promise<string> {
    throw new Error("Method not implemented.");
  }

  selectOption<T extends object>(question: string, options: User2DChoice<T>, z: ChoiceText<T>): Promise<T> {
    throw new Error("Method not implemented.");
  }
  forUsername(): Promise<string> {
    return Promise.resolve(this.username);
  }
  forPassword(): Promise<string> {
    return Promise.resolve(this.password);
  }
}
