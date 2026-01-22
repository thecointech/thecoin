import wallet0 from './wallet0.json' with { type: "json" }
import wallet1 from './wallet1.json' with { type: "json" }
import wallet2 from './wallet2.json' with { type: "json" }

// Wallets returned by GDrive (either mocked googleapis or broker-service directly)
// password is "password"
export const wallets = [
  {
    id: "0",
    originalFilename: `wallet0.wallet`,
    name: "wallet0",
    type: "Type?",
    wallet: JSON.stringify(wallet0),
  },
  {
    id: "1",
    originalFilename: `wallet1.wallet`,
    name: "wallet1",
    type: "Type?",
    wallet: JSON.stringify(wallet1),
  },
  {
    id: "2",
    originalFilename: `wallet2.wallet`,
    name: "wallet2",
    type: "Type?",
    wallet: JSON.stringify(wallet2),
  },
];
