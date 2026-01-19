import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { SimulationParameters } from './params';
import { SimulationState, zeroState, increment, balanceChange } from './state';
import { getMarketData, MarketData } from './market';
import { straddlesMonth, weekContainedAnniversary } from './time';
import { zero } from './sim.decimal';
import { applyShockAborber } from './sim.shockAbsorber';
import { payOutCashback, updateCreditBalances } from './credit';

//
// ReturnSimulator
//
// This class simulates returns using Params at any point in
// contained within it's data.  We call calculate returns
// with starting date and recieve back an array of all
// weeks in the simulation
//
export class ReturnSimulator {

  data: MarketData[]
  // current: SimulationState;
  params: SimulationParameters;

  constructor(data: MarketData[], params: SimulationParameters) {
    this.params = params;
    this.data = data;
  }

  payOutCashback = payOutCashback;
  updateCreditBalances = (start: DateTime, state: SimulationState) =>
    updateCreditBalances(this.params.credit, start, state);

  getMarketData = (state: SimulationState) => getMarketData(state.date, this.data)!;
  getInitial = (start: DateTime): SimulationState =>
    balanceChange(
      zeroState(start, this.data),
      new Decimal(this.params.initialBalance),
    )

  applyShockAborber = (start: DateTime, state: SimulationState) =>
    applyShockAborber(start, this.params, state)

  calcCashSpending(start: DateTime, { date }: SimulationState) {
    let spending = new Decimal(this.params.cash.weekly);
    if (straddlesMonth(date)) spending = spending.add(this.params.cash.monthly);
    if (weekContainedAnniversary(start, date)) spending = spending.add(this.params.cash.yearly);
    return spending;
  }

  // Calculate how much fiat income comes in this week
  calcIncome(start: DateTime, state: SimulationState) {
    // regular income
    const { weekly, monthly, yearly } = this.params.income;
    let income = new Decimal(weekly);
    if (straddlesMonth(state.date)) income = income.add(monthly);
    if (weekContainedAnniversary(start, state.date)) income = income.add(yearly);
    return income;
  }

  // Convert dividends earned to income/offsets.
  // NOTE: This entire function is calculated in USD because
  // offsets are priced in USD.  This means don't use
  // the standard conversion fn's (toCoin/toFiat)
  updateDividends(state: SimulationState) {

    // Calculate the div from 1 share
    const monthDiv = new Decimal(state.market.D).div(12);
    const weekDiv = monthDiv.div(state.date.daysInMonth!).mul(7);

    // How much of each shares div is allocated to CO2 offsets?
    const maxWeekOffsetPercent = new Decimal(this.params.maxOffsetPercentage).div(52.17857);
    let adjustedDiv = weekDiv.sub(maxWeekOffsetPercent.mul(state.market.P));
    if (adjustedDiv.lt(0)) adjustedDiv = zero;

    // Retained dividends are those that are not
    // used to purchase offsets.  We re-invest these
    const retainedDiv = adjustedDiv.mul(state.coin);
    const newCoin = retainedDiv.div(state.market.P);
    state.coin = state.coin.add(newCoin);

    // Store the total cash amount of dividends that
    // that are used to purchase CO2 offsets
    const newOffsets = weekDiv.sub(adjustedDiv).mul(state.coin);
    state.usdForCo2Offsets = state.usdForCo2Offsets.add(newOffsets);
  }

  increment(start: DateTime, lastState: SimulationState) {
    // First, increment the state's date/market
    const state = increment(lastState, this.data);

    const income = this.calcIncome(start, state);
    balanceChange(state, income);

    // add/apply dividends
    this.updateDividends(state);

    // Adjust our coin balance to
    // absorbe any shocks.
    this.applyShockAborber(start, state);

    // Pay out the CB.  Do this before calculating credit just in case
    // we use the cashback to pay off a balanceOwing
    this.payOutCashback(start, state);

    // subtract cash spending.  We assume the credit card will pick up any slack
    const spending = this.calcCashSpending(start, state);
    balanceChange(state, spending.neg());

    // calculate credit changes
    this.updateCreditBalances(start, state);
    // Now sim for state is complete, prevent it from changing
    return Object.freeze(state);
  }

  // Utility function, mostly for testing.  Take a state and run simulator
  // until it reaches "end" date
  calcStateUntil(state: SimulationState, start: DateTime, end: DateTime): SimulationState {
    while (state.date <= end) {
      state = this.increment(start, state);
    }
    return state;
  }
}
