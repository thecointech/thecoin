import { FXRate, RatesApi as IRatesApi  } from "@thecointech/pricing";
import { AxiosResponse } from "axios";
import { DateTime } from "luxon";
export class RatesApi implements Pick<IRatesApi, keyof IRatesApi> {

  getMany(_timestamps: number[], _options?: any): Promise<AxiosResponse<FXRate[]>> {
    throw new Error("Method not implemented.");
  }
  getSingle(_currencyCode: number, timestamp?: number, _options?: any): Promise<AxiosResponse<FXRate>> {
    const date = timestamp
      ? DateTime.fromMillis(timestamp)
      : DateTime.now();

    const rate: FXRate = {
      buy: 1,
      sell: 1,
      fxRate: 1,
      target: 124,
      validFrom: date.set({hour: 0, minute: 0, second: 0}).toMillis(),
      validTill: date.plus({days: 1}).set({hour: 0, minute: 0, second: 0}).toMillis(),
    }
    return Promise.resolve({
      data: rate,
      status: 200,
      statusText: "success",
      config: {} as any,
      headers: {} as any,
    })
  }
}
