import currency from "currency.js";
import { DateTime } from "luxon";
import { setOverrides, getCurrentState } from "./state";
import { ClearPendingVisa } from "./steps/ClearPendingVisa";
import { PayVisa } from "./steps/PayVisa";
import { TransferVisaOwing } from "./steps/TransferVisaOwing";

it ('can override balance', async () => {
  const now = DateTime.now();
  await setOverrides(124.23, 1400, now.toISO());
  const r = await getCurrentState();
  expect(r!.state.harvesterBalance?.value).toEqual(124.23);
  expect(r!.state.toPayVisa?.value).toEqual(1400);
  expect(r!.state.toPayVisaDate).toEqual(now);

  // Check that Transfer recognizes the override
  r!.visa.balance = new currency(300);
  const xferDelta = await new TransferVisaOwing().process(r!);
  expect(xferDelta.toETransfer).toEqual(new currency(300 - 124.23));

  // Check that PayVisa recognizes the override
  const payDelta = await new PayVisa().process(r!, {} as any);
  expect(payDelta).toEqual({});

  // Check that ClearVisa recognizes the override
  r!.visa.history = [{
    date: now,
    values: [currency(1400)],
  }]
  r.date = now.plus({ days: 1 });
  const clearDelta = await new ClearPendingVisa().process(r, {} as any);
  expect(clearDelta.toPayVisa).toBeUndefined();
  expect(clearDelta.toPayVisaDate).toBeUndefined();
})
