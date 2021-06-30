import { NewsletterApi } from '@thecointech/broker-cad';

const BrokerCADAddress = process.env.URL_SERVICE_BROKER;

export const GetNewsletterApi = () => new NewsletterApi(undefined, BrokerCADAddress);
