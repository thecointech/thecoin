import { IApiFactory } from "@/apis/interface";
import { readFileSync, readdirSync } from "fs";
import path from "path";
import { setApi } from "@/apis";

export function mockApi(baseFolder: string, step = 2, element = 0) {
  setApi(new ApiMockFactory(baseFolder, step, element));
}

export class ApiMockFactory implements IApiFactory {

  constructor(baseFolder: string, step = 2, element = 0) {
    this.baseFolder = baseFolder;
    this.step = step;
    this.element = element;
  }

  baseFolder: string;
  step: number;
  element: number;

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
        const suffix = `${apiName}-${callName}-vqa.json`;
        // Find matching file in the folder
        const files = readdirSync(path.join(this.baseFolder))
          .filter(f => f.endsWith(suffix));
        // return first for now
        const file = files[0];
        if (file) {
          return (...args: any[]) => {
            const cached = readFileSync(path.join(this.baseFolder, files[0]), "utf-8");
            // TODO: check cached args
            const js = JSON.parse(cached);
            return { data: js.response };
          }
        }
      }
    });
  }
}
