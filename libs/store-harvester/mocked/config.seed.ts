import { sections } from "@thecointech/scraper-agent/processors/types";
import { ConfigShape, defaultDays, defaultSteps, defaultTime } from "../src";
import { Wallet } from "ethers";
import type { SectionName } from "@thecointech/scraper-agent/types";
import type { AnyEvent } from "@thecointech/scraper-types";

// Used in development to get a usable app without annoying setup
export function getSeedConfig() {
  // Use a fixed wallet to enable automatically supplying one in harvester/dev
  const seedWallet = Wallet.fromPhrase("test test test test test test test test test test test junk")
  const r: ConfigShape = {
    steps: defaultSteps,
    coinAccount: {
      address: seedWallet.address,
      name: "Default Dev Wallet",
      mnemonic: {
        // NOTE: this is a special path that indicates the wallet was seeded
        // and should be used in development mode
        path: "default-seeded",
        locale: seedWallet.mnemonic!.wordlist!.locale,
      }
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
        name: "Mock Bank",
        url: "https://www.test.com",
        username: "username",
        password: "password",
        accounts: [
          {account_name: "Visa", account_number: "1234567890", account_type: "Credit", balance: "100"},
          {account_name: "Chq", account_number: "1234567890", account_type: "Chequing", balance: "100"},
        ],
        events: {
          section: 'Initial' as SectionName,
          events: [
            ...mockEvents("Initial"),
            ...sections.map(s => ({
              section: s,
              events: mockEvents(s)
            }))
          ]
        }
      }
    }
  }
  return r;
}

let counter = 0;
const mockEvents = (name: string) => {
  return [
    {
      type: "navigation",
      to: `https://www.${name}.com`,
      id: `${name}-${counter++}`
    },
    {
      type: 'click',
      id: `${name}-${counter++}`
    },
    // Add multiple navigation events, this is more
    // like what you'd get from a real scraper, and we
    // need to make sure we handle it correctly
    {
      type: "navigation",
      to: `https://www.${name}.com`,
      id: `${name}-${counter++}`
    },
    {
      type: "navigation",
      to: `https://www.${name}.com`,
      id: `${name}-${counter++}`
    },
  ] as AnyEvent[]
}
