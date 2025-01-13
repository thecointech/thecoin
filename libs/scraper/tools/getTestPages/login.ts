import type { Page } from "puppeteer";
import { GetLoginApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { ProcessConfig } from "./types";
import { ITestSerializer, TestElement, TestState } from "./testSerializer";
import { IAskUser, User2DChoice } from "./askUser";


export class LoginWriter extends IntentWriter {

  static async process(config: ProcessConfig) {
    log.trace("LoginWriter: begin processing");
    const page = config.recorder.getPage();
    const loginUrl = page.url();

    // Our first run uses dummy data & should fail,
    {
      const writer = new LoginWriter({
        ...config,
        askUser: new DummyAskUser(),
      }, "Login");
      // There should always be a username here
      const outcome = await writer.login();
      if (outcome != "LoginError") {
        throw new Error("Login should have failed");
      }
    }

    // If we have details, we do a real login attempt
    if (await config.askUser.forUsername()) {
      // reset the login page
      await page.goto(loginUrl);
      // Now try again with the correct data,
      // but don't overwrite existing data ()
      const writer = new LoginWriter({
        ...config,
        writer: new DummySerializer()
      }, "Login");
      return await writer.login();
    }
    return "LoginError";
  }

  async login() {
    // We have to detect the password before entering
    // the username.  The extra data of the username
    // entered into the username field can confuse the vLLM
    const api = GetLoginApi();
    const { data: hasPassword } = await api.detectPasswordExists(await this.getImage());

    await this.enterUsername();
    await this.enterPassword(hasPassword.password_input_detected);
    await this.clickLogin();
    return await this.loginOutcome();
  }

  async enterUsername() {
    const username = await this.askUser.forUsername();
    const api = GetLoginApi();
    const didEnter = await this.tryEnterText(api, "detectUsernameInput", username, "username", "input", "text");
    if (!didEnter) {
      throw new Error("Failed to enter username");
    }
  }

  async enterPassword(hasPassword: boolean) {
    const password = await this.askUser.forPassword();
    const api = GetLoginApi();
    // If no password input detected, it may be on the next page.
    if (!hasPassword) {
      const clickedContinue = await this.tryClick(api, "detectContinueElement", "continue");
      if (!clickedContinue) {
        throw new Error("Failed to click continue");
      }
      await this.waitForPageLoaded();
      const { data: hasPassword } = await api.detectPasswordExists(await this.getImage());
      if (!hasPassword.password_input_detected) {
        throw new Error("Failed to detect password input");
      }

      await this.updatePageName("password");
    }

    const didEnter = await this.tryEnterText(api, "detectPasswordInput", password, "password", "input", "password");
    if (!didEnter) {
      throw new Error("Failed to enter password");
    }
  }

  async clickLogin() {
    const api = GetLoginApi();
    const clickedLogin = await this.tryClick(api, "detectLoginElement", "login");
    if (!clickedLogin) {
      throw new Error("Failed to click login");
    }
    await this.waitForPageLoaded();
  }

  async loginOutcome() {
    const { data: loginResult } = await GetLoginApi().detectLoginResult(await this.getImage());

    switch (loginResult.result) {
      case "LoginSuccess":
        // await this.updatePageIntent();
        break;
      // case "TwoFactorAuth":
      //   return "TwoFactorAuth"; // How to handle this?
      case "LoginError":
        await this.updatePageName("failed");
        // If we are still on a login page, is there an error message?
        const { data: hasError } = await GetLoginApi().detectLoginError(await this.getImage());
        if (hasError.error_message_detected) {
          this.writeJson({
            text: hasError.error_message,
          }, "failed");
        }
        break;
    }
    return loginResult.result;
  }
}



class DummyAskUser implements IAskUser {
  forValue(question: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
  selectOption<T extends object>(question: string, options: User2DChoice<T>, z: keyof { [K in keyof T as T[K] extends string ? K : never]: T[K]; }): Promise<T> {
    throw new Error("Method not implemented.");
  }
  forUsername(): Promise<string> {
    return Promise.resolve("1234567812345678");
  }
  forPassword(): Promise<string> {
    // Banks give different errors depending on the password strength
    return Promise.resolve("1234oIOHHS!lyL");
  }
}

class DummySerializer implements ITestSerializer {
  async writeScreenshot(page: Page, state: TestState): Promise<void> {
    log.trace("DummySerializer: writeScreenshot");
  }
  writeJson(data: any, test: TestElement): void {
    log.trace("DummySerializer: writeJson");
  }

}
