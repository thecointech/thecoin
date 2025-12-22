import Decimal from 'decimal.js-light';
import { DateTime } from 'luxon';
import { SimulationParameters } from './params';
import { grossFiat, SimulationState, toCoin, toFiat } from './state';
import { DMin, one, zero } from './sim.decimal';
import { weekContainedAnniversary } from './time';

//
//
export function applyShockAborber(start: DateTime, params: SimulationParameters, state: SimulationState) {
  const sa = params.shockAbsorber;
  if (!sa.maximumProtected || state.coin.eq(0)) return;

  // On the anniversary, lock in any cushion & profit
  if (weekContainedAnniversary(start, state.date)) {
    updateCushion(params, state);
  }

  applyCushion(params, state);
}

function applyCushion(params: SimulationParameters, state: SimulationState) {
  const currentFiat = grossFiat(state);
  const cushioned = getCushioned(state);
  // If we are losing money, cushion it
  if (currentFiat.lt(cushioned)) {
    cushionDown(currentFiat, cushioned, params, state);
  }

  // Else, reserve  the first profits
  else if (currentFiat.gt(cushioned)) {
    cushionUp(currentFiat, cushioned, params, state);
  }
}

//
// Cushion the account when it's value goes down.
function cushionDown(currentFiat: Decimal, cushioned: Decimal, params: SimulationParameters, state: SimulationState) {
  const sa = params.shockAbsorber;
  // What is the drop to be cushionDown?
  const fiatProtected = DMin(cushioned, sa.maximumProtected);
  // what ratio of principal is protected
  const ratio = fiatProtected.div(cushioned);
  // what was principal in coin?
  const coinPrincipal = state.coin.sub(state.shockAbsorber.coinAdjustment);
  // how much of this was protected?
  const coinPrincipalProtected = coinPrincipal.mul(ratio);

  // What is the total percentage loss are we absorbing?
  // This loss ignores anything previously cushionDown
  const fiatAdjustment = toFiat(state.shockAbsorber.coinAdjustment, state.market);
  const loss = fiatProtected
    //.sub(toFiat(state.shockAbsorber.coinAdjustment, market))
    .sub(currentFiat.sub(fiatAdjustment).mul(ratio));
  const lossPercent = loss.div(fiatProtected);
  const cushionDownPercent = DMin(lossPercent, sa.cushionDown);

  // We adjust the principal protected to still have the same total value
  // after cushionDownPercent decline in multiplier value
  const principalMultipler = one.sub(cushionDownPercent);
  // aCP is the final value we want our protected coin to have
  const adjustCoinPrincipal = coinPrincipalProtected.div(principalMultipler);
  const adjustCoin = adjustCoinPrincipal.sub(coinPrincipalProtected.add(state.shockAbsorber.coinAdjustment));

  state.coin = state.coin.add(adjustCoin);
  state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.add(adjustCoin);
  roundOffAdjustments(state);
}

//
// Cushion going (more akin to inflating the cushion than anything)
function cushionUp(currentFiat: Decimal, cushioned: Decimal, params: SimulationParameters, state: SimulationState) {
  const sa = params.shockAbsorber;

  // first, unwind any existing adjustments.
  if (state.shockAbsorber.coinAdjustment.gt(0)) {

    cushionDown(currentFiat, cushioned, params, state);
    currentFiat = grossFiat(state);
  }

  if (state.shockAbsorber.coinAdjustment.lte(0)) {
    const alreadycushionDown = toFiat(state.shockAbsorber.coinAdjustment, state.market);

    const gain = currentFiat.sub(cushioned).sub(alreadycushionDown);
    const fiatCovered = DMin(cushioned, new Decimal(sa.maximumProtected));
    const ratio = fiatCovered.div(cushioned);

    const maxFiatToAbsorb = fiatCovered.mul(sa.cushionUp);
    const toAbsorb = DMin(gain.mul(ratio), maxFiatToAbsorb);
    const coinAdjust = toCoin(toAbsorb, state.market).add(state.shockAbsorber.coinAdjustment);

    state.coin = state.coin.sub(coinAdjust);
    state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.sub(coinAdjust);
  }
}

//
// Ensure we eliminate slight round-off differences in ShockAbsorber
const MinimumPrecision = new Decimal(10).pow(-10);
function roundOffAdjustments(state: SimulationState) {
  if (state.shockAbsorber.coinAdjustment.abs().lt(MinimumPrecision)) {
    state.coin = state.coin.todp(10);
    state.shockAbsorber.coinAdjustment = zero;
  }
}

//
// Updating the cushion is the process of incorporating profit into
// principalAdjustment and resetting the cushion
function updateCushion(_params: SimulationParameters, state: SimulationState) {
  const sa = state.shockAbsorber
  // If we are currently absorbing a loss, skip this years adjustment
  if (sa.coinAdjustment.gte(0))
    return;

  // We reset the cushioning
  sa.totalCushionGathered.add(sa.coinAdjustment);
  sa.coinAdjustment = zero;

  // And move any profit below 'max covered' into principal so it is now covered.
  const currentFiat = grossFiat(state);
  const cushioned = getCushioned(state);
  const profit = currentFiat.sub(cushioned);
  // limit profit to a max 10% gain each year
  const maxPrincipalAdj = cushioned.mul(0.1);
  const currentPrincipalAdj = DMin(profit, maxPrincipalAdj);
  sa.principalAdjustment = sa.principalAdjustment.add(currentPrincipalAdj);
}

const getCushioned = (state: SimulationState) => state.principal.add(state.shockAbsorber.principalAdjustment);

