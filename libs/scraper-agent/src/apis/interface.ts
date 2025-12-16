import type { IntentApi, ModalApi, TwofaApi, EtransferApi, LoginApi, DefaultApi, LandingApi, CreditDetailsApi, SummaryApi } from "@thecointech/vqa";

export interface IApiFactory {
  getVqaBaseApi(): Promise<DefaultApi>;
  getIntentApi(): Promise<IntentApi>;
  getModalApi(): Promise<ModalApi>;

  getLandingApi(): Promise<LandingApi>;
  getLoginApi(): Promise<LoginApi>;
  getTwofaApi(): Promise<TwofaApi>;

  getAccountSummaryApi(): Promise<SummaryApi>;
  getCreditDetailsApi(): Promise<CreditDetailsApi>;
  getETransferApi(): Promise<EtransferApi>;
}
