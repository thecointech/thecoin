import { setupScraper } from "@thecointech/scraper";
import { rootFolder } from "./paths";
import { getScraperVisible } from "./Harvester/scraperVisible";
import { log } from "@thecointech/logging";
import { bridgeNode } from "@thecointech/electron-signer";
import { ipcMain } from 'electron';
import { getWallet } from "./Harvester/config";
import { NormalizeAddress } from "@thecointech/utilities";
// Initialize main process configurations

export function initMain() {
  setupScraper({
    rootFolder,
    isVisible: getScraperVisible,
  });
  log.info({ rootFolder }, "Main process initialized at root: {rootFolder}");

  bridgeNode(ipcMain, async (signerId) => {
    const wallet = await getWallet();
    if (wallet && NormalizeAddress(wallet.address) === NormalizeAddress(signerId)) {
      return wallet;
    }
    return undefined;
  }, true);
}
