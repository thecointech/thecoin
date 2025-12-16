import { GetETransferApi, GetIntentApi, GetLandingApi, GetModalApi, GetTwofaApi, GetVqaBaseApi, GetLoginApi, GetAccountSummaryApi, GetCreditDetailsApi } from "@thecointech/apis/vqa";
import type { IApiFactory } from "./interface";
import { ApiCallEvent, bus } from "../eventbus";


export class ApiEventFactory implements IApiFactory {

  getVqaBaseApi = async () => this.wrapApi(await GetVqaBaseApi(), 'VqaBaseApi');
  getIntentApi = async () => this.wrapApi(await GetIntentApi(), 'IntentApi');
  getModalApi = async () => this.wrapApi(await GetModalApi(), 'ModalApi');
  getLandingApi = async () => this.wrapApi(await GetLandingApi(), 'LandingApi');
  getLoginApi = async () => this.wrapApi(await GetLoginApi(), 'LoginApi');
  getTwofaApi = async () => this.wrapApi(await GetTwofaApi(), 'TwofaApi');
  getAccountSummaryApi = async () => this.wrapApi(await GetAccountSummaryApi(), 'AccountSummaryApi');
  getETransferApi = async () => this.wrapApi(await GetETransferApi(), 'ETransferApi');
  getCreditDetailsApi = async () => this.wrapApi(await GetCreditDetailsApi(), 'CreditDetailsApi');

  wrapApi<T extends object>(api: T, apiName: string): T {
    return new Proxy(api, {
      get: (target, prop) => {
        const originalMethod = target[prop as keyof T];
        if (typeof originalMethod === 'function') {
          return async (...args: any[]) => {
            const event: ApiCallEvent = {
              apiName,
              method: prop as string,
              request: args,
              timestamp: Date.now(),
            };

            try {
              const result = await originalMethod.apply(target, args);
              event.response = result;
              await bus().emitApiCall(event);
              return result;
            } catch (error) {
              event.error = error;
              await bus().emitApiCall(event);
              throw error;
            }
          };
        }
        return originalMethod;
      }
    });
  }
}
