import { sections } from "@thecointech/scraper-agent/processors/types";
import { ConfigShape, defaultDays, defaultSteps, defaultTime } from "../src";
import { SectionName } from "@thecointech/scraper-agent/types";
import { Wallet } from "ethers";

// Used in development to get a usable app without annoying setup
export function getSeedConfig() {
  const randomWallet = Wallet.createRandom();
  const r: ConfigShape = {
    steps: defaultSteps,
    coinAccount: {
      address: randomWallet.address,
      name: "Default Dev Wallet",
      mnemonic: {
        phrase: randomWallet.mnemonic!.phrase,
        path: randomWallet.path!,
        locale: randomWallet.mnemonic!.wordlist!.locale,
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
            ...mockEvents(),
            ...sections.map(s => ({
              section: s,
              events: mockEvents()
            }))
          ]
        }
      }
    }
  }
  return r;
}

const mockEvents = () => {
  return [
    {
      type: "navigation",
      to: "https://www.test.com",
    },
    {
      type: 'click',
      id: `event-${0}`
    }
  ] as any
}
// if (process.env.CONFIG_NAME == "development") {
//   // It can get rather annoying to have to initialize the config every time
//   if (process.argv.includes("--start-initialized")) {
//     try {
//       const wallet = HDNodeWallet.createRandom();
//       await setProcessConfig({
//         coinAccount: toCoinAccount(wallet, "Dev Default"),
//         steps: defaultSteps,
//         creditDetails: {
//           payee: "Test",
//           accountNumber: "1234567890",
//         },
//         scraping: {
//           both: {
//             name: "Default Dev Bank",
//             accounts: [
//               {account_name: "Visa", account_number: "1234567890", account_type: "Credit", balance: "100"},
//               {account_name: "Chq", account_number: "1234567890", account_type: "Chequing", balance: "100"},
//             ],
//             username: "test",
//             password: "test",
//             url: "https://test.com",
//             events: {
//               section: "Initial",
//               events: [
//                 {type: "button", text: "Login"} as any,
//               ]
//             },
//           }
//         }
//       })
//       console.log("Seeded development config");
//     } catch (e) {
//       console.error(e);
//     }
//   }
// }
