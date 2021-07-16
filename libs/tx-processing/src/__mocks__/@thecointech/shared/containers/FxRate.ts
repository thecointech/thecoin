import type { fetchRate, FXRate } from "@thecointech/shared/containers/FxRate";
export * from "@thecointech/shared/containers/FxRate";

const fn: typeof fetchRate = async (date?: Date) : Promise<FXRate> => {
  var now = date?.getTime() ?? Date.now();
  return {
    target: 124,
    buy: 1,
    sell: 2,
    fxRate: 3,
    validFrom: now,
    validTill: now + 360000,
  }
}
export {fn as fetchRate };
