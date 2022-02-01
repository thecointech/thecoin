import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { SimulationParameters } from './params';
import { SimulationState } from './state';
import { getMarketData, MarketData } from './market';
import { range } from 'lodash';
import { first, last } from '@thecointech/utilities/ArrayExtns';
import { straddlesMonth, straddlesYear } from './time';

//
// ReturnSimulator
//
// This class simulates returns using Params at any point in
// contained within it's data.  We call calculate returns
// with starting date and recieve back an array of all
// weeks in the simulation
//

const zero = new Decimal(0);
const DMin = (l: Decimal, r: Decimal) => l.lt(r) ? l : r;

export class ReturnSimulator {

  data: MarketData[]
  // current: SimulationState;
  params: SimulationParameters;

  constructor(data: MarketData[], params: SimulationParameters) {
    this.params = params;
    this.data = data;
  }

  getMarketData = (state: SimulationState) => getMarketData(state.date, this.data)!;
  getInitial = (start: DateTime): SimulationState => {
    const balance = new Decimal(this.params.initialBalance);
    const state = {
      date: start,
      principal: balance,
      coin: zero,
      fiat: balance,
      credit: {
        balanceDue: zero,
        current: zero,
        cashBackEarned: zero,
        outstanding: false,
      },
      offsetCO2: zero,
      // TODO: Shock absorber
      protected: zero
    }
    const firstMonth = this.getMarketData(state);
    state.coin = balance.div(firstMonth.P)
    return state;
  }

  calcInterest = (current: Decimal) => current
    .mul(this.params.credit.interestRate) // full years interest
    .div(52.1429) // 1 weeks interest

  // Add the current weeks spending to current
  updateCreditSpending(start: DateTime, {credit, date}: SimulationState) {
    const params = this.params.credit;
    let spending = new Decimal(params.weekly);
    // If this week straddled a month ending, add month spending
    if (straddlesMonth(date)) spending = spending.add(params.monthly);
    // If this day straddled an end-of-year, add annual spending
    if (straddlesYear(start, date)) spending = spending.add(params.yearly);
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
    const month = this.getMarketData(state);
    const paid = DMin(state.credit.balanceDue, state.coin.mul(month.P));
    const paidCoin = paid.div(month.P);
    state.coin = state.coin.sub(paidCoin);
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
    const currentWeek = start.diff(state.date, "weeks").weeks;
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

  updateCreditCashback(start: DateTime, state: SimulationState) {
    const params = this.params.credit;
    const { credit } = state;
    const cashBackEarned = credit.cashBackEarned.add(params.weekly * params.cashBackPercentage);

    // If this past week contained the anniversary, we transfer cashback to TheCoin
    if (straddlesYear(start, state.date)) {
      const month = this.getMarketData(state);
      const newCoin = cashBackEarned.div(month.P);
      state.coin = state.coin.add(newCoin);
      state.credit.cashBackEarned = zero;
    }
    else {
      // just accumulate cashback
      state.credit.cashBackEarned = cashBackEarned;
    }
  }

  calcSpending(start: DateTime, {date}: SimulationState) {
    let spending = new Decimal(this.params.cash.weekly);
    if (straddlesMonth(date)) spending = spending.add(this.params.cash.monthly);
    if (straddlesYear(start, date)) spending = spending.add(this.params.cash.yearly);
    return spending;
  }

  // Calculate how much fiat income comes in this week
  calcIncome(start: DateTime, state: SimulationState) {
    const { params } = this;
    const month = this.getMarketData(state);

    // regular income
    let income = new Decimal(params.income.weekly);
    if (straddlesMonth(state.date)) income = income.add(this.params.income.monthly);
    if (straddlesYear(start, state.date)) income = income.add(this.params.income.yearly);

    // Calculate dividend effect
    const monthDiv = new Decimal(month.D).div(12);
    const weekDiv = monthDiv.div(state.date.daysInMonth).mul(7);
    // Subtract CO2 offsets
    const maxWeekOffsetPercent = new Decimal(params.maxOffsetPercentage).div(365.25);
    let adjustedDiv = weekDiv.sub(maxWeekOffsetPercent);
    if (adjustedDiv.lt(0)) adjustedDiv = zero;

    // How much income comes in?
    const divAccrued = adjustedDiv.mul(state.coin);
    income = income.add(divAccrued);
    return income;
  }

  calcPeriod = (start: DateTime) => {
    const f = first(this.data).Date;
    const l = last(this.data).Date;
    return {
      from: DateTime.max(f, start),
      to: DateTime.min(l, start.plus(this.params.maxDuration)),
    };
  }

  // Calculate returns for across all supplied data.
  calcReturns(start: DateTime) {
    let { from, to } = this.calcPeriod(start)
    const numWeeks = to.diff(from, "weeks").weeks;
    // Keep track of how much capital has been input.
    let state = this.getInitial(from);
    return [
      state, // always start with initial
      ...range(1, numWeeks + 1)
        .map((week) => {
          state = {
            ...state,
            date: from.plus({ week })
          };

          const month = this.getMarketData(state);

          const income = this.calcIncome(start, state);
          const inCoin = income.div(month.P);
          state.coin = state.coin.add(inCoin);

          // Accumulate our cashback.  Do this before calculating credit just in case
          // we need to use the cashbadk to pay off a balanceOwing
          this.updateCreditCashback(start, state);

          // subtract cash spending.  We assume the credit card will pick up any slack
          const spending = this.calcSpending(start, state);
          const outCoin = spending.div(month.P);
          state.coin = state.coin.sub(outCoin)

          // calculate credit changes
          this.updateCreditBalances(start, state)

          return state;
        })
    ];
  }
}
