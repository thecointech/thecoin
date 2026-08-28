import { setupScraper } from "@thecointech/scraper";
import { rootFolder } from "./paths";
import { getScraperMode } from "./Harvester/scraperVisible";
import { log } from "@thecointech/logging";
import { bridgeElectronSigner } from "@thecointech/electron-signer/bridge";
import { ipcMain } from 'electron';
import { useSigner } from "./Harvester/signer";
import { NormalizeAddress } from "@thecointech/utilities";
// Initialize main process configurations

export function initMain() {
  setupScraper({
    rootFolder,
    isVisible: getScraperMode,
  });
  log.info({ rootFolder }, "Main process initialized at root: {rootFolder}");

  bridgeElectronSigner(ipcMain, async (signerId) => {
    const wallet = await useSigner(async (signer) => {
      const address = await signer.getAddress();
      if (NormalizeAddress(address) === NormalizeAddress(signerId)) {
        return signer;
      }
      return undefined;
    });
    return wallet ?? undefined;
  }, false);
}
