import { SecureApi, ReferralsApi } from '@thecointech/broker-cad';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
export const GetSecureApi = () => new SecureApi(undefined, BrokerCADAddress);
export const GetReferrersApi = () => new ReferralsApi(undefined, BrokerCADAddress);

export const clientUri = `${window.location.origin}/gauth`;
