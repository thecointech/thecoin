import { cleanExistingProfile } from "@thecointech/scraper/puppeteer";

export async function profileRefresh() {

    await cleanExistingProfile();
    return true;
}
