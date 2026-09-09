import { AskUserReact } from "./askUser";
import type { CancellablePromise, IAskUser, NamedResponse, QuestionConfirm, QuestionOptions, QuestionOptions2D, QuestionValue } from "@thecointech/scraper-agent";

type Login = {
  username: string,
  password: string,
}

export class AskUserLogin extends AskUserReact implements IAskUser {

  depositAddress?: string;
  login: Login;

  constructor(login: Login, depositAddress?: string) {
    super();
    this.login = login;
    this.depositAddress = depositAddress;
  }
  // To prevent sending a gazillion ETransfers during dev/testing
  doNotCompleteETransfer(): boolean {
    // Do not complete in any development build
    if (process.env.DO_NOT_SEND_ETRANSFER) {
      return true;
    }
    // Do not complete in any non-prod build
    return (
      process.env.CONFIG_NAME !== 'prod' &&
      process.env.CONFIG_NAME !== 'prodbeta'
    );
  }

    forValue(basic: QuestionValue): CancellablePromise<string> {
      return this.sendQuestion<string>(basic);
    }

    forConfirm(basic: QuestionConfirm): CancellablePromise<boolean> {
      return this.sendQuestion<boolean>(basic);
    }

    selectOption(basic: QuestionOptions): CancellablePromise<string> {
      return this.sendQuestion<string>(basic);
    }

    selectOption2D(basic: QuestionOptions2D): CancellablePromise<NamedResponse> {
      return this.sendQuestion<NamedResponse>(basic);
    }

  expectedETransferRecipient(): Promise<string> {
    if (!this.depositAddress) {
      throw new Error("Deposit address not set");
    }
    return Promise.resolve(this.depositAddress);
  }

  forUsername(): Promise<string> {
    return Promise.resolve(this.login.username);
  }
  forPassword(): Promise<string> {
    return Promise.resolve(this.login.password);
  }

  static newLoginSession(login: Login, depositAddress?: string) {
    const instance = new AskUserLogin(login, depositAddress);
    return instance;
  }
}
