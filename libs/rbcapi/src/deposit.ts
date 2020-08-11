import { DepositResult, ETransferErrorCode } from "./types";
import { ApiAction } from "./action";
import { Page } from "puppeteer";

export async function depositETransfer(prefix: string, url: string, code: string, progressCb: (v: string) => void): Promise < DepositResult > {
	try {
		return await completeDeposit(prefix, url, code, progressCb);
	}
  catch(e) {
		return getErrorResult(JSON.stringify(e))
	}
}


async function completeDeposit(prefix: string, url: string, code: string, progressCb: (v: string) => void): Promise<DepositResult> {

  progressCb("Initializing Bank API");

	const act = await ApiAction.New(prefix);
	const { page } = act;

	await page.goto(url);
	await act.writeStep('Select Bank');

	// Find the link to RBC and click it.
	const rbcLogo = await page.$("#fi-logo-CA000003 > img");
	if (rbcLogo == null) {
		return findErrorResult(page); // TODO: figure out what went wrong?
	}

	rbcLogo.click();
	await page.waitForSelector("#K1");
	await act.writeStep('Enter username & pwd');

	progressCb("Connecting Bank API");
	await act.login();

	progressCb("Entering Deposit Details");

	// Input the code.  It's possible that RBC might skip this
	// page if we have previously attempted to deposit this but not been completely successful
	const input = await page.$("input[name=CP_RESPONSE]");
	if (input != null) {
		await page.type('input[name=CP_RESPONSE]', code, { delay: 20 });
		await act.writeStep('Enter Code');
		await act.clickAndNavigate('#id_btn_continue', 'Select To Account')
	}
	if (await page.$("#id_btn_submit") == null) {
		// Something has gone wrong.  Notify upstairs:
		return getErrorResult("Cannot find either code entry or button to continue: Bailing");
	}

	progressCb("Awaiting Confirmation");

	// Click through to deposit the money
	await act.clickAndNavigate('#id_btn_submit', 'confirmation');

	// Click through to deposit the money
	await act.clickAndNavigate('#id_btn_confirm', 'All Done');

  // TODO: Confirm deposited amount!
  const confirmationNumber = await findConfirmationNumber(page);

  return confirmationNumber
    ? {
      message: confirmationNumber,
      code: ETransferErrorCode.Success,
    } : {
      message: "Confirmation not found",
      code: ETransferErrorCode.UnknownError,
    }
}

//////////////////////////////////////////////////////////////////////////

async function findConfirmationNumber(page: Page)
{
  const xpath = `//TD[.//*[contains(text(),"Confirmation Number")]]/following-sibling::TD`;
  const confirmationElement = await page.$x(xpath);
  if (confirmationElement.length > 0)
  {
    return await page.evaluate(el => el.textContent, confirmationElement[0]) as string;
  }
  return null;
}

async function findErrorResult(page: Page) {

  const allH3 = await page.$$("h3.font-weight-100");
  const allContents = await Promise.all(allH3.map(el => page.evaluate(el => el.textContent, el)))
  const reason = allContents.find(s => s.match(/\([0-9]+\)/) != null)
  const str = reason?.trim() ?? "We don't know what went wrong."
  return getErrorResult(str);
}

function getErrorResult(mssg: string): DepositResult {
  const match = mssg.match(/^(.+)\(([0-9]+)\)\s*$/);
  if (match) {
    return {
      message: match[1],
      code: parseInt(match[2])
    }
  }

  return {
    message: ` Unknown Error: ${mssg}`,
    code: ETransferErrorCode.UnknownError
  }
}
