import { DefaultApi, LandingApi, LoginApi, TwofaApi, IntentApi, ModalApi, SummaryApi, CreditDetailsApi, EtransferApi, Configuration, ConfigurationParameters } from "@thecointech/vqa";
import https from 'https';
import fs from 'fs';

// Create configuration object with optional certificate
const params: ConfigurationParameters = {
  basePath: process.env.URL_SERVICE_VQA
};
// The API -should- be locked down available remotely
if (process.env.VQA_API_KEY) {
  params.apiKey = process.env.VQA_API_KEY;
}

// Add certificate to config if provided
if (process.env.VQA_SSL_CERTIFICATE) {
  params.baseOptions = {
    httpsAgent: new https.Agent({
      ca: process.env.VQA_SSL_CERTIFICATE
    })
  };
}
const apiConfig = new Configuration(params);

export const GetBaseApi = () => new DefaultApi(apiConfig);
export const GetIntentApi = () => new IntentApi(apiConfig);
export const GetLandingApi = () => new LandingApi(apiConfig);
export const GetLoginApi = () => new LoginApi(apiConfig);
export const GetTwofaApi = () => new TwofaApi(apiConfig);
export const GetAccountSummaryApi = () => new SummaryApi(apiConfig);
export const GetCreditDetailsApi = () => new CreditDetailsApi(apiConfig);
export const GetETransferApi = () => new EtransferApi(apiConfig);
export const GetModalApi = () => new ModalApi(apiConfig);
