import { log } from '@thecointech/logging';
import { ApiAction } from '../action';
import { openBillPaymentPage } from './index';

const Errors = {
  MissingAccountIdent: "MISSING-ACCOUNT-IDENTIFIER",
  DuplicateAccountIdent: "DUPLICATE-ACCOUNT-IDENTIFIER",
  SetAccountNumberFailed: "SET-ACC-NO-FAILED",
  DuplicateNameError: "DUPLICATE-NAME-ERROR",
  MissingLink: "MISSING-LINK",
}

//
// Add a new payee and set it's nickname.  Once done, return to the main page.
export async function addPayee(act: ApiAction, nickname: string, payee: string, accountNumber: string) {
  await act.clickOnText("Add Payee", "span")
  await act.page.type("#payeename", payee);
  await act.clickAndNavigate('#id_btn_search', 'Confirm');

  // we should have 1 result
  const secondEntry = await act.page.$("input#Company2")
  if (secondEntry) {
    // what is the name of this second entry?
    const company2 = await act.page.evaluate(el => el?.parentElement?.parentElement?.textContent, secondEntry);
    log.error(`Non-unique name passed to addPayee, found ${company2?.trim()} when searcing ${payee}`)
    throw new Error(Errors.DuplicateNameError);
  }
  await act.page.click("input#Company1");
  await act.clickAndNavigate("#id_btn_continue", "Add Payee Type");
  await act.page.type("#accountnumber", accountNumber);
  await act.clickAndNavigate("#id_btn_continue", "Set Payee Acc Number");
  await act.clickAndNavigate("#id_btn_confirm", "Confirm Acc Number");

  // Do we have an error message?
  const errorMessage = await act.page.$("#attention-notice-pl-1");
  if (errorMessage) {
    const text = await act.page. evaluate(el => el.textContent, errorMessage);
    log.error(`Error on setting account number: ${text?.trim()}`);
    throw new Error(Errors.SetAccountNumberFailed);
  }

  // Go to payee page to change it's name
  await act.clickOnText("Manage Payees", "a", "#id_btn_sortpayeelist");

  // click on the edit link for this account
  const res = await clickPayeeLink(act, accountNumber, "Edit");
  if (res) {
    log.error("Couldn't click the ${link} button: ${res}");
    throw new Error(res);
  }
  await act.page.waitForNavigation();
  await act.page.waitForSelector("#payeenickname");

  // Set the name
  await act.page.type("#payeenickname", nickname);
  await act.clickAndNavigate("#id_btn_continue", "Setting nickname");
  await act.clickAndNavigate("#id_btn_confirm", "Confirming nickname");

  // Go back to the payee page
  await act.clickOnText("Pay Bills and Transfer Funds", "a", "#id_btn_submit");
}

// Delete payee based on nickname.  Will throw
export async function deletePayee(nickname: string) {
  log.trace(`Deleting payee: ${nickname}`);
  const act = await openBillPaymentPage("deleting");
  await act.clickOnText("Manage Payees", "a", "#id_btn_sortpayeelist");

  // Click the delete button
  const res = await clickPayeeLink(act, nickname, "Delete");
  if (res) {
    if (res == Errors.MissingAccountIdent) {
      log.info(`Couldn't find payee: ${nickname} - skipping delete`)
      return false;
    }
    log.error(`Couldn't click the delete button: ${res}`);
    throw new Error(res);
  }
  log.trace("Clicked Delete button");
  await act.page.waitForNavigation();
  await act.page.waitForSelector("#id_btn_confirm");
  await act.clickAndNavigate("#id_btn_confirm", "Delete Payee");

  // Confirm result
  const comfirmed = await act.findElementsWithText("td", "Delete Payee Completed");
  if (!comfirmed) throw new Error("Couldn't find confirmation message for deleting payee");
  return true;
}

async function clickPayeeLink(act: ApiAction, accountIdent: string, link: string) {
  // Click the edit button
  const params = {accountIdent, Errors, link};
  return act.page.evaluate(({accountIdent, Errors, link}: typeof params) => {
    // Find the payee in the list
    const cells = document.getElementsByTagName("td");
    const [td, ...rest] = Array.from(cells).filter(c => c.innerText === accountIdent);
    if (!td || !td.parentElement) return Errors.MissingAccountIdent;
    if (rest.length > 0) return Errors.DuplicateAccountIdent;
    const links = Array.from(td.parentElement.getElementsByTagName("a"))
    const edit =  links.find(l => l.text == link);
    if (!edit) return Errors.MissingLink;
    edit.click();
    return null;
  }, params);
}
