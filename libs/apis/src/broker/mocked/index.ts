
import { SecureApi } from './SecureApi'
import { ReferralsApi }  from './ReferralsApi'
import { ETransferApi } from './ETransferApi';
import { BillPaymentsApi } from './BillPaymentsApi';
import { DirectTransferApi } from './DirectTransferApi';
import { StatusApi } from './StatusApi';
import { UserVerificationApi } from "./UserVerificationApi";
import { PluginsApi } from './PluginsApi';

export const GetUserVerificationApi = () => new UserVerificationApi();
export const GetStatusApi = () => new StatusApi();
export const GetBillPaymentsApi = () => new BillPaymentsApi();
export const GetDirectTransferApi = () => new DirectTransferApi();
export const GetETransferApi = () => new ETransferApi();
export const GetSecureApi = () => new SecureApi();
export const GetReferrersApi = () => new ReferralsApi();
export const GetPluginsApi = () => new PluginsApi();

export { StatusType } from './UserVerificationApi';
