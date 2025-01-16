import { GetLoginApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import { ProcessConfig } from "./types";


export class LoginWriter extends IntentWriter {

  static async process(config: ProcessConfig) {
    log.trace("LoginWriter: begin processing");
    const page = config.recorder.getPage();

    const writer = new LoginWriter(config, "Login");
    return await writer.login();
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
    const didEnter = await this.tryEnterText(api, "detectUsernameInput", {
      text: username,
      name: "username",
      htmlType: "input",
      inputType: "text",
    });
    if (!didEnter) {
      throw new Error("Failed to enter username");
    }
  }

  async enterPassword(hasPassword: boolean) {
    const password = await this.askUser.forPassword();
    const api = GetLoginApi();
    // If no password input detected, it may be on the next page.
    if (!hasPassword) {
      const clickedContinue = await this.tryClick(api, "detectContinueElement", { name: "continue", htmlType: "button" });
      if (!clickedContinue) {
        throw new Error("Failed to click continue");
      }
      const { data: hasPassword } = await api.detectPasswordExists(await this.getImage());
      if (!hasPassword.password_input_detected) {
        throw new Error("Failed to detect password input");
      }

      await this.updatePageName("password");
    }

    const didEnter = await this.tryEnterText(api, "detectPasswordInput", {
      text: password,
      name: "password",
      htmlType: "input",
      inputType: "password",
    });
    if (!didEnter) {
      throw new Error("Failed to enter password");
    }
  }

  async clickLogin() {
    const api = GetLoginApi();
    const clickedLogin = await this.tryClick(api, "detectLoginElement", { name: "login", htmlType: "button" });
    if (!clickedLogin) {
      throw new Error("Failed to click login");
    }
  }

  async loginOutcome() {
    const { data: loginResult } = await GetLoginApi().detectLoginResult(await this.getImage());
    log.info(" ** Login result: " + loginResult.result);
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



// class DummySerializer implements ITestSerializer {

//   constructor() {
//   }
//   async writeScreenshot(page: Page, state: TestState): Promise<void> {
//     log.trace("DummySerializer: writeScreenshot");
//   }
//   writeJson(data: any, test: TestElement): void {
//     log.trace("DummySerializer: writeJson");
//   }

// }
