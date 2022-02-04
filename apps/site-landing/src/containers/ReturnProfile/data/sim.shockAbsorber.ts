import { Decimal } from 'decimal.js-light';
import { DateTime } from 'luxon';
import { MarketData } from './market';
import { SimulationParameters } from './params';
import { SimulationState, toCoin, toFiat } from './state';
import { DMin, one, zero } from './sim.decimal';
import { straddlesYear } from './time';

//
//
export function applyShockAborber(start: DateTime, params: SimulationParameters, state: SimulationState, market: MarketData) {
  const sa = params.shockAbsorber;
  if (!sa.maximumProtected || state.coin.eq(0)) return;

  // If state is losing money, top it up from reserves
  applyCushion(params, state, market);

  // Once a year has passed, we update our protected state
  if (straddlesYear(start, state.date)) {
    updateCushion(params, state, market);
    // We re-calculate the cushion
    applyCushion(params, state, market)
  }
}

function applyCushion(params: SimulationParameters, state: SimulationState,  market: MarketData) {
  // The shock absorber works by taking the first X% of profit
  //const fiatProtected = DMin(state.principal, new Decimal(sa.maximumProtected));
  const currentFiat = toFiat(state.coin, market);

  if (currentFiat.lt(state.principal)) {
    cushionDown(currentFiat, params, state, market);
  }

  // Else, reserve  the first profits
  else if (currentFiat.gt(state.principal)) {
    cushionUp(currentFiat, params, state, market);
  }
}

//
// Cushion the account when it's value goes down.
function cushionDown(currentFiat: Decimal, params: SimulationParameters, state: SimulationState, market: MarketData) {
  const sa = params.shockAbsorber;
  // What is the drop to be absorbed?
  const fiatProtected = DMin(state.principal, sa.maximumProtected);
  // what ratio of principal is protected
  const ratio = fiatProtected.div(state.principal);
  // what was principal in coin?
  const coinPrincipal = state.coin.sub(state.shockAbsorber.coinAdjustment);
  // how much of this was protected?
  const coinPrincipalProtected = coinPrincipal.mul(ratio);

  // What is the total percentage loss are we absorbing?
  // This loss ignores anything previously absorbed
  const fiatAdjustment = toFiat(state.shockAbsorber.coinAdjustment, market);
  const loss = fiatProtected
    //.sub(toFiat(state.shockAbsorber.coinAdjustment, market))
    .sub(currentFiat.sub(fiatAdjustment).mul(ratio));
  const lossPercent = loss.div(fiatProtected);
  const absorbedPercent = DMin(lossPercent, sa.absorbed);

  // We adjust the principal protected to still have the same total value
  // after absorbedPercent decline in multiplier value
  const principalMultipler = one.sub(absorbedPercent);
  // aCP is the final value we want our protected coin to have
  const adjustCoinPrincipal = coinPrincipalProtected.div(principalMultipler);
  const adjustCoin = adjustCoinPrincipal.sub(coinPrincipalProtected.add(state.shockAbsorber.coinAdjustment));

  state.coin = state.coin.add(adjustCoin);
  state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.add(adjustCoin);
  roundOffAdjustments(state);
}

//
// Cushion going (more akin to inflating the cushion than anything)
function cushionUp(currentFiat: Decimal, params: SimulationParameters, state: SimulationState, market: MarketData) {
  const sa = params.shockAbsorber;

  // first, unwind any existing adjustments.
  if (state.shockAbsorber.coinAdjustment.gt(0)) {

    cushionDown(currentFiat, params, state, market);
    currentFiat = toFiat(state.coin, market);
  }

  if (state.shockAbsorber.coinAdjustment.lte(0)) {
    const alreadyAbsorbed = toFiat(state.shockAbsorber.coinAdjustment, market);

    const gain = currentFiat.sub(state.principal).sub(alreadyAbsorbed);
    const fiatCovered = DMin(state.principal, new Decimal(sa.maximumProtected));
    const ratio = fiatCovered.div(state.principal);

    const maxFiatToAbsorb = fiatCovered.mul(sa.cushionPercentage);
    const toAbsorb = DMin(gain.mul(ratio), maxFiatToAbsorb);
    const coinAdjust = toCoin(toAbsorb, market).add(state.shockAbsorber.coinAdjustment);

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
// principal and resetting the cushion
function updateCushion(params: SimulationParameters, state: SimulationState, market: MarketData) {
  const sa = state.shockAbsorber
  // If we are currently absorbing a loss, skip this years adjustment
  if (sa.coinAdjustment.gte(0))
    return;

  // We reset the cushioning
  sa.historicalAdjustment.add(sa.coinAdjustment);
  sa.coinAdjustment = zero;

  // And move any profit below 'max covered' into principal so it is now covered.
  const currentFiat = toFiat(state.coin, market);
  const profit = currentFiat.sub(state.principal);
  // limit profit to a max 10% gain each year
  const maxPrincipalAdj = state.principal.mul(0.1);
  const principalAdj = DMin(profit, maxPrincipalAdj);
  state.principal = state.principal.add(principalAdj);
}

