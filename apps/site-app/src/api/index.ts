import {
  StatusApi,
  BillPaymentsApi,
  ReferrersApi,
  TransferApi,
  SecureApi,
  ETransferApi,
} from '@the-coin/broker-cad';
import { ServiceAddress, Service } from '@the-coin/utilities/ServiceAddresses';
import { MockReferrersApi } from './mock/referrers';
import { MockSecureApi } from './mock/secure';

const BrokerCADAddress = ServiceAddress(Service.BROKER);

const NoDatabase = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')
                    && process.env.SETTINGS !== 'live';

export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetTransferApi = () => new TransferApi(undefined, BrokerCADAddress);
export const GetETransferApi = () => new ETransferApi(undefined, BrokerCADAddress);

export const GetReferrersApi = () =>
  NoDatabase
    ? new MockReferrersApi()
    : new ReferrersApi(undefined, BrokerCADAddress);

export const GetSecureApi = () =>
  NoDatabase
    ? new MockSecureApi()
    : new SecureApi(undefined, BrokerCADAddress);
