import { DateTime } from 'luxon';
import { getIdx } from './fetch';
import { DataFormat } from './types';
import { Decimal } from 'decimal.js-light';
import { SimulationParameters } from './params';
import { SimulationState } from './state';


const zero = new Decimal(0);
const DMin = (l: Decimal, r: Decimal) => l.lt(r) ? l : r;
const straddlesMonth = (date: DateTime) => date.weekday >= date.day;
const straddlesYear = (start: DateTime, date: DateTime) => {
  const diff = start.diff(date, ["years", "days"]);
  return diff.years > 0 && diff.days < 7;
}

export class ReturnSimulator {

  data: DataFormat[]
  // current: SimulationState;
  params: SimulationParameters;

  constructor(data: DataFormat[], params: SimulationParameters) {
    this.params = params;
    this.data = data;
  }

  getMonth = (date: DateTime) => this.data[getIdx(date, this.data)];
  getInitial = (start: DateTime) => {
    const balance = new Decimal(this.params.initialBalance);
    const firstMonth = this.getMonth(start);
    return {
      date: firstMonth.Date,
      principal: balance,
      coin: balance.div(firstMonth.P),
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
  }

  calcInterest = (current: Decimal) => current
    .mul(this.params.credit.interestRate) // full years interest
    .div(52.1429) // 1 weeks interest


  // Add the current weeks spending to current
  updateCreditSpending(start: DateTime, {credit}: SimulationState, date: DateTime) {
    const params = this.params.credit;
    let spending = new Decimal(params.weekly);
    // If this week straddled a month ending, add month spending
    if (straddlesMonth(date)) spending = spending.add(params.monthly);
    // If this day straddled an end-of-year, add annual spending
    if (straddlesYear(start, date)) spending = spending.add(params.yearly);
    credit.current = credit.current.add(spending);
  }

  // On any week with an outstanding balance, try to pay it immediately
  updateCreditOutstanding(state: SimulationState, month: DataFormat) {
    const { credit } = state;
    if (!credit.outstanding) return;

    // If we have an outstanding balance, we also are being charged interest
    const currentOwed = credit.balanceDue.add(credit.current);
    const totalOwed = currentOwed.add(this.calcInterest(currentOwed));
    state.credit.balanceDue = totalOwed;
    state.credit.current = zero;

    // Try to pay it off immediately to minimize interest cost
    this.payBalanceDue(state, month);
  }

  payBalanceDue(state: SimulationState, month: DataFormat) {
    const paid = DMin(state.credit.balanceDue, state.coin.mul(month.P));
    const paidCoin = paid.div(month.P);
    state.coin = state.coin.sub(paidCoin);
    state.credit.balanceDue = state.credit.balanceDue.sub(paid);
  }

  // Perform due-date calculations and update outstanding
  updateCreditOnDueDate(state: SimulationState, month: DataFormat) {
    const { credit } = state;
    const pcredit = this.params.credit;
    this.payBalanceDue(state, month);

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

  updateCreditBalances = (start: DateTime, state: SimulationState, date: DateTime) => {
    const month = this.getMonth(date);
    const params = this.params.credit;
    const currentWeek = start.diff(date, "weeks").weeks;
    const creditWeek = currentWeek % params.billingCycle;

    // Always update spending
    this.updateCreditSpending(start, state, date);

    this.updateCreditOutstanding(state, month);

    // At the end of the grace period, we (try to) pay off the balance owning.
    if (creditWeek == params.graceWeeks) {
      this.updateCreditOnDueDate(state, month);
    }
    // The end of the cycle, all of our current spending is moved to balanceDue
    else if (creditWeek == 0) {
      this.updateCreditEndCycle(state);
    }
  }

  updateCreditCashback(start: DateTime, state: SimulationState, date: DateTime) {
    const params = this.params.credit;
    const { credit } = state;
    const cashBackEarned = credit.cashBackEarned.add(params.weekly * params.cashBackPercentage);

    // If this past week contained the anniversary, we transfer cashback to TheCoin
    if (straddlesYear(start, date)) {
      const month = this.getMonth(date);
      const newCoin = cashBackEarned.div(month.P);
      state.coin = state.coin.add(newCoin);
      state.credit.cashBackEarned = zero;
    }
    else {
      // just accumulate cashback
      state.credit.cashBackEarned = cashBackEarned;
    }
  }

  calcSpending(start: DateTime, date: DateTime) {
    let spending = new Decimal(this.params.cash.weekly);
    if (straddlesMonth(date)) spending = spending.add(this.params.cash.monthly);
    if (straddlesYear(start, date)) spending = spending.add(this.params.cash.yearly);
    return spending;
  }

  // Calculate how much fiat income comes in this week
  calcIncome(start: DateTime, date: DateTime, coin: Decimal) {
    const { params } = this;
    const month = this.getMonth(date);

    // regular income
    let income = new Decimal(params.income.weekly);
    if (straddlesMonth(date)) income = income.add(this.params.income.monthly);
    if (straddlesYear(start, date)) income = income.add(this.params.income.yearly);

    // Calculate dividend effect
    const monthDiv = new Decimal(month.D).div(12);
    const weekDiv = monthDiv.div(date.daysInMonth).mul(7);
    // Subtract CO2 offsets
    const maxWeekOffsetPercent = new Decimal(params.maxOffsetPercentage).div(365.25);
    let adjustedDiv = weekDiv.sub(maxWeekOffsetPercent);
    if (adjustedDiv.lt(0)) adjustedDiv = zero;

    // How much income comes in?
    const divAccrued = adjustedDiv.mul(coin);
    income = income.add(divAccrued);
    return income;
  }

  calcPeriod = (start: DateTime) => {
    const first = this.data[0];
    const last = this.data[this.data.length - 1];
    return {
      from: DateTime.max(first.Date, start),
      to: DateTime.min(last.Date, start.plus(this.params.maxDuration)),
    };
  }

  // Calculate returns for across all supplied data.
  calcReturns(start: DateTime) {
    const { from, to } = this.calcPeriod(start)
    // Keep track of how much capital has been input.
    const state = this.getInitial(start);
    const history: SimulationState[] = [state]
    const incr = { weeks: 1 };
    for (let date = from.plus(incr); date <= to; date = date.plus(incr)) {
      const month = this.getMonth(date);

      const income = this.calcIncome(start, date, state.coin);
      const inCoin = income.div(month.P);
      state.coin = state.coin.add(inCoin);

      // Accumulate our cashback.  Do this before calculating credit just in case
      // we need to use the cashbadk to pay off a balanceOwing
      this.updateCreditCashback(start, state, date);

      // subtract cash spending.  We assume the credit card will pick up any slack
      const spending = this.calcSpending(start, date);
      const outCoin = spending.div(month.P);
      state.coin = state.coin.sub(outCoin)

      // Calculate spending
      this.updateCreditBalances(start, state, date)
      // calculate credit changes

      history.push(state);
    }
    return history;
  }

  oldVersion(start: DateTime, to: DateTime) {
    const startIdx = getIdx(start, this.data);
    const endIdx = getIdx(to, this.data);
    const state = this.getInitial(start);

    const history = [state];
    let coin = state.coin;
    for (let i = startIdx + 1; i <= endIdx; i++) {
      const month = this.data[i];
      // Get annualized dividend % for month
      const monthDiv = new Decimal(month.D).div(12);
      // How many shares is this?
      const newCoin = coin.mul(monthDiv).div(month.P);
      // buy new shares with dividend
      coin = coin.add(newCoin);
      history.push({
        ...state,
        coin,
      })
    }
    return history;
  }
}
