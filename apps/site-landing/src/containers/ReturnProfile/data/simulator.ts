import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { SimulationParameters } from './params';
import { SimulationState, zeroState, toCoin, increment } from './state';
import { getMarketData, MarketData } from './market';
import { straddlesMonth, straddlesYear } from './time';
import { grossFiat } from '.';
import { DMin, zero } from './sim.decimal';
import { applyShockAborber } from './sim.shockAbsorber';

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

  getMarketData = (state: SimulationState) => getMarketData(state.date, this.data)!;
  getInitial = (start: DateTime): SimulationState =>
    this.balanceChange(
      zeroState(start, this.data),
      new Decimal(this.params.initialBalance),
    )

  applyShockAborber = (start: DateTime, state: SimulationState) =>
    applyShockAborber(start, this.params, state)

  calcInterest = (current: Decimal) => current
    .mul(this.params.credit.interestRate) // full years interest
    .div(52.1429) // 1 weeks interest


  balanceChange = (state: SimulationState, fiatChange: Decimal) => {
    const coinChange = toCoin(fiatChange, state.market);
    state.coin = state.coin.add(coinChange);
    state.principal = state.principal.add(fiatChange);
    return state;
  }

  // Add the current weeks spending to current
  updateCreditSpending(start: DateTime, { credit, date }: SimulationState) {
    const params = this.params.credit;
    let spending = new Decimal(params.weekly);
    // If this week straddled a month ending, add month spending
    if (straddlesMonth(date)) spending = spending.add(params.monthly);
    // If this day straddled an end-of-year, add annual spending
    if (straddlesYear(start, date)) spending = spending.add(params.yearly);
    credit.cashBackEarned = credit.cashBackEarned.plus(spending.mul(params.cashBackRate));
    credit.current = credit.current.add(spending);
  }

  // On any week with an outstanding balance, try to pay it immediately
  updateCreditOutstanding(state: SimulationState) {
    const { credit } = state;
    if (!credit.outstanding) return;

    // If we have an outstanding balance, we also are being charged interest
    const currentOwed = credit.balanceDue.add(credit.current);
    const totalOwed = currentOwed.add(this.calcInterest(currentOwed));
    state.credit.balanceDue = totalOwed;
    state.credit.current = zero;

    // Try to pay it off immediately to minimize interest cost
    this.payBalanceDue(state);
  }

  payBalanceDue(state: SimulationState) {
    const currentFiat = grossFiat(state);
    const paid = DMin(state.credit.balanceDue, currentFiat);
    this.balanceChange(state, paid.neg());
    state.credit.balanceDue = state.credit.balanceDue.sub(paid);
  }

  // Perform due-date calculations and update outstanding
  updateCreditOnDueDate(state: SimulationState) {
    const { credit } = state;
    const pcredit = this.params.credit;
    this.payBalanceDue(state);

    let current = credit.current;
    const outstanding = credit.balanceDue.gt(0);
    // If we are outstanding, then all credit is immediately due
    if (outstanding) {
      // If we previously were not outstanding, then the interest
      // is backdated.  Yay, credit cards :-)
      if (!credit.outstanding) {
        const backDatedInterest = this.calcInterest(current)
          .mul(pcredit.graceWeeks)
          .div(2); // Avg balance was only 1/2 current balance.
        current = current.add(backDatedInterest);
      }
      else {
        const currentOwed = credit.balanceDue.add(credit.current).add(pcredit.weekly);
        current = currentOwed.add(this.calcInterest(currentOwed));
      }
      // If we are holding a balance, we the entire balance is immediately due
      state.credit.balanceDue = current;
      state.credit.current = zero;
    }
    state.credit.outstanding = outstanding;
  }

  updateCreditEndCycle({ credit }: SimulationState) {
    credit.balanceDue = credit.balanceDue.add(credit.current);
    credit.current = zero;
  }

  updateCreditBalances = (start: DateTime, state: SimulationState) => {
    const params = this.params.credit;
    const currentWeek = state.date.diff(start, "weeks").weeks;
    const creditWeek = currentWeek % params.billingCycle;

    // Always update spending
    this.updateCreditSpending(start, state);

    this.updateCreditOutstanding(state);

    // At the end of the grace period, we (try to) pay off the balance owning.
    if (creditWeek == params.graceWeeks) {
      this.updateCreditOnDueDate(state);
    }
    // The end of the cycle, all of our current spending is moved to balanceDue
    else if (creditWeek == 0) {
      this.updateCreditEndCycle(state);
    }
  }

  payOutCashback(start: DateTime, state: SimulationState) {
    // If this past week contained the anniversary, we transfer cashback to TheCoin
    if (straddlesYear(start, state.date)) {
      this.balanceChange(state, state.credit.cashBackEarned);
      state.credit.cashBackEarned = zero;
    }
  }

  calcCashSpending(start: DateTime, { date }: SimulationState) {
    let spending = new Decimal(this.params.cash.weekly);
    if (straddlesMonth(date)) spending = spending.add(this.params.cash.monthly);
    if (straddlesYear(start, date)) spending = spending.add(this.params.cash.yearly);
    return spending;
  }

  // Calculate how much fiat income comes in this week
  calcIncome(start: DateTime, state: SimulationState) {
    // regular income
    const { weekly, monthly, yearly } = this.params.income;
    let income = new Decimal(weekly);
    if (straddlesMonth(state.date)) income = income.add(monthly);
    if (straddlesYear(start, state.date)) income = income.add(yearly);
    return income;
  }

  // Convert dividends earned to income/offsets.
  // NOTE: This entire function is calculated in USD because
  // offsets are priced in USD.  This means don't use
  // the standard conversion fn's (toCoin/toFiat)
  updateDividends(state: SimulationState) {

    // Calculate the div from 1 share
    const monthDiv = new Decimal(state.market.D).div(12);
    const weekDiv = monthDiv.div(state.date.daysInMonth).mul(7);

    // How much of each shares div is allocated to CO2 offsets?
    const maxWeekOffsetPercent = new Decimal(this.params.maxOffsetPercentage).div(52.17857);
    let adjustedDiv = weekDiv.sub(maxWeekOffsetPercent.mul(state.market.P));
    if (adjustedDiv.lt(0)) adjustedDiv = zero;

    // Mult by shares to get totals
    const retainedDiv = adjustedDiv.mul(state.coin);
    const newCoin = retainedDiv.div(state.market.P);
    const newOffsets = weekDiv.sub(retainedDiv).mul(state.coin);
    state.coin = state.coin.add(newCoin);
    state.offsetCO2 = state.offsetCO2.add(newOffsets);
  }

  increment(start: DateTime, lastState: SimulationState) {
    // First, increment the state's date/market
    const state = increment(lastState, this.data);

    const income = this.calcIncome(start, state);
    this.balanceChange(state, income);

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
    this.balanceChange(state, spending.neg());

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
