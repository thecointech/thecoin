import { log } from "@thecointech/logging";
import { cleanExistingProfile } from "@thecointech/scraper/puppeteer";

export async function profileRefresh() {
  try{
    await cleanExistingProfile();
    return true;
  }
  catch (e) {
    log.error(e);
    return false;
  }
}
