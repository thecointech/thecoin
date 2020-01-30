import {
  StatusApi,
  BillPaymentsApi,
  ReferrersApi,
  TransferApi,
  SecureApi,
  NewsletterApi,
  ETransferApi,
} from '@the-coin/broker-cad/dist/api';
import { ServiceAddress, ServicePorts } from '@the-coin/utilities/ServiceAddresses';
import { MockReferrersApi } from './mock/referrers';

const BrokerCADAddress = ServiceAddress(ServicePorts.BROKER_PORT);

const IsHeadless = process.env.NODE_ENV === 'development' && process.env.DB_CONFIG !== 'connected'

export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetTransferApi = () => new TransferApi(undefined, BrokerCADAddress);
export const GetETransferApi = () => new ETransferApi(undefined, BrokerCADAddress);
export const GetSecureApi = () => new SecureApi(undefined, BrokerCADAddress);
export const GetNewsletterApi = () => new NewsletterApi(undefined, BrokerCADAddress);

export const GetReferrersApi = () => 
  IsHeadless
    ? new MockReferrersApi()
    : new ReferrersApi(undefined, BrokerCADAddress);