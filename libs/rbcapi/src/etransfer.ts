import { ApiAction } from "./action";
import { log } from "@the-coin/logging";
import { ETransferPacket } from "@the-coin/types";


export async function send(prefix: string, amount: number, name:string, packet: ETransferPacket)
{
  const act = await ApiAction.New(prefix, true);
  const { page } = act;

  const { message, email, question, answer } = packet;

  // Navigate to old account page
  await act.clickOnText(ApiAction.Credentials.accountNo, "a");

  await act.clickOnText("Pay Bills & Transfer Funds", "a")
  await page.type('#amount', amount.toString());
  await page.click('#emtrbccust');
  await act.clickAndNavigate('#id_btn_submit', 'Recipient');
  await page.type('#EMT_NAME_ID', name);
  await page.type('#EMT_EMAILADDRESS_ID', email);
  await act.clickAndNavigate('#id_btn_continue', 'QnA');
  await page.type('#EMT_QUESTION_ID', question);
  await page.type('#EMT_RESPONSE_ID', answer);
  await page.type('#EMT_CONFIRM_RESPONSE_ID', answer);
  if (message != null)
  {
    await page.type('#eMemo', message);
  }
  await act.clickAndNavigate('#id_btn_confirm', 'Confirm');
  //Promise.all([page.click('#id_btn_confirm'), page.waitForNavigation()]);

  const innerText = await page.evaluate(() => (document.querySelector(':nth-child(8) > tbody > :nth-child(2) > .bodyText') as HTMLElement).innerText);
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

