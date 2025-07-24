import { IAskUser, NamedOptions, NamedResponse } from "../../src/types";
import { BankConfig } from "../config";


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

  forUsername(): Promise<string> {
    return Promise.resolve(this.username);
  }
  forPassword(): Promise<string> {
    return Promise.resolve(this.password);
  }
  forETransferRecipient(): Promise<string> {
    return Promise.resolve("fake_address@thecoin.io");
  }

  doNotCompleteETransfer(): boolean {
    return true;
  }
  selectOption(question: string, options: NamedOptions[]): Promise<NamedResponse> {
    throw new Error("Method not implemented.");
  }
  expectedETransferRecipient(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  forValue(_question: string): Promise<string> {
    throw new Error("Method not implemented.");
  }



}
