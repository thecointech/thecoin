// Rates come into effect 30 seconds afeter the market rate.
// This to allow us time to update, and give brokers plenty of time
// to update their local caches before the new rate comes
// into effect.
export const RateOffsetFromMarket = 30 * 1000
// How often to update the coin exchange rate/minimum interval
// a rate is valid for.  For testing period, we set this
// to a loooong time (3hrs), in production this should be
// set to 1 minute (shortest possible interval)
export const CoinUpdateInterval = 60 * 60 * 3 * 1000;
export const FXUpdateInterval = CoinUpdateInterval;

export class ExchangeRate {
    Buy: number;
    Sell: number;
    ValidFrom: number;
    ValidUntil: number;
    constructor(buy: number, sell: number, from: number, until: number) {
        this.Buy = buy;
        this.Sell = sell;
        this.ValidFrom = from;
        this.ValidUntil = until;
    }
}

export class FXRate {
    Rate: number;
    ValidFrom: number;
    ValidUntil: number;
    constructor(rate: number, from: number, until: number) {
        this.Rate = rate;
        this.ValidFrom = from;
        this.ValidUntil = until;
    }
}

export type FinnhubData =
{
    c: number[],
    h: number[],
    l: number[],
    o: number[],
    s: string,
    t: number[],
    v: number[]
}

export type FinnhubFxQuotes = {
    AED: number,
    AFN: number,
    ALL: number,
    AMD: number,
    CAD: number,
    CDF: number,
    CHF: number,
    CNY: number,
    COP: number,
    CRC: number,
    CUC: number,
    CUP: number,
    CVE: number,
    CZK: number,
    DJF: number,
    DKK: number,
    DOP: number,
    DZD: number,
    EGP: number,
    ERN: number,
    ETB: number,
    EUR: number,
    GBP: number,
    JPY: number,
    MDL: number,
    MGA: number,
    USD: number,
}
export type FinnhubRates = {
    base: keyof FinnhubFxQuotes,
    quote: FinnhubFxQuotes
}