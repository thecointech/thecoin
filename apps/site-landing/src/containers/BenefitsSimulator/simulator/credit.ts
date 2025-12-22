import { DateTime } from 'luxon';
import Decimal from 'decimal.js-light';
import { balanceChange, grossFiat, SimulationState } from './state';
import { straddlesMonth, weekContainsAnniversary } from './time';
import type { SimulationParameters } from './params';
import { DMin, zero } from './sim.decimal';

type CreditParams = SimulationParameters['credit'];

//
// Calculate credit changes, spending & balance due.
export function updateCreditBalances(params: CreditParams, start: DateTime, state: SimulationState) {
  const currentWeek = state.date.diff(start, "weeks").weeks;
  const creditWeek = currentWeek % params.billingCycle;

  // Always update spending
  updateCreditSpending(params, start, state);

  updateCreditOutstanding(params, state);

  // At the end of the grace period, we (try to) pay off the balance owning.
  if (creditWeek == params.graceWeeks) {
    updateCreditOnDueDate(params, state);
  }
  // The end of the cycle, all of our current spending is moved to balanceDue
  else if (creditWeek == 0 && state.date.toMillis() != start.toMillis()) {
    updateCreditEndCycle(state);
  }
}

//
// Pay out yearly cash-back
export function payOutCashback(start: DateTime, state: SimulationState) {
  // If this past week contained the anniversary, we transfer cashback to TheCoin
  if (weekContainsAnniversary(start, state.date)) {
    balanceChange(state, state.credit.cashBackEarned);
    state.credit.cashBackEarned = zero;
  }
}

//
// Interest charged on `current` for 1 week
const calcInterest = (params: CreditParams, current: Decimal) =>
  current
    .mul(params.interestRate) // full years interest
    .div(52.1429) // 1 weeks interest

//
// Pay the amount due on the credit card from coin balance
function payBalanceDue(state: SimulationState) {
  const currentFiat = grossFiat(state);
  const paid = DMin(state.credit.balanceDue, currentFiat);
  balanceChange(state, paid.neg());
  state.credit.balanceDue = state.credit.balanceDue.sub(paid);
}

//
// Add the current weeks spending to current
function updateCreditSpending(params: CreditParams, start: DateTime, { credit, date }: SimulationState) {
  let spending = new Decimal(params.weekly);
  // If this week straddled a month ending, add month spending
  if (straddlesMonth(date)) spending = spending.add(params.monthly);
  // If this day straddled an end-of-year, add annual spending
  if (weekContainsAnniversary(start, date)) spending = spending.add(params.yearly);
  credit.cashBackEarned = credit.cashBackEarned.plus(spending.mul(params.cashBackRate));
  credit.current = credit.current.add(spending);
}

//
// On any week with an outstanding balance, try to pay it immediately
function updateCreditOutstanding(params: CreditParams, state: SimulationState) {
  const { credit } = state;
  if (!credit.outstanding) return;

  // If we have an outstanding balance, we also are being charged interest
  const currentOwed = credit.balanceDue.add(credit.current);
  const totalOwed = currentOwed.add(calcInterest(params, currentOwed));
  state.credit.balanceDue = totalOwed;
  state.credit.current = zero;

  // Try to pay it off immediately to minimize interest cost
  payBalanceDue(state);
}

//
// Perform due-date calculations and update outstanding
function updateCreditOnDueDate(params: CreditParams, state: SimulationState) {
  const { credit } = state;
  payBalanceDue(state);

  let current = credit.current;
  const outstanding = credit.balanceDue.gt(0);
  // If we are outstanding, then all credit is immediately due
  if (outstanding) {
    // If we previously were not outstanding, then the interest
    // is backdated from the moment of purchase.  Yay, credit cards :-)
    if (!credit.outstanding) {
      // Our avg balance over the past 7 weeks assumes a linear
      // progression from start of prior billing period to current
      // NOTE: some credit cards may not lose the current
      // grace period if not paid in full.  We use the more
      // pessimistic version here where interest is charged on everything
      const backdatedWeeks = params.graceWeeks + params.billingCycle
      const avgBalance = current.add(credit.balanceDue).div(2);
      const backDatedInterest = calcInterest(params, avgBalance).mul(backdatedWeeks)
      current = current.add(backDatedInterest);

      // If we are holding a balance, the entire balance is immediately due
      credit.balanceDue = credit.balanceDue.add(current);
      credit.current = zero;
    }
    // If already outstanding, interest has already been charged
  }
  credit.outstanding = outstanding;
}

function updateCreditEndCycle({ credit }: SimulationState) {
  credit.balanceDue = credit.balanceDue.add(credit.current);
  credit.current = zero;
  // It's the end cycle, we can remove the outstanding flag
  if (credit.outstanding) {
    credit.outstanding = credit.balanceDue.gt(0);
  }
}

