import { log } from "@thecointech/logging";
import { PageHandler } from "../pageHandler";
import { ElementData, IAskUser } from "../types";
import { GetBaseApi, GetLoginApi } from "@thecointech/apis/vqa";
import { processorFn } from "./types";
import { enterValueIntoFound } from "@thecointech/scraper/replay";
import { FoundElement } from "@thecointech/scraper/types";
import { LoginFailedError } from "../errors";

export const Login = processorFn("Login", async (page: PageHandler, input: IAskUser)  => {
  return await login(page, input);
})

async function login(page: PageHandler, input: IAskUser) {
  // We have to detect the password before entering
  // the username.  The extra data of the username
  // entered into the username field can confuse the vLLM
  const api = GetLoginApi();
  page.onProgress(10);

  const { data: hasPassword } = await api.detectPasswordExists(await page.getImage());
  page.onProgress(25);

  // await enterUsernameAndRemember(page, input);
  await enterUsername(page, input, await page.getImage());
  page.onProgress(50);

  await enterPassword(page, input, hasPassword.password_input_detected);
  page.onProgress(75);

  await clickLogin(page);
  const outcome = await loginOutcome(page);
  return outcome;
}

// This was implemented as an experiment when struggling to bypass 2FA
// However, it hasn't been successful, and complicates the login process.
// Remove it for now, perhaps bring it back on day so leaving the comments

// async function enterUsernameAndRemember(page: PageHandler, input: IAskUser) {
//   // We keep this in it's own section,
//   // as on replay it shouldn't be necessary
//   // (the username field should already be filled in)
//   await using _ = page.pushSection("Username");

//   // First, has "remember me" been checked?
//   const image = await page.getImage();
//   const { data: rememberResponse } = await GetTwofaApi().getRememberInput(image);

//   try {
//     // Even if "remember me" is checked, we still attempt to enter a username
//     // This should handle false-positives as well
//     await enterUsername(page, input, image);

//     if (!rememberResponse.is_checked) {
//       const found = await page.toElement(rememberResponse, "remember", "input", "checkbox");
//       const clickedRemember = await clickElement(page.page, found, true, 10);
//       if (!clickedRemember) {
//         // It's possible that there is no remember checkbox
//         log.warn("Failed to click remember");
//       }
//     }
//   }
//   catch (e) {
//     // If "remember me" was checked, then it could be a non-issue failure
//     if (rememberResponse.is_checked) {
//       log.warn("Failed to enter username, but remember me was checked - continuing");
//     }
//     else {
//       throw e;
//     }
//   }
// }
async function enterUsername(page: PageHandler, input: IAskUser, image: File) {
  const username = await input.forUsername();
  const { data: inputResponse } = await GetLoginApi().detectUsernameInput(image);
  const element = await page.toElement(inputResponse, "username", "input", "text");

  const usernameToEnter = await getMostSimilarUsername(element.data, username);
  await enterUsernameIntoInput(page, usernameToEnter, element);
}

async function getMostSimilarUsername(element: ElementData, username: string) {
  // If this is a drop-down, are there elements that mostly match the username?
  if (element.options) {
    const { data: similar } = await GetBaseApi().detectMostSimilarOption(username, element.options);
    // Super-simple check - the first letter at least should match...
    if (similar.most_similar[0] == username[0]) {
      return similar.most_similar;
    }
  }
  return username;
}

async function enterUsernameIntoInput(page: PageHandler, username: string, element: FoundElement) {
  // Does the detected element already include the username?
  const pageValues = [element.data.text, element.data.nodeValue, ...(element.data.siblingText ?? [])];
  if (pageValues.map(t => t?.toLowerCase()).includes(username.toLowerCase())) {
    // Username already entered
    return;
  }
  const didEnter = await enterValueIntoFound(page.page, element, username);
  if (!didEnter) {
    await page.maybeThrow(new Error("Failed to enter username"));
  }
}

async function enterPassword(page: PageHandler, input: IAskUser, hasPassword: boolean) {
  const password = await input.forPassword();
  const api = GetLoginApi();
  // If no password input detected, it may be on the next page.
  if (!hasPassword) {
    const clickedContinue = await page.tryClick(api, "detectContinueElement", { name: "continue", htmlType: "button" });
    if (!clickedContinue) {
      await page.maybeThrow(new Error("Failed to click continue"));
    }
    const { data: hasPassword } = await api.detectPasswordExists(await page.getImage());
    if (!hasPassword.password_input_detected) {
      await page.maybeThrow(new Error("Failed to detect password input"));
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
    await page.maybeThrow(new Error("Failed to enter password"));
  }
}

async function clickLogin(page: PageHandler) {
  const api = GetLoginApi();
  const clickedLogin = await page.tryClick(api, "detectLoginElement", { name: "login", htmlType: "button" });
  if (!clickedLogin) {
    await page.maybeThrow(new Error("Failed to click login"));
  }
}

async function loginOutcome(page: PageHandler) {
  const { data: loginResult } = await GetLoginApi().detectLoginResult(await page.getImage());
  log.info(" ** Login result: " + loginResult.result);

  if (loginResult.result == "LoginError") {
    // most likely incorrect username/pwd
    const { data: hasError } = await GetLoginApi().detectLoginError(await page.getImage());
    log.warn(" ** Login error: " + hasError.error_message);
    await page.maybeThrow(new LoginFailedError(hasError));
  }
  return loginResult.result;
}
