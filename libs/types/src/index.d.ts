/**
 * This file was auto-generated by swagger-to-ts.
 * Do not make direct changes to the file.
 */

export interface SignedMessage {
  message: string;
  signature: string;
}
export interface GoogleWalletItem {
  id: GoogleFileIdent;
  wallet?: string;
}
export interface GoogleToken {
  token: string;
}
export interface GoogleStoreAccount {
  token: GoogleToken;
  wallet: string;
  walletName: string;
}
export interface GoogleListResult {
  wallets: GoogleFileIdent[];
}
export interface GoogleGetResult {
  wallets: GoogleWalletItem[];
}
export interface GoogleFileIdent {
  id: string;
  name?: string;
  type?: string;
}
export interface GoogleAuthUrl {
  url: string;
}
export interface ETransferPacket {
  email: string;
  question: string;
  answer: string;
  message?: string;
}
export interface EncryptedPacket {
  encryptedPacket: string;
  version: string;
}

export interface CertifiedTransferRequest {
  from: string;
  to: string;
  value: number;
  fee: number;
  timestamp: number;
  signature: string;
}
export interface CertifiedTransfer {
  transfer: CertifiedTransferRequest;
  instructionPacket: EncryptedPacket;
  signature: string;
}
export interface BrokerStatus {
  address: string;
  certifiedFee: number;
}
export interface BillPayeePacket {
  payee: string;
  accountNumber: string;
}
