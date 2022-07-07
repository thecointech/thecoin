import {
  StatusApi,
  BillPaymentsApi,
  DirectTransferApi,
  ETransferApi,
  UserVerificationApi,
  SecureApi,
  ReferralsApi
} from '@thecointech/broker-cad';

export { StatusType /*, EventType*/ } from '@thecointech/broker-cad';
export type { UserVerifyData } from '@thecointech/broker-cad';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
export const GetUserVerificationApi = () => new UserVerificationApi(undefined, BrokerCADAddress);
export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetDirectTransferApi = () => new DirectTransferApi(undefined, BrokerCADAddress);
export const GetETransferApi = () => new ETransferApi(undefined, BrokerCADAddress);

export const GetSecureApi = () => new SecureApi(undefined, BrokerCADAddress);
export const GetReferrersApi = () => new ReferralsApi(undefined, BrokerCADAddress);
