import { log } from "@thecointech/logging";
import { ApiAction } from "./action";

export async function getBalance() {
  const act = await ApiAction.New('getBalance', true);

  try {
    // This is very much a quick hacked in check, this value isn't currently
    // used.  For a more reliable version of this, consider refactoring this
    // api to use the scraper-agent etc libraries instead.
    const element = await act.page.$eval("#main .balance-line", el => el.textContent);
    const text = /\$([0-9,.]+)/.exec(element ?? "")?.[1].replace(',', '');
    return parseFloat(text ?? "-1");
  }
  catch (e) {
    log.warn(e, "Error getting balance");
    return -1;
  }
}

