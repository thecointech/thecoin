import { FXRate, RatesApi as IRatesApi  } from "@thecointech/pricing";
import { AxiosResponse } from "axios";

export class RatesApi implements Pick<IRatesApi, keyof IRatesApi> {

  getMany(_timestamps: number[], _options?: any): Promise<AxiosResponse<FXRate[]>> {
    throw new Error("Method not implemented.");
  }
  getSingle(_currencyCode: number, _timestamp?: number, _options?: any): Promise<AxiosResponse<FXRate>> {
    const rate: FXRate = {
      buy: 1,
      sell: 1,
      fxRate: 1,
      target: 124,
      validFrom: 0,
      validTill: Number.MAX_SAFE_INTEGER,
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
