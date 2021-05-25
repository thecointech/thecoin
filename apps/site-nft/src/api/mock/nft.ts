import { DefaultApi, GasslessUpdateRequest} from "@thecointech/nft";
import { buildResponse, delay } from "@thecointech/site-base/api/mock/utils";
import { AxiosResponse } from 'axios';


const genRandBase = (size: number, base: number) => [...Array(size)].map(() => Math.floor(Math.random() * base).toString(base)).join('');

/**
 * SecureApi - object-oriented interface
 * @export
 * @class SecureApi
 * @extends {BaseAPI}
 */
export class MockNftApi  implements Pick<DefaultApi, keyof DefaultApi> {
  async updateNftUri(_update: GasslessUpdateRequest, _options?: any): Promise<AxiosResponse<boolean>> {
    await delay(250);
    return buildResponse(true);
  }
  async uploadAvatar(_avatar: any, _signature: string, _options?: any): Promise<AxiosResponse<string>> {
    await delay(250);
    return buildResponse(`Qm${genRandBase(44, 58)}`);
  }
  async uploadMetadata(_json: object, _options?: any): Promise<AxiosResponse<string>> {
    await delay(250);
    return buildResponse(`Qm${genRandBase(44, 58)}`);
  }
}
