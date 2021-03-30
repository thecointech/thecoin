import {
  StatusApi,
  BillPaymentsApi,
  ReferralsApi,
  DirectTransferApi,
  SecureApi,
  ETransferApi,
} from '@thecointech/broker-cad';
import { MockReferrersApi } from './mock/referrers';
import { MockSecureApi } from './mock/secure';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
const NoDatabase = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')
                    && process.env.SETTINGS !== 'live';

export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetDirectTransferApi = () => new DirectTransferApi(undefined, BrokerCADAddress);
export const GetETransferApi = () => new ETransferApi(undefined, BrokerCADAddress);

export const GetReferrersApi = () =>
  NoDatabase
    ? new MockReferrersApi()
    : new ReferralsApi(undefined, BrokerCADAddress);

export const GetSecureApi = () =>
  NoDatabase
    ? new MockSecureApi()
    : new SecureApi(undefined, BrokerCADAddress);
