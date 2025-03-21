import { defaultDays, defaultSteps, defaultTime } from "@/types";
import { SectionName } from "@thecointech/scraper-agent/types";
import { Wallet } from "ethers";

// Used in development to get a usable app without annoying setup
export function getSeedConfig() {
  const randomWallet = Wallet.createRandom();
  return {
    steps: defaultSteps,
    wallet: {
      phrase: randomWallet.mnemonic!.phrase,
      path: randomWallet.path!,
      locale: randomWallet.mnemonic!.wordlist!.locale,
    },
    schedule: {
      daysToRun: defaultDays,
      timeToRun: defaultTime,
    },
    creditDetails: {
      payee: "payee",
      accountNumber: "12345"
    },
    scraping: {
      both: {
        section: 'Initial' as SectionName,
        events: Array.from({ length: 10 }, (_, index) => ({
          type: 'click',
          id: `event-${index}`
        })) as any[]
      }
    }
  }
}
