import { yearInMs, toCoin } from './shockAbsorber.common'

const FLOAT_FACTOR = 100_000_000_000;
const maxCushionUp = 0.015; //1.5 * FLOAT_FACTOR / 100; // 1.5%
const maxCushionDown = 0.5; //50 * FLOAT_FACTOR / 100; // 50%
const maxFiatProtected = 5000;
const maxCushionUpPercent = 1 - (1 / (1 + maxCushionUp)) //FLOAT_FACTOR - (FLOAT_FACTOR * FLOAT_FACTOR / (FLOAT_FACTOR + maxCushionUp));


export class AbsorberJs  {
  fiatPrincipal = 5000;
  coinCurrent = 0;
  // coinAdjustment = 0;
  lastDrawDownTime = 0;

  avgFiatPrincipal = 0;
  avgCoinPrincipal = 0;
  lastAvgAdjustTime = 0;

  reserved = 0;
  maxCovered = 0;
  maxCoverAdjust = 0;

  constructor(fiatPrincipal: number) {
    this.fiatPrincipal = fiatPrincipal;
    this.coinCurrent = toCoin(fiatPrincipal, 100);
    this.maxCovered = this.coinCurrent / (1 - maxCushionDown);
  }

  getMaxPercentCushion = (timeMs: number) => 1 - (1 / (1 + maxCushionUp * (timeMs / yearInMs)))

  cushionUp = async (rate: number, year = 0) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const coinOriginal = this.coinCurrent + this.reserved;

    let percentCovered = maxFiatProtected / this.fiatPrincipal;
    percentCovered = Math.min(percentCovered, 1);
    const maxPercentCushion = this.getMaxPercentCushion((1 + year) * yearInMs);
    const coinMaxCushion = maxPercentCushion * coinOriginal;

