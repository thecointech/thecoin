import { DateTime } from 'luxon';
import { Decimal } from 'decimal.js-light';
import { SimulationParameters } from './params';
import { SimulationState, calcFiat, increment, toFiat, toCoin } from './state';
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
  getInitial = (start: DateTime): SimulationState =>
    this.balanceChange({
        date: start,
        principal: zero,
        coin: zero,
        credit: {
          balanceDue: zero,
          current: zero,
          cashBackEarned: zero,
          outstanding: false,
        },
        shockAbsorber: {
          coinAdjustment: zero,
          //  totalCoinOffset: zero,
        },
        offsetCO2: zero,
      },
      new Decimal(this.params.initialBalance)
    )


  calcInterest = (current: Decimal) => current
    .mul(this.params.credit.interestRate) // full years interest
    .div(52.1429) // 1 weeks interest


  balanceChange = (state: SimulationState, fiatChange: Decimal) => {
    const month = this.getMarketData(state);
    const coinChange = toCoin(fiatChange, month);
    state.coin = state.coin.add(coinChange);
    state.principal = state.principal.add(fiatChange);
    return state;
  }

  // Add the current weeks spending to current
  updateCreditSpending(start: DateTime, {credit, date}: SimulationState) {
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
    const currentFiat = calcFiat(state, this.data);
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

  calcCashSpending(start: DateTime, {date}: SimulationState) {
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

    // Calculate the div from 1 share
    const monthDiv = new Decimal(month.D).div(12);
    const weekDiv = monthDiv.div(state.date.daysInMonth).mul(7);
    // Subtract CO2 offsets
    const maxWeekOffsetPercent = new Decimal(params.maxOffsetPercentage).div(52.17857);
    let adjustedDiv = weekDiv.sub(toFiat(maxWeekOffsetPercent, month));
    if (adjustedDiv.lt(0)) adjustedDiv = zero;
    state.offsetCO2 = state.offsetCO2.add(weekDiv.sub(adjustedDiv));

    // How much income comes in?
    const divAccrued = adjustedDiv.mul(state.coin);
    income = income.add(divAccrued);
    return income;
  }

  // The shock absorber takes the first X% of profit on MaxProtected
  //
  applyShockAborber(start: DateTime, state: SimulationState) {
    const sa = this.params.shockAbsorber;
    if (!sa.maximumProtected) return;

    // The shock absorber works by taking the first X% of profit
    const fiatProtected = DMin(state.principal, new Decimal(sa.maximumProtected));
    const market = this.getMarketData(state);
    const currentFiat = toFiat(state.coin, market);

    // If state is losing money, top it up from reserves
    if (currentFiat.lt(state.principal)) {
      // how much should we transfer to top-up the account?
      const loss = state.principal.sub(currentFiat);
      const lossPercent = loss.div(state.principal);
      const absorbedPercent = DMin(lossPercent, new Decimal(sa.absorbed))

      // How much do we top up fiatProtected so it does not lose anything?
      const fiatAdjust = fiatProtected.mul(absorbedPercent);
      const coinAdjust = toCoin(fiatAdjust, market);
      state.coin = state.coin.add(coinAdjust);
      state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.sub(coinAdjust);
    }
    // Else, reserve  the first profits
    else if (currentFiat.gt(state.principal)) {
      const gain = currentFiat.sub(state.principal);
      const gainPerc = gain.div(state.principal);

      const feePerc = DMin(gainPerc, new Decimal(sa.cushionPercentage));
      const fiatAdjust = fiatProtected.mul(feePerc);
      const coinAdjust = toCoin(fiatAdjust, market);
      //const reserve = coinAdjust.sub(state.shockAbsorber.coinAdjustment);

      state.coin = state.coin.sub(coinAdjust);
      state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.add(coinAdjust);
    }
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
    const initial = this.getInitial(from);
    let state = initial;
    return [
      initial, // always start with initial
      ...range(1, numWeeks + 1)
        .map((weeks) => {
          // Note; this line is responsible for 2/3 of the execution cost
          // of the simulator.  We should, one day, look into eliminating it
          state = increment(state, from.plus({ weeks }));

          const income = this.calcIncome(start, state);
          this.balanceChange(state, income);

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
          this.updateCreditBalances(start, state)

          return state;
        })
    ];
  }
}
