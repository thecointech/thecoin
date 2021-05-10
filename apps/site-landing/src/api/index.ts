import { NewsletterApi } from '@thecointech/broker-cad';
import { MockNewsletterApi } from './mock/newsletter';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;
const NoDatabase = (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')
                    && process.env.SETTINGS !== 'live';

export const GetNewsletterApi = () =>
  NoDatabase
    ? new MockNewsletterApi()
    : new NewsletterApi(undefined, BrokerCADAddress);
