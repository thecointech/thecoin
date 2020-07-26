import { IFxRates, FXRate, getRate, EmptyRate, fetchRate } from "@the-coin/shared/containers/FxRate";

// Shim class fakes the online actions + reducer
export class OfflineFxRates implements IFxRates
{
  rates: FXRate[] = [];
  fetches: Promise<any>[] = [];

  constructor()
  {
    this.fetches.push(this.fetchAndStoreRate());
  }

  *fetchRateAtDate(date: Date) {
    // No duplicates
    if (getRate(this.rates, date) != EmptyRate)
      return;

    this.fetches.push(this.fetchAndStoreRate(date));
  }

  async fetchAndStoreRate(date?: Date) {
      const r = await fetchRate(date);
      this.rates = [
        ...this.rates,
        r!
      ].sort((a, b) => a.validFrom - b.validFrom);
  }

  async waitFetches() {
    return Promise.all(this.fetches);
  }
}
