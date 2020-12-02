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
import { MockNewsletterApi } from './mock/newsletter';

const BrokerCADAddress = ServiceAddress(ServicePorts.BROKER_PORT);

const NoDatabase = (process.env.NODE_ENV === 'test' ||process.env.NODE_ENV === 'development')
                    && process.env.DB_CONFIG !== 'connected';

console.log("NoDatabase: " + NoDatabase);

export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetTransferApi = () => new TransferApi(undefined, BrokerCADAddress);
export const GetETransferApi = () => new ETransferApi(undefined, BrokerCADAddress);

// TODO: These will be deleted
export const GetReferrersApi = () => new ReferrersApi(undefined, BrokerCADAddress);
export const GetSecureApi = () => new SecureApi(undefined, BrokerCADAddress);

export const GetNewsletterApi = () =>
  NoDatabase
    ? new MockNewsletterApi()
    : new NewsletterApi(undefined, BrokerCADAddress);
