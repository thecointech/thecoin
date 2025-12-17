import { DefaultApi, LandingApi, LoginApi, TwofaApi, IntentApi, ModalApi, SummaryApi, CreditDetailsApi, EtransferApi, Configuration, ConfigurationParameters } from "@thecointech/vqa";
import https from 'https';
import { getSecret } from "@thecointech/secrets"

export const GetVqaBaseApi = async () => new DefaultApi(await getConfig());
export const GetIntentApi = async () => new IntentApi(await getConfig());
export const GetLandingApi = async () => new LandingApi(await getConfig());
export const GetLoginApi = async () => new LoginApi(await getConfig());
export const GetTwofaApi = async () => new TwofaApi(await getConfig());
export const GetAccountSummaryApi = async () => new SummaryApi(await getConfig());
export const GetCreditDetailsApi = async () => new CreditDetailsApi(await getConfig());
export const GetETransferApi = async () => new EtransferApi(await getConfig());
export const GetModalApi = async () => new ModalApi(await getConfig());

export const getConfig = async () => {
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
  return new Configuration(params);
}
