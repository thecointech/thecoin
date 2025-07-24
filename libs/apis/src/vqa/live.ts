import { DefaultApi, LandingApi, LoginApi, TwofaApi, IntentApi, ModalApi, SummaryApi, CreditDetailsApi, EtransferApi, Configuration, ConfigurationParameters } from "@thecointech/vqa";
import https from 'https';
import { getSecret } from "@thecointech/secrets"

// Create configuration object with optional certificate
const params: ConfigurationParameters = {
  basePath: process.env.URL_SERVICE_VQA
};
// The API -should- be locked down available remotely
const apiKey = await getSecret("VqaApiKey")
if (apiKey) {
  params.apiKey = apiKey;
}

// Add certificate to config if provided
const cert = await getSecret("VqaSslCertPublic")
if (cert) {
  params.baseOptions = {
    httpsAgent: new https.Agent({
      ca: cert
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
