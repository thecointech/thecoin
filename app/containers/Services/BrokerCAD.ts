import { StatusApi, BillPaymentsApi, ReferrersApi, TransferApi, SellApi, PurchaseApi } from '@the-coin/broker-cad'
import { ServiceAddress, ServicePorts } from '@the-coin/utilities/lib/ServiceAddresses'

const BrokerCADAddress = ServiceAddress(ServicePorts.BROKER_PORT);

// Javascript/typescript is a terrible language...
//const orig_constructor = BaseAPI.prototype.constructor;
//BaseAPI.prototype.constructor = (...args) => orig_constructor(args[0], BrokerCADAddress, ...args)

export const GetStatusApi = () => new StatusApi(undefined, BrokerCADAddress);
export const GetBillPaymentsApi = () => new BillPaymentsApi(undefined, BrokerCADAddress);
export const GetReferrersApi = () => new ReferrersApi(undefined, BrokerCADAddress);
export const GetTransferApi = () => new TransferApi(undefined, BrokerCADAddress);
export const GetSellApi = () => new SellApi(undefined, BrokerCADAddress);
export const GetPurchaseApi = () => new PurchaseApi(undefined, BrokerCADAddress);