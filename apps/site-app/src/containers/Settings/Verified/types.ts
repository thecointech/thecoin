import { AccountDetails } from '@thecointech/account/details';

export type PropsVerified={
  address: string;
  details: AccountDetails;
  forceVerify?: boolean;
  readonly?: boolean;
}
