import { DateTime, DurationObject } from 'luxon';

// Holds week/month/yearly actions for income/credit/cash
type FinancialParams = {
  weekly: number;
  monthly: number;
  yearly: number;
}

type ShockAbsorber = {
  // The percentage drop absorbed
  absorbed: number;
  // What percentage yearly gains go towards
  // building the cushion?
  cushionPercentage: number;
  // After what period do profits
  // gain protection?
  trailingMonths: number;

  // Maximum value we can afford to protect.
  maximumProtected: number;

  // growth optimization, reduce
  // shock-absorber maximum by
  // allocating some percentage of profit to
  // dampening.  For example, a $100 principal
  // with $10 of profit/20% shock absorber could
  // automatically reduce the shockAbsorber to 10%
  // (with an accompanied reduction of fees)
  profitPercentageToReduceDampening: number;
}

// The data we use to calculate a clients potential returns
export type SimulationParameters = {
  // How many months should we be calculating this for?
  maxDuration: DurationObject;
  // start: DateTime;
  // end: DateTime;

  // We'll get to this soon, he says hopefully...
  adjustForInflation: boolean;
  // Maximum withheld per-annum for CO2 offsets
  maxOffsetPercentage: number;

  // What is the initial balance of the account?
  initialBalance: number;

  // Cash income
  // How much money flows in each week
  // any monthly income (eg rent, child benefits)
  // Any yearly income (eg bonus's, etc)
  income: FinancialParams;

  // Cash spending
  // The amount spent in an *average* week in cash.  This is
  // subtracted immediately (ie, directly from income)
  // How much do we spend each month on cash expenses.
  // This is primarily large non-elastic bills like rent,
  // electricity etc that cannot be put on the credit card.
  // This amount will be subtaracted at the *end* of the month
  cash: FinancialParams;

  // The amount spent in an *average* week on a credit card.
  // Annual - Simulate 1-off annual expenses like vacations etc.
  // This amount is added to the credit card at the start of
  // the last 12-month period
  credit: FinancialParams & {

    // how long is the billing cycle?
    billingCycle: number;
    // for credit card spending, the interest-free grace period
    // This should nearly always be 3 weeks.
    graceWeeks: number;
    // For a cash-back credit card, how much cash-back can we earn.
    // This amount is accumulated throughout the year and paid
    // on the first week of the following year.
    cashBackPercentage: number;

    // There may be weeks/months where we cannot cover
    // the entire credit outstanding.  In those cases,
    // we simulate the interest charged.
    interestRate: number;
  }


  // Shock Absorber absorbs a percentage
  // of any downturn
  shockAbsorber: ShockAbsorber,
};

const basicPeriods = {
  weekly: 0,
  monthly: 0,
  yearly: 0,
};


type AllowedPrimitives = boolean | string | number | DateTime /* add any types than should be considered as a value, say, DateTimeOffset */;
type Value<T> = T extends AllowedPrimitives ? T : RecursivePartial<T>;
type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends Array<infer U> ? Array<Value<U>> : Value<T[P]>;
};

export const createParams = (explicit?: RecursivePartial<SimulationParameters>): SimulationParameters => ({
  // start: FDRNewDeal,
  // end: DateTime.now(),
  maxDuration: {
    years: 60
  },
  adjustForInflation: false,
  maxOffsetPercentage: 0,
  initialBalance: 0,
  ...explicit,

  income: {
    ...basicPeriods,
    ...explicit?.income
  },
  cash: {
    ...basicPeriods,
    ...explicit?.cash
  },
  credit: {
    ...basicPeriods,
    billingCycle: 0,
    graceWeeks: 0,
    cashBackPercentage: 0,
    interestRate: 0,
    ...explicit?.credit,
  },

  shockAbsorber: {
    absorbed: 0,
    cushionPercentage: 0,
    trailingMonths: 0,
    maximumProtected: 0,
    profitPercentageToReduceDampening: 0,
    ...explicit?.shockAbsorber
  }
});