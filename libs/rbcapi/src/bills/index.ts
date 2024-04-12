import type { ProgressCallback } from '@thecointech/bank-interface';
import { Page } from 'puppeteer';
import { ApiAction } from '../action';
import Decimal from 'decimal.js-light';
import { addPayee } from './managePayees';
import { log } from '@thecointech/logging';

//
// Pay bill
// If nickname exists, use this a payee, else create a new payee and set it's nickname as passed.
export async function payBill(prefix: string, nickname: string, payee: string, accountNo: string, amount: Decimal, _progressCb?: ProgressCallback) {

  const act = await prepareBillPayee(prefix, nickname, payee, accountNo);

  await act.page.type('#amount', amount.toString());
  await act.clickAndNavigate('#id_btn_submit', 'Bill Submit');
  await act.clickAndNavigate('#id_btn_confirm', 'Bill Confirm');
  log.trace(`Bill payment confirmed`);

  // get confirmation number;
  const [confirmHeader] = await act.findElementsWithText("th", "Confirmation Number");
  const confirmation = await act.page.evaluate(th => th?.nextElementSibling?.textContent, confirmHeader);
  if (!confirmation) {
    const innerText = await act.page.evaluate(th => th?.parentElement?.textContent, confirmHeader);
    log.error("Bill payment confirmation not found with content: " + innerText);
    throw new Error("BILL-PAYMENT-NOT-FOUND");
  }
  log.debug(`Bill payment confirmation: ${confirmation}`);
  return confirmation;
}

export async function prepareBillPayee(prefix: string, nickname: string,  payee: string, accountNo: string) {
  log.trace('Preparing to pay bill');
  const act = await openBillPaymentPage(prefix);
  const { page } = act;

  // If we do not have the named account, then add it.
  let options = await getPayeeOptions(page);
  let existing = options.find(o => o.text === nickname);
  if (!existing) {
    log.trace('Payee not found');
    await addPayee(act, nickname, payee, accountNo);
    options = await getPayeeOptions(page);
    existing = options.find(o => o.text === nickname);
  }
  if (!existing) {
    log.error("Payee still not found after calling addPayee");
    throw new Error(`MISSING-PAYEE`);
  }
  await page.select("#toacct", existing.value);
  log.trace("Selected payee from list");
  return act;
}

// Create new action and navigate to bill payments page.
export async function openBillPaymentPage(prefix: string) {
  // Navigate to old account page
  const act = await ApiAction.New(prefix, true);
  await act.clickOnText("Current Account", "a");
  await act.clickOnText("Pay Bills & Transfer Funds", "a");
  return act;
}

// Return payee options as [value, text]
type PayeeData = {text: string, value: string}
const re = /(.+)\s-\s\d{2,}$/
export async function getPayeeOptions(page: Page) : Promise<PayeeData[]> {
  const options = await page.$$("#toacct>option");
  const fetch = options.map(o => page.evaluate(el => ({value: el.value, text: el.text}), o));
  const asText = await Promise.all(fetch);
  return asText
    .map(t => ({
      ...t,
      text: re.exec(t.text)?.[1]
    }))
    .filter(t => !!t.text) as PayeeData[];
}



