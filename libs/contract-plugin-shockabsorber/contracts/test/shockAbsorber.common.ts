export const yearInMs = 31556952_000;

export const toCoin = (fiat: number, rate: number) => fiat / (rate / 1e6)
export const toFiat = (coin: number, rate: number) => Math.round(100 * coin * (rate / 1e6)) / 100

