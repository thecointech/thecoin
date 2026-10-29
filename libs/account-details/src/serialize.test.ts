
import { DateTime } from "luxon";
import { fromSerializable, toSerializable } from "./serialize";

it("round-trips DateTime through serialization", () => {
  const dt = DateTime.fromISO("2026-10-28T12:34:56.789-04:00", { setZone: true });
  const data = { dt, nested: { list: [dt] }, iso: "2026-10-28", n: 1 };
  const restored = fromSerializable(JSON.parse(JSON.stringify(toSerializable(data)))) as typeof data;

  expect(DateTime.isDateTime(restored.dt)).toBe(true);
  expect(restored.dt.toISO()).toEqual(dt.toISO());
  expect(DateTime.isDateTime(restored.nested.list[0])).toBe(true);
  // Plain strings that look like dates are left alone
  expect(restored.iso).toBe("2026-10-28");
  expect(restored.n).toBe(1);
});
