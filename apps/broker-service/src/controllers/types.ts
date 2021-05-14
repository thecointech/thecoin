// Start moving types out of types project to where they are used.

import { SubscriptionData } from '@thecointech/broker-db/newsletter/types';

export interface ErrorResponse {
  error: string;
}
export interface ETransferCodeResponse {
  code: string;
}
export interface CertifiedTransferResponse {
  message: string;
  state?: string;
  hash?: string;
}

export interface SubscriptionDetails extends SubscriptionData {
  registerDate: number,
};
