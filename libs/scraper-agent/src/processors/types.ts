import type { PageHandler } from "../pageHandler";
import type { IAskUser } from "../types";
export type { IAskUser };

export enum Section {
  CookieBanner = "CookieBanner",
  Landing = "Landing",
  Login = "Login",
  TwoFA = "TwoFA",
  AccountsSummary = "AccountsSummary",
  CreditAccountDetails = "CreditAccountDetails",
  SendETransfer = "SendETransfer",
}
export type SectionType = keyof typeof Section;
export const sections = Object.values(Section).filter(v => typeof v === 'string') as SectionType[];

export type SectionProgressCallback = (sectionPercent: number) => void;

export type Processor<Args extends any[], R> = (page: PageHandler, progress: SectionProgressCallback, ...args: Args) => Promise<R>;
export interface NamedProcessor<Args extends any[], R> extends Processor<Args, R> {
  processorName: SectionType,
  isolated?: boolean
}

export function processorFn<Args extends any[], R>(name: SectionType, action: Processor<Args, R>, isolated: boolean = false) : NamedProcessor<Args, R> {
  Object.defineProperty(action, 'processorName', { value: name, writable: false });
  Object.defineProperty(action, 'isolated', { value: isolated, writable: false });
  return action as NamedProcessor<Args, R>;
}
