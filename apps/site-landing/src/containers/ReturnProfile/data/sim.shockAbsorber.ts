import { Decimal } from 'decimal.js-light';
import { DateTime } from 'luxon';
import { MarketData } from './market';
import { SimulationParameters } from './params';
import { SimulationState, toCoin, toFiat } from './state';
import { DMin, one } from './sim.decimal';


export function applyShockAborber(_start: DateTime, params: SimulationParameters, state: SimulationState, market: MarketData) {
  const sa = params.shockAbsorber;
  if (!sa.maximumProtected) return;

  // The shock absorber works by taking the first X% of profit
  //const fiatProtected = DMin(state.principal, new Decimal(sa.maximumProtected));
  let currentFiat = toFiat(state.coin, market);

  // If state is losing money, top it up from reserves
  if (currentFiat.lt(state.principal)) {

    const alreadyAbsorbed = state.shockAbsorber.coinAdjustment.div(state.coin);
    const maxToAbsorb = new Decimal(sa.absorbed)
      .add(alreadyAbsorbed)
      .div(one.add(alreadyAbsorbed));

    // how much should we transfer to top-up the account?
    const loss = state.principal.sub(currentFiat);
    const lossPercent = loss.div(state.principal);
    const absorbedPercent = DMin(lossPercent, maxToAbsorb);

    // Real eqn = coin((1 / (1 - loss) - 1)
    const remainPercent = one.sub(absorbedPercent);
    const cushionPercent = one.div(remainPercent).sub(1);
    const coinAdjust = state.coin.mul(cushionPercent);

    state.coin = state.coin.add(coinAdjust);
    state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.sub(coinAdjust);
  }
  // Else, reserve  the first profits
  else if (currentFiat.gt(state.principal)) {

    let gain = currentFiat.sub(state.principal);

    // first, unwind any existing adjustments.
    if (state.shockAbsorber.coinAdjustment.lt(0)) {
      const gainCoin = gain.div(market.P);
      const reduction = DMin(gainCoin, state.shockAbsorber.coinAdjustment.neg());
      state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.add(reduction);
      state.coin = state.coin.sub(reduction);
      gain = gain.sub(toFiat(reduction, market))
    }

    if (state.shockAbsorber.coinAdjustment.gte(0)) {

      const maxFiatToAbsorb = state.principal.mul(params.shockAbsorber.cushionPercentage);
      const alreadyAbsorbed = toFiat(state.shockAbsorber.coinAdjustment, market);
      const toAbsorb = DMin(gain, maxFiatToAbsorb.sub(alreadyAbsorbed));
      const coinAdjust = toCoin(toAbsorb, market);

      state.coin = state.coin.sub(coinAdjust);
      state.shockAbsorber.coinAdjustment = state.shockAbsorber.coinAdjustment.add(coinAdjust);
    }
  }
}
