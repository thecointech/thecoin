import { RatesApi, type FXRate } from "@thecointech/pricing";

export type { FXRate }
export const GetRatesApi = () => new RatesApi(undefined, process.env.URL_SERVICE_RATES);
