// Start moving types out of types project to where they are used.

export interface ETransferCodeResponse {
  code?: string;
  error?: string;
}
export interface CertifiedTransferResponse {
  message: string;
  state?: string;
  hash?: string;
}
