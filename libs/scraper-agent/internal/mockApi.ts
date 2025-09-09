import { IApiFactory } from "@/apis/interface";
import { setApi } from "@/apis";
import { TestDataAgent } from "./testDataAgent";

export function mockApi(testData: TestDataAgent) {
  setApi(new ApiMockFactory(testData));
  return {
    [Symbol.dispose]: () => {
      setApi(null);
    }
  }
}

export class ApiMockFactory implements IApiFactory {

  constructor(private testData: TestDataAgent) {}

  getVqaBaseApi = () => this.wrapApi('VqaBaseApi');
  getIntentApi = () => this.wrapApi('IntentApi');
  getModalApi = () => this.wrapApi('ModalApi');
  getLandingApi = () => this.wrapApi('LandingApi');
  getLoginApi = () => this.wrapApi('LoginApi');
  getTwofaApi = () => this.wrapApi('TwofaApi');
  getAccountSummaryApi = () => this.wrapApi('AccountSummaryApi');
  getETransferApi = () => this.wrapApi('ETransferApi');
  getCreditDetailsApi = () => this.wrapApi('CreditDetailsApi');

  async wrapApi(apiName: string): Promise<any> {
    return new Proxy({}, {
      get: (target, prop) => {
        // Skip promise handling
        if (!prop || prop == "then") {
          return undefined;
        }
        const callName = prop as string;
        const vqaKey = `${apiName}-${callName}`;

        // Get or create iterator for this API call

        return (...args: any[]) => {
          // We could verify the passed args vs the args in the vqa
          // if we have multiple vqa calls and need to find the right one
          // (not sure if this is an issue yet though)

          // Get next value from iterator
          const vqaData = this.testData.vqa(vqaKey, ...args);
          if (vqaData) {
            return {
              data: vqaData.response
            };
          }
          // Return undefined if no mock data found
          return undefined;
        };
      }
    });
  }
}
