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
import { createGaeServiceProxy } from "../resilience";

export const StatusType = StatusType_Import;
// export const EventType = EventType_Import;
export type { UserVerifyData } from '@thecointech/broker-cad';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
export const GetUserVerificationApi = () => createGaeServiceProxy(new UserVerificationApi(undefined, BrokerCADAddress));
export const GetStatusApi = () => createGaeServiceProxy(new StatusApi(undefined, BrokerCADAddress));
export const GetBillPaymentsApi = () => createGaeServiceProxy(new BillPaymentsApi(undefined, BrokerCADAddress));
export const GetDirectTransferApi = () => createGaeServiceProxy(new DirectTransferApi(undefined, BrokerCADAddress));
export const GetETransferApi = () => createGaeServiceProxy(new ETransferApi(undefined, BrokerCADAddress));

export const GetSecureApi = () => createGaeServiceProxy(new SecureApi(undefined, BrokerCADAddress));
export const GetReferrersApi = () => createGaeServiceProxy(new ReferralsApi(undefined, BrokerCADAddress));
export const GetPluginsApi = () => createGaeServiceProxy(new PluginsApi(undefined, BrokerCADAddress));
export const GetHarvesterApi = () => createGaeServiceProxy(new HarvesterApi(undefined, BrokerCADAddress));
