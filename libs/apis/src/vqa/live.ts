import { LandingApi, LoginApi, TwofaApi, IntentApi, ModalApi, SummaryApi } from "@thecointech/vqa";

export const GetIntentApi = () => new IntentApi(undefined, process.env.URL_SERVICE_VQA);
export const GetLandingApi = () => new LandingApi(undefined, process.env.URL_SERVICE_VQA);
export const GetLoginApi = () => new LoginApi(undefined, process.env.URL_SERVICE_VQA);
export const GetTwofaApi = () => new TwofaApi(undefined, process.env.URL_SERVICE_VQA);
export const GetAccountSummaryApi = () => new SummaryApi(undefined, process.env.URL_SERVICE_VQA);
export const GetModalApi = () => new ModalApi(undefined, process.env.URL_SERVICE_VQA);