    const coinCushion = coinOriginal - coinPrincipal;
    let coinCovered = coinCushion
    if (coinCushion > coinMaxCushion) {
      coinCovered = coinMaxCushion;
    }
    return Math.round(coinCovered * percentCovered) - this.reserved;
  };

  cushionDown = async (rate: number) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);
    const coinOriginal = this.coinCurrent + this.reserved;

    let percentCovered = maxFiatProtected / this.fiatPrincipal;
    percentCovered = Math.min(percentCovered, 1);

    const maxCushionCoin = this.maxCovered; //coinOriginal / (1 - maxCushionDown);
    const coinCovered = Math.min(maxCushionCoin, coinPrincipal)

    const target = percentCovered * coinCovered;
    const original = percentCovered * coinOriginal - this.reserved;
    return Math.round(target - original);
  }

  balanceOf = async (rate: number, year=0) => {
    const coinPrincipal = toCoin(this.fiatPrincipal, rate);

    if (coinPrincipal < this.coinCurrent) {
      // In Profit, run CushionUp
      const reserveCushion = await this.cushionUp(rate, year);
      return this.coinCurrent - reserveCushion;
    }
    else if (this.coinCurrent < coinPrincipal) {
      // In Loss, run CushionDown
      const addCushion = await this.cushionDown(rate);
      return this.coinCurrent + addCushion;
    }
    return this.coinCurrent;
  };

  deposit = async (fiat: number, rate: number, timeMs: number) => {

    const coinDeposit = toCoin(fiat, rate);
    let depositRatio = 1;
    if (this.fiatPrincipal) {
      const ratioOfExisting = coinDeposit / (this.maxCovered * maxCushionDown)
      depositRatio = (fiat / this.fiatPrincipal) / ratioOfExisting;
    }

    this.avgFiatPrincipal += this.getAnnualizedValue(timeMs, this.fiatPrincipal);
    this.avgCoinPrincipal += this.getAnnualizedValue(timeMs, this.coinCurrent);
    this.fiatPrincipal += fiat;
    this.coinCurrent += coinDeposit;

    let maxCoverAdjust = (1 - depositRatio) * coinDeposit / (1 - maxCushionDown)
    let maxCoverForCoin = coinDeposit / (1 - maxCushionDown);

    // NOTE TO SELF:
    // I kinda wrote this in a week-long haze of fatigue, caffeine, and alcohol,
    // and I really have no idea what it actually does.
    // The tests all pass though, so... yay me, I guess?
    // It's very likely it could be greatly optimized though...

    // In profit
    if (maxCoverAdjust < 0 && maxCoverForCoin > this.maxCoverAdjust) {
      // If adjusting for a withdrawal on loss
      if (this.maxCoverAdjust > 0) {
        this.maxCovered += maxCoverForCoin - maxCoverAdjust;
        this.maxCoverAdjust += maxCoverAdjust;
      }
      // Else eliminate adjustments for a withdrawal on profit
      else {
        this.maxCovered += maxCoverForCoin - this.maxCoverAdjust;
        this.maxCoverAdjust = 0;
      }
    }
    else {
      if (maxCoverForCoin > this.maxCoverAdjust) {
        maxCoverForCoin -= Math.min(maxCoverAdjust, this.maxCoverAdjust);
        this.maxCoverAdjust -= Math.min(maxCoverAdjust, this.maxCoverAdjust);
      } else {
        this.maxCoverAdjust -= maxCoverAdjust;
      }
      this.maxCovered += maxCoverForCoin;
    }

    this.lastAvgAdjustTime = timeMs;
  };

  withdraw = async (fiat: number, rate: number, timeMs: number) => {
    let coinWithdraw = toCoin(fiat, rate);
    let withdrawRatio = (fiat / this.fiatPrincipal) / (coinWithdraw / (this.maxCovered * maxCushionDown));

    if (this.coinCurrent < coinWithdraw) {
      // In Loss, run CushionDown
      const additionalRequired = coinWithdraw - this.coinCurrent;
      const maxCushion = await this.cushionDown(rate);
      if (additionalRequired > maxCushion) {
        throw new Error("Insufficient funds");
      }
      else {
        // in contract, transfer additionalRequired to this users account
        this.coinCurrent += additionalRequired;
      }
    }

    this.avgFiatPrincipal += this.getAnnualizedValue(timeMs, this.fiatPrincipal);
    this.avgCoinPrincipal += this.getAnnualizedValue(timeMs, this.coinCurrent);
    this.fiatPrincipal -= fiat;
    this.lastAvgAdjustTime = timeMs;
    this.coinCurrent -= coinWithdraw;

    this.maxCoverAdjust += (1 - withdrawRatio) * coinWithdraw / (1 - maxCushionDown);
    this.maxCovered -= withdrawRatio * coinWithdraw / (1 - maxCushionDown);
    return coinWithdraw;
  }

  getAnnualizedValue = (timeMs: number, value: number) => {
    const percentOfYear = (timeMs - this.lastAvgAdjustTime) / yearInMs;
    const annualizedAvg = value * percentOfYear;
    return Math.max(annualizedAvg, 0);
  }
  getAvgFiatPrincipal = async (timeMs: number) => {
    return this.avgFiatPrincipal + this.getAnnualizedValue(timeMs, this.fiatPrincipal);
  }
  getAvgCoinBalance = async (timeMs: number) => {
    return this.avgCoinPrincipal + this.getAnnualizedValue(timeMs, this.coinCurrent);
  }

  drawDownCushion = async (timeMs: number) => {
    const avgCoinPrincipal = await this.getAvgCoinBalance(timeMs);
    const avgFiatPrincipal = await this.getAvgFiatPrincipal(timeMs);
    // Prevent divide-by-zero
    if (avgCoinPrincipal == 0 || avgFiatPrincipal == 0) {
      return 0;
    }

    // How can we limit this to the maxiumum of the maxCushionUpPercent?
    const covered = Math.min(maxFiatProtected / avgFiatPrincipal, 1);
    // Multiply this by... how long it's been since we last adjusted?
    const percentOfYear = (timeMs - this.lastDrawDownTime) / yearInMs;
    // We always reserve the maximum percent, ignoring current rates
    // CushionDown ensures that this does not take balance below principal
    const percentCushion = this.getMaxPercentCushion(timeMs - this.lastDrawDownTime)// 1 - (1 / (1 + maxCushionUp * percentOfYear));
    // How many coins we gonna keep now?
    const toReserve = Math.floor(covered * percentCushion * avgCoinPrincipal);
    // Transfer the reserve to this contract
    this.reserved += toReserve;
    this.coinCurrent -= toReserve;
    this.lastDrawDownTime = timeMs;
    this.lastAvgAdjustTime = timeMs;
    return toReserve;
  }
}
