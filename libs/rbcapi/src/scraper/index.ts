import { newPage, closeBrowser as closeBrowser_ } from "@thecointech/scraper";


async function getNewPage() {
  const { page } = await newPage();
  return page;
}

export async function closeBrowser() {
  await closeBrowser_();
}

export async function getPage() {
  const page = await getNewPage();
  return page;
}
