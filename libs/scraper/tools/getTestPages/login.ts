import type { Page } from "puppeteer";
import { GetLoginApi, GetTwofaApi } from "@thecointech/apis/vqa";
import { IntentWriter } from "./testPageWriter";
import { log } from "@thecointech/logging";
import type { BankConfig } from "./config";
import { sleep } from "@thecointech/async";
import { TwoFAWriter } from "./twofa";


export class LoginWriter extends IntentWriter {

  static async process(page: Page, name: string, config: BankConfig) {
    log.trace("LoginWriter: begin processing");
    const writer = new LoginWriter(page, name, "Login");
    await writer.setNewState("initial");
    // There should always be a username here
    await writer.enterUsername(config.username!);
    await writer.enterPassword(config.password!);
    await writer.clickLogin();
    return await writer.waitLoginOutcome();
  }

  async enterUsername(username: string) {
    const api = GetLoginApi();
    const didEnter = await this.tryEnterText(api, "detectUsernameInput", username, "username", "input", "text");
    if (!didEnter) {
      throw new Error("Failed to enter username");
    }
  }

  async enterPassword(password: string) {
    const api = GetLoginApi();
    const { data: hasPassword } = await api.detectPasswordExists(await this.getImage());
    // If no password input detected, it may be on the next page.
    if (!hasPassword.password_input_detected) {
      const clickedContinue = await this.tryClick(api, "detectContinueElement", "continue");
      if (!clickedContinue) {
        throw new Error("Failed to click continue");
      }
      const { data: hasPassword } = await api.detectPasswordExists(await this.getImage());
      if (!hasPassword.password_input_detected) {
        throw new Error("Failed to detect password input");
      }

      await this.setNewState("password");
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

  async waitLoginOutcome() {
    // Wait a few extra seconds to ensure page is fully loaded
    for (let i = 0; i < 5; i++) {
      await sleep(2500);
      const { data: loginResult } = await GetLoginApi().detectLoginResult(await this.getImage());

      switch(loginResult.result) {
      case "LoginSuccess":
        return await this.updatePageIntent();
      case "TwoFactorAuth":
        return "TwoFactorAuth"; // How to handle this?
      case "LoginError":
        await this.setNewState("failed");
        // If we are still on a login page, is there an error message?
        const { data: hasError } = await GetLoginApi().detectLoginError(await this.getImage());
        if (hasError.error_message_detected) {
          await this.setNewState("failed");
          this.saveJson({
            text: hasError.error_message,
          }, "failed");
          throw new Error("LoginWriter: Login failed: " + hasError.error_message);
        }
      }
    }
  }
}



