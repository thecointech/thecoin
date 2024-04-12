import {
  StatusApi,
  StatusType as StatusType_Import,
  // EventType as EventType_Import,
  BillPaymentsApi,
  DirectTransferApi,
  ETransferApi,
  UserVerificationApi,
  SecureApi,
  ReferralsApi,
  PluginsApi,
  HarvesterApi
} from '@thecointech/broker-cad';

export const StatusType = StatusType_Import;
// export const EventType = EventType_Import;
export type { UserVerifyData } from '@thecointech/broker-cad';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
export const GetUserVerificationApi = () => new UserVerificationApi(undefined, BrokerCADAddress);
export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetDirectTransferApi = () => new DirectTransferApi(undefined, BrokerCADAddress);
export const GetETransferApi = () => new ETransferApi(undefined, BrokerCADAddress);

export const GetSecureApi = () => new SecureApi(undefined, BrokerCADAddress);
export const GetReferrersApi = () => new ReferralsApi(undefined, BrokerCADAddress);
export const GetPluginsApi = () => new PluginsApi(undefined, BrokerCADAddress);
export const GetHarvesterApi = () => new HarvesterApi(undefined, BrokerCADAddress);
