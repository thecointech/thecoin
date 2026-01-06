import { DateTime } from "luxon";
import { getDateVals, MarketTZ } from "./data";

it('calculates dates correctly', () => {
  const {from, eodOffset} = getDateVals({
    txs: [],
    from: DateTime.local(),
    to: undefined,
  });

  expect(from.plus(eodOffset).setZone(MarketTZ).toFormat("HH:mm:ss")).toBe("16:00:00");
})
