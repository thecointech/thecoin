import { FXRate } from "@the-coin/pricing"
import { Transaction } from "../Account/types"

// file deepcode ignore DateMonthIndex%2Ftest: <please specify a reason of ignoring this>

export const ExampleTransactions: Transaction[] = [
  {
    "txHash": "0xc6ae1c594780a475c15f21413a9417e84a1b1bedbe93e3a528a1f9b04b80da07",
    "date": new Date("2019-08-29T14:01:15.000Z"),
    "change": 473200151,
    "logEntry": "Transfer: 0x0E53b70a831003d3714aeBC36f33c98a5F848872",
    "balance": 730012295, // FIX ME
    "counterPartyAddress": "FIXME",
  },
  {
    "txHash": "0x0a61b44f94b3b7d32549747ffaddc58fce162464a40fb4e9606ddee5767b9dd5",
    "date": new Date("2019-05-02T15:19:41.000Z"),
    "change": -20000,
    "logEntry": "Transfer: 0x51e1153eE05efCf473d581c15b3F7B760CA5Ddb3",
    "balance": 256812144,
    "counterPartyAddress": "FIXME",
  },
  {
    "txHash": "0x0a61b44f94b3b7d32549747ffaddc58fce162464a40fb4e9606ddee5767b9dd5",
    "date": new Date("2019-05-02T15:19:41.000Z"),
    "change": -2541359,
    "logEntry": "Transfer: 0x445758E37F47B44E05e74eE4799F3469De62a2Cb",
    "balance": 256832144,
    "counterPartyAddress": "FIXME",
  },
  {
    "txHash": "0x301cf09ec466a77628fb5d80c7918dfbe0df151ee138a565671950d4a6ff4bb6",
    "date": new Date("2019-05-02T15:14:58.000Z"),
    "change": -20000,
    "logEntry": "Transfer: 0x51e1153eE05efCf473d581c15b3F7B760CA5Ddb3",
    "balance": 259373503,
    "counterPartyAddress": "FIXME",
  },
  {
    "txHash": "0x301cf09ec466a77628fb5d80c7918dfbe0df151ee138a565671950d4a6ff4bb6",
    "date": new Date("2019-05-02T15:14:58.000Z"),
    "change": -2541359,
    "logEntry": "Transfer: 0x445758E37F47B44E05e74eE4799F3469De62a2Cb",
    "balance": 259393503,
    "counterPartyAddress": "FIXME",
  },
  {
    "txHash": "0x2cf020d5ff600f484942c02dc6baf16313bb1dd2228dc348239c432dae87ce8b",
    "date": new Date("2019-04-01T19:58:11.000Z"),
    "change": 261934862,
    "logEntry": "Purchase: 261.93",
    "balance": 261934862,
    "counterPartyAddress": "FIXME",
  }
]

export const ExampleRates : FXRate[] = [
  // The first rate has been set to be always valid (so is used for current Value)
  { "buy": 2.96857, "sell": 2.9725, "fxRate": 1.3197, "validTill": 9571059890000, "validFrom": 1570833090000, "target": 124 },
  { "buy": 2.9646999999999997, "sell": 2.96775, "fxRate": 1.3239, "validTill": 1569418290000, "validFrom": 1569364290000, "target": 124 },
  { "buy": 2.98724, "sell": 2.9908899, "fxRate": 1.3078, "validTill": 1562592690000, "validFrom": 1562365890000, "target": 124 },
  { "buy": 2.9488701, "sell": 2.9518600999999998, "fxRate": 1.322, "validTill": 1561383090000, "validFrom": 1561156290000, "target": 124 },
  { "buy": 2.9233601, "sell": 2.9255801000000003, "fxRate": 1.34602, "validTill": 1556814690000, "validFrom": 1556803890000, "target": 124 },
  { "buy": 2.91504, "sell": 2.91774, "fxRate": 1.34443, "validTill": 1556901090000, "validFrom": 1556890290000, "target": 124 },
  { "buy": 2.9153401, "sell": 2.9165, "fxRate": 1.34683, "validTill": 1556836290000, "validFrom": 1556825490000, "target": 124 },
  { "buy": 2.95099, "sell": 2.95128, "fxRate": 1.3199, "validTill": 1561404690000, "validFrom": 1561393890000, "target": 124 },
  { "buy": 2.8645701, "sell": 2.8652699999999998, "fxRate": 1.33242, "validTill": 1554157890000, "validFrom": 1554147090000, "target": 124 },
  { "buy": 2.8871100000000003, "sell": 2.88858, "fxRate": 1.3312, "validTill": 1567096290000, "validFrom": 1567085490000, "target": 124 }
]



export const SimpleTransactions: Transaction[] = [
  {
    date: new Date(2018, 1),
    change: 50000,
    logEntry: "",
    balance: 50000, // Deposit: $5
    "counterPartyAddress": "FIXME",
  },
  {
    date: new Date(2018, 2),
    change: 50000,
    logEntry: "",
    balance: 100000, // Deposit: $10
    "counterPartyAddress": "FIXME",
  },
  {
    date: new Date(2018, 3),  // Withdraw: $5
    change: -25000,
    logEntry: "",
    balance: 75000,
    "counterPartyAddress": "FIXME",
  },
  {
    date: new Date(2018, 4),  // Withdraw: $2.50
    change: -25000,
    logEntry: "",
    balance: 50000,
    "counterPartyAddress": "FIXME",
  }
];

//.

export const SimpleRates: FXRate[] = [
  {
    buy: 100,
    sell: 100,
    fxRate: 1,
    validFrom: new Date(2018,1).getTime(),
    validTill: new Date(2018,2).getTime(),
  },
  {
    buy: 200,
    sell: 200,
    fxRate: 1,
    validFrom: new Date(2018,2).getTime(),
    validTill: new Date(2018,3).getTime(),
  },
  {
    buy: 200,
    sell: 200,
    fxRate: 1,
    validFrom: new Date(2018,3).getTime(),
    validTill: new Date(2018,4).getTime(),
  },
  {
    buy: 100,
    sell: 100,
    fxRate: 1,
    validFrom: new Date(2018,4).getTime(),
    validTill: new Date(2018,5).getTime(),
  },
  {
    buy: 250,
    sell: 250,
    fxRate: 1,
    validFrom: new Date(2018,4).getTime(),
    validTill: new Date().getTime() + 10000000,
  },
]

test('Always passes', () => console.log("just to make jest stop complaining"));