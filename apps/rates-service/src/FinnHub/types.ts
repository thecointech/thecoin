
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
