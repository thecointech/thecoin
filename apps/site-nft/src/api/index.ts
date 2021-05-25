import { NFTApi } from '@thecointech/nft';
import { SecureApi } from '@thecointech/broker-cad';
import { MockNftApi } from './mock/nft';
import { MockSecureApi } from './mock/secure';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
const NftServiceAddress = process.env.URL_SERVICE_NFT;
const NoDatabase = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')
                    && process.env.SETTINGS !== 'live';

export const GetNftApi = () =>
  NoDatabase
    ? new MockNftApi()
    : new NFTApi(undefined, NftServiceAddress);

export const GetSecureApi = () =>
  NoDatabase
    ? new MockSecureApi()
    : new SecureApi(undefined, BrokerCADAddress);
