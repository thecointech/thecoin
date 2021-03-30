import { NewsletterApi } from '@thecointech/broker-cad';
import { ServiceAddress, Service } from '@thecointech/utilities/ServiceAddresses';
import { MockNewsletterApi } from './mock/newsletter';

const BrokerCADAddress = ServiceAddress(Service.BROKER);

const NoDatabase = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')
                    && process.env.SETTINGS !== 'live';

export const GetNewsletterApi = () =>
  NoDatabase
    ? new MockNewsletterApi()
    : new NewsletterApi(undefined, BrokerCADAddress);
