import { DepositResult, ETransferErrorCode } from "@thecointech/bank-interface";
import { ApiAction } from "./action";
import { Page } from "puppeteer";
import { log } from "@thecointech/logging";

export async function depositETransfer(prefix: string, url: string, code: string, progressCb: (v: string) => void): Promise < DepositResult > {
	try {
		return await completeDeposit(prefix, url, code, progressCb);
	}
  catch(e: unknown) {
    log.error(e, "Error depositing eTransfer");
		return getErrorResult(e)
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
      message: "Success",
      code: ETransferErrorCode.Success,
      confirmation: confirmationNumber
    } : {
      message: "Confirmation not found",
      code: ETransferErrorCode.UnknownError,
    }
}

//////////////////////////////////////////////////////////////////////////

export async function findConfirmationNumber(page: Page)
{
  const xpath = `//TD[contains(text(),"Confirmation Number")]/following-sibling::td`;
  const confirmationElement = await page.$$(`::-p-xpath(${xpath})`)
  const elements = confirmationElement.map(async ce => await page.evaluate(el => el.textContent, ce) as string);
  const contents = await Promise.all(elements);
  for (const txt of contents) {
    const confirm = parseInt(txt);
    if (!Number.isNaN(confirm))
      return confirm;
  }
  return null;
}

async function findErrorResult(page: Page) {

  const allH3 = await page.$$("h3.font-weight-100");
  const allContents = await Promise.all(allH3.map(el => page.evaluate(el => el.textContent, el)))
  const reason = allContents.find(s => s?.match(/\([0-9]+\)/) != null)
  const str = reason?.trim() ?? "We don't know what went wrong."
  return getErrorResult(str);
}

function getErrorResult(e: unknown): DepositResult {
  const match = JSON.stringify(e).match(/^(.+)\(([0-9]+)\)\s*$/);
  if (match) {
    return {
      message: match[1],
      code: parseInt(match[2])
    }
  }

  else if (e instanceof Error) {
    return {
      message: e.message,
      code: ETransferErrorCode.UnknownError
    }
  }
  return {
    message: ` Unknown Error: ${e}`,
    code: ETransferErrorCode.UnknownError
  }
}
