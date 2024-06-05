import { findConfirmationNumber } from "./deposit";
import { closeBrowser, getPage } from "./scraper";

it ('finds the confirmation number', async () => {
  const page = await getPage();
  page.setContent("<html><body><table><tr><td>Confirmation Number</td><td>12345</td></tr></table></body></html>");
  const confirmationNumber = await findConfirmationNumber(page);
  expect(confirmationNumber).toBe(12345);
  await closeBrowser();
})
