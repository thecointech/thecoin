type FxType = {
  validFrom: number,
  validTill: number
}
export const validFor = (rate: FxType, ts: number) =>
  rate.validFrom <= ts && rate.validTill > ts;
