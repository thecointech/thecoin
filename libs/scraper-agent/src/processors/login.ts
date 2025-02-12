import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";
import { IAskUser } from "../types";
import { GetLoginApi } from "@thecointech/apis/vqa";
import { processorFn, SectionProgressCallback } from "./types";

export const Login = processorFn("Login", async (page: PageHandler, onProgress: SectionProgressCallback, input: IAskUser)  => {
  return await login(page, onProgress, input);
})

async function login(page: PageHandler, onProgress: SectionProgressCallback, input: IAskUser) {
  // We have to detect the password before entering
  // the username.  The extra data of the username
  // entered into the username field can confuse the vLLM
  const api = GetLoginApi();
  onProgress(10);

  const { data: hasPassword } = await api.detectPasswordExists(await page.getImage());
  onProgress(25);

  await enterUsername(page, input);
  onProgress(50);

  await enterPassword(page, input, hasPassword.password_input_detected);
  onProgress(75);

  await clickLogin(page);
  const outcome = await loginOutcome(page);
  onProgress(100);

  return outcome;
}

async function enterUsername(page: PageHandler, input: IAskUser) {
  const username = await input.forUsername();
  const api = GetLoginApi();
  const didEnter = await page.tryEnterText(api, "detectUsernameInput", {
    text: username,
    name: "username",
    htmlType: "input",
    inputType: "text",
  });
  if (!didEnter) {
    throw new Error("Failed to enter username");
  }
}

async function enterPassword(page: PageHandler, input: IAskUser, hasPassword: boolean) {
  const password = await input.forPassword();
  const api = GetLoginApi();
  // If no password input detected, it may be on the next page.
  if (!hasPassword) {
    const clickedContinue = await page.tryClick(api, "detectContinueElement", { name: "continue", htmlType: "button" });
    if (!clickedContinue) {
      throw new Error("Failed to click continue");
    }
    const { data: hasPassword } = await api.detectPasswordExists(await page.getImage());
    if (!hasPassword.password_input_detected) {
      throw new Error("Failed to detect password input");
    }

    // await this.updatePageName("password");
  }

  const didEnter = await page.tryEnterText(api, "detectPasswordInput", {
    text: password,
    name: "password",
    htmlType: "input",
    inputType: "password",
  });
  if (!didEnter) {
    throw new Error("Failed to enter password");
  }
}

async function clickLogin(page: PageHandler) {
  const api = GetLoginApi();
  const clickedLogin = await page.tryClick(api, "detectLoginElement", { name: "login", htmlType: "button" });
  if (!clickedLogin) {
    throw new Error("Failed to click login");
  }
}

async function loginOutcome(page: PageHandler) {
  const { data: loginResult } = await GetLoginApi().detectLoginResult(await page.getImage());
  log.info(" ** Login result: " + loginResult.result);

  if (loginResult.result == "LoginError") {
    const { data: hasError } = await GetLoginApi().detectLoginError(await page.getImage());
    if (hasError.error_message_detected) {
      log.warn("LoginWriter: Found error message: " + hasError.error_message);
      // this.writeJson({
      //   text: hasError.error_message,
      // }, "failed");
    }
  }
  return loginResult.result;
}
