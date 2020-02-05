import {
  StatusApi,
  BillPaymentsApi,
  ReferrersApi,
  TransferApi,
  SecureApi,
  NewsletterApi,
  ETransferApi,
} from '@the-coin/broker-cad';
import { ServiceAddress, ServicePorts } from '@the-coin/utilities/ServiceAddresses';
import { MockReferrersApi } from './mock/referrers';
import { MockSecureApi } from './mock/secure';

const BrokerCADAddress = ServiceAddress(ServicePorts.BROKER_PORT);

const NoDatabase = process.env.NODE_ENV === 'development' && process.env.DB_CONFIG !== 'connected'
console.log("NoDatabase: " + NoDatabase);

export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetTransferApi = () => new TransferApi(undefined, BrokerCADAddress);
export const GetETransferApi = () => new ETransferApi(undefined, BrokerCADAddress);
export const GetNewsletterApi = () => new NewsletterApi(undefined, BrokerCADAddress);

export const GetReferrersApi = () => 
  NoDatabase
    ? new MockReferrersApi()
    : new ReferrersApi(undefined, BrokerCADAddress);

export const GetSecureApi = () => 
  NoDatabase
    ? new MockSecureApi()
    : new SecureApi(undefined, BrokerCADAddress);
