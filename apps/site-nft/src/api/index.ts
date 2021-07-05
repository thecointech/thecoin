import { NFTApi } from '@thecointech/nft';
import { SecureApi } from '@thecointech/broker-cad';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
const NftServiceAddress = process.env.URL_SERVICE_NFT;

export const GetNftApi = () => new NFTApi(undefined, NftServiceAddress);
export const GetSecureApi = () => new SecureApi(undefined, BrokerCADAddress);
