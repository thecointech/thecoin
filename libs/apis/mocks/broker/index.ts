
import { SecureApi } from './SecureApi'
import { ReferralsApi }  from './ReferralsApi'
import { ETransferApi } from './ETransferApi';
import { BillPaymentsApi } from './BillPaymentsApi';
import { DirectTransferApi } from './DirectTransferApi';
import { StatusApi } from './StatusApi';
import { UserVerificationApi } from "./UserVerificationApi";
import { PluginsApi } from './PluginsApi';
import { HarvesterApi } from './HarvesterApi';
import type { TimeSource } from "@thecointech/utilities/TimeSource";
import { createServerTimeSource } from "../../src/broker/serverTimeSource";

export const GetUserVerificationApi = () => new UserVerificationApi();
export const GetStatusApi = () => new StatusApi();
export const GetBillPaymentsApi = () => new BillPaymentsApi();
export const GetDirectTransferApi = () => new DirectTransferApi();
export const GetETransferApi = () => new ETransferApi();
export const GetSecureApi = () => new SecureApi();
export const GetReferrersApi = () => new ReferralsApi();
export const GetPluginsApi = () => new PluginsApi();
export const GetHarvesterApi = () => new HarvesterApi();

export { StatusType } from './UserVerificationApi';
export { setAssignPluginFailure, type AssignPluginFailure } from './PluginsApi';

// Mimics the real ServerTimeSource (see live.ts), but just returns local
// time, since there's no real server clock to defer to in dev/tests.
export const ServerTimeSource: TimeSource = createServerTimeSource(async () => {
  const response = await GetStatusApi().timestamp();
  return response.data;
});
