import { NFTApi } from '@thecointech/nft';

const NftServiceAddress = process.env.URL_SERVICE_NFT;
export const GetNftApi = () => new NFTApi(undefined, NftServiceAddress);
