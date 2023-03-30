export const yearInMs = 31556952_000;

// always use SOL tester in CI
export const useJsTester = !process.env.JEST_CI && false;

export const toCoin = (fiat: number, rate: number) => Math.round(fiat / (rate / 1e6))
export const toFiat = (coin: number, rate: number) => Math.round(100 * coin * (rate / 1e6)) / 100

