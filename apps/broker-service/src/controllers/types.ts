// Start moving types out of types project to where they are used.

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
