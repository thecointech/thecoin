import { RatesApi, type FXRate } from "@thecointech/pricing";
import { createGaeServiceProxy } from "../resilience";

export type { FXRate }

export const GetRatesApi = () => {
  const api = new RatesApi(undefined, process.env.URL_SERVICE_RATES);
  
  // Wrap the entire API instance with the GAE service proxy
  return createGaeServiceProxy(api);
}
