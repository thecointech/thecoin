import type { FXRate, RatesApi as IRatesApi  } from "@thecointech/pricing";
import type { AxiosResponse } from "axios";
import { buildResponse } from "./axios-utils";
import { DateTime } from "luxon";

class RatesApi implements Pick<IRatesApi, keyof IRatesApi> {

  getMany(_timestamps: number[], _options?: any): Promise<AxiosResponse<FXRate[]>> {
    throw new Error("Method not implemented.");
  }
  async getSingle(_currencyCode: number, timestamp?: number, _options?: any): Promise<AxiosResponse<FXRate>> {
    const date = timestamp
      ? DateTime.fromMillis(timestamp)
      : DateTime.now();

    return buildResponse<FXRate>({
      buy: 2,
      sell: 2,
      fxRate: 1,
      target: 124,
      validFrom: date.set({hour: 0, minute: 0, second: 0}).toMillis(),
      validTill: date.plus({days: 1}).set({hour: 0, minute: 0, second: 0}).toMillis(),
    } as any);
  }
}

export const GetRatesApi = () => new RatesApi();
