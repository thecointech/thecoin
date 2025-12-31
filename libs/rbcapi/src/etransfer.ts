import { ApiAction } from "./action";
import { log } from "@thecointech/logging";
import { ETransferPacket } from "@thecointech/types";

export async function send(prefix: string, amount: number, name:string, packet: ETransferPacket)
{
  const act = await ApiAction.New(prefix, true);
  const { page } = act;

  const { message, email, question, answer } = packet;

  // Navigate to old account page
  await act.clickOnText("Current Account", "a");

  await act.clickOnText("Pay Bills & Transfer Funds", "a")
  await page.type('#amount', amount.toString());
  await page.click('#emtrbccust');
  await act.clickAndNavigate('#id_btn_submit', 'Recipient');
  await page.type('#EMT_NAME_ID', name);
  await page.type('#EMT_EMAILADDRESS_ID', email);
  await act.clickAndNavigate('#id_btn_continue', 'QnA');

  const isAuto = await isAutodeposit(act);

  // if not autodeposit, fill out the details
  if (!isAuto) {
    await page.type('#EMT_QUESTION_ID', question);
    await page.type('#EMT_RESPONSE_ID', answer);
    await page.type('#EMT_CONFIRM_RESPONSE_ID', answer);
  }

  // The memo is always available
  if (message != null)
  {
    await page.type('#eMemo', message);
  }
  await act.clickAndNavigate('#id_btn_confirm', 'Confirm');
  //Promise.all([page.click('#id_btn_confirm'), page.waitForNavigation()]);

  // This incredbily flaky selector means it's time to port RBC to the new scraper API
  const selector = "#layout-column-main > table > tbody > tr > td > div > section > div > div > div > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(7) > tbody > tr:nth-child(2) > td.bodyText"
  const innerText = await page.evaluate(() => (document.querySelector(selector) as HTMLElement).innerText);
  if (innerText)
  {
    try {
      return parseInt(innerText);
    }
    catch (e) {
      log.error(`Couldn't parse confirmation number from: ${innerText} - ${e}`);
    }
  }
  log.error(`No confirmation number found for eTransfer to ${email}`);
  return 0;
}

async function isAutodeposit({page}: ApiAction) {
  // Check to see which kind of selector appears first
  const isAutodeposit = async () => {
    await page.waitForSelector("::-p-xpath(//*[contains(., 'email address is registered for Autodeposit')])");
    return true;
  }
  const isRegular = async () => {
    await page.waitForSelector('#EMT_QUESTION_ID');
    return false;
  }
  return Promise.any([isAutodeposit(), isRegular()]);
}
