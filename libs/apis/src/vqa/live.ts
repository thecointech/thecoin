import { LandingApi, LoginApi, TwofaApi, IntentApi, ModalApi, SummaryApi, CreditDetailsApi, EtransferApi } from "@thecointech/vqa";

export const GetIntentApi = () => new IntentApi(undefined, process.env.URL_SERVICE_VQA);
export const GetLandingApi = () => new LandingApi(undefined, process.env.URL_SERVICE_VQA);
export const GetLoginApi = () => new LoginApi(undefined, process.env.URL_SERVICE_VQA);
export const GetTwofaApi = () => new TwofaApi(undefined, process.env.URL_SERVICE_VQA);
export const GetAccountSummaryApi = () => new SummaryApi(undefined, process.env.URL_SERVICE_VQA);
export const GetCreditDetailsApi = () => new CreditDetailsApi(undefined, process.env.URL_SERVICE_VQA);
export const GetETransferApi = () => new EtransferApi(undefined, process.env.URL_SERVICE_VQA);
export const GetModalApi = () => new ModalApi(undefined, process.env.URL_SERVICE_VQA);
