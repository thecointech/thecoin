import type { NFTApi as SrcApi, GasslessUpdateRequest, NftClaim} from "@thecointech/nft";
import { buildResponse } from "./axios-utils";
import { AxiosResponse } from 'axios';
import { sleep } from '@thecointech/async';

const genRandBase = (size: number, base: number) => [...Array(size)].map(() => Math.floor(Math.random() * base).toString(base)).join('');
const flipCoin = () => Math.random() > 0.5;
export class NFTApi  implements Pick<SrcApi, keyof SrcApi> {
  async claimNft(_claim: NftClaim, _options?: any): Promise<AxiosResponse<object>> {
    await sleep(250);
    const r = flipCoin() ? false : "0x32c8052afdc366b00990083375178a12f45270d917315fcf0204b0d50f95fb5f";
    return buildResponse(r as any);
  }
  async updateNftUri(_update: GasslessUpdateRequest, _options?: any): Promise<AxiosResponse<boolean>> {
    await sleep(250);
    return buildResponse(flipCoin());
  }
  async uploadAvatar(_avatar: any, _signature: string, _options?: any): Promise<AxiosResponse<string>> {
    await sleep(250);
    return buildResponse(`Qm${genRandBase(44, 58)}`);
  }
  async uploadMetadata(_json: object, _options?: any): Promise<AxiosResponse<string>> {
    await sleep(250);
    return buildResponse(`Qm${genRandBase(44, 58)}`);
  }
}

export const GetNftApi = () => new NFTApi();
