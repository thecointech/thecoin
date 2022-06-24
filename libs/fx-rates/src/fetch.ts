import { log } from '@thecointech/logging';
import { CurrencyCode } from './CurrencyCodes';
import { FXRate, RatesApi } from '@thecointech/pricing';

export async function fetchRate(date?: Date): Promise<FXRate | null> {
  const cc = CurrencyCode.CAD;
  log.trace(`fetching fx rate: ${cc} for time ${date?.toLocaleTimeString() ?? "now"}`);
  const api = new RatesApi(undefined, process.env.URL_SERVICE_RATES);
  const r = await api.getSingle(cc, date?.getTime() ?? 0);
  if (r.status != 200 || !r.data.validFrom) {
    if (date)
      log.error(`Error fetching rate for: ${date.getTime()} (${date.toLocaleString()}): ${r.statusText} - ${r.data}`)
    else
      log.error(`Error fetching latest rate: ${r.statusText}`);
    return null;
  }
  return r.data;
}
